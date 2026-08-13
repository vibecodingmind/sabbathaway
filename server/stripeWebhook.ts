import type { Request, Response } from 'express';
import { prisma } from './db.js';
import {
  getStripe,
  fulfillStripeCheckoutSession,
  calculateExpirationDate,
  PLAN_PRICING,
} from './payments.js';
import { notifyMembershipActivated } from './notifications.js';
import { writeAuditLog } from './auth.js';

export async function stripeWebhookHandler(req: Request, res: Response) {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe is not configured' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ error: 'STRIPE_WEBHOOK_SECRET is not set' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session;
      const fulfilled = await fulfillStripeCheckoutSession(session);
      if (!fulfilled) {
        return res.json({ received: true, skipped: true });
      }

      // Idempotency: skip if this session was already recorded
      const existingTx = await prisma.paymentTransaction.findFirst({
        where: { paymentReference: fulfilled.paymentReference },
      });
      if (existingTx) {
        return res.json({ received: true, duplicate: true });
      }

      const user = await prisma.user.findUnique({ where: { id: fulfilled.userId } });
      if (!user) {
        return res.json({ received: true, missingUser: true });
      }

      const now = new Date().toISOString();
      const expirationDate = calculateExpirationDate(now);
      const members =
        fulfilled.coveredMembers.length > 0 ? fulfilled.coveredMembers : [user.name];

      await prisma.membership.deleteMany({ where: { userId: user.id } });
      await prisma.membership.create({
        data: {
          userId: user.id,
          userName: user.name,
          householdName: fulfilled.householdName,
          coveredMembersJson: JSON.stringify(members),
          plan: fulfilled.plan,
          price: fulfilled.amount || PLAN_PRICING[fulfilled.plan] || 0,
          currency: 'USD',
          startDate: now,
          expirationDate,
          paymentReference: fulfilled.paymentReference,
          paymentProvider: 'stripe',
          status: 'ACTIVE',
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          userName: user.name,
          householdName: fulfilled.householdName,
          plan: fulfilled.plan,
          amount: fulfilled.amount || PLAN_PRICING[fulfilled.plan] || 0,
          currency: 'USD',
          provider: 'stripe',
          status: 'COMPLETED',
          paymentReference: fulfilled.paymentReference,
          transactionDate: now,
          receiptNumber: `REC-STRIPE-${Date.now().toString().slice(-6)}`,
          description: `Annual Membership: ${fulfilled.plan.replace(/_/g, ' ')} (Stripe Checkout)`,
        },
      });

      await writeAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'MEMBERSHIP_STRIPE_FULFILLED',
        details: `Stripe Checkout session ${fulfilled.paymentReference} activated ${fulfilled.plan}`,
      });

      await notifyMembershipActivated({
        email: user.email,
        name: user.name,
        plan: fulfilled.plan,
        expirationDate,
      });
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
