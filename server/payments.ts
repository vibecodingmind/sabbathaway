import Stripe from 'stripe';

export type PaymentProvider = 'stripe' | 'paypal' | 'pesapal' | 'free';
export type SubscriptionPlan = 'FREE' | 'SABBATH_MEMBER' | 'FAMILY_EXCHANGE' | 'GLOBAL_FAMILY';

export interface PaymentRequest {
  userId: string;
  userName: string;
  userEmail: string;
  householdName?: string;
  coveredMembers?: string[];
  plan: SubscriptionPlan;
  amount: number;
  currency: 'USD';
  provider: PaymentProvider;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionRef: string;
  receiptNumber: string;
  provider: PaymentProvider;
  amount: number;
  currency: 'USD';
  errorMessage?: string;
  verifiedAt: string;
}

export interface CheckoutSessionResult {
  mode: 'checkout';
  checkoutUrl: string;
  sessionId: string;
  provider: 'stripe';
  amount: number;
  plan: SubscriptionPlan;
}

export interface InstantPaymentResult {
  mode: 'instant';
  verification: PaymentVerificationResult;
  transaction: {
    userId: string;
    userName: string;
    householdName?: string;
    plan: SubscriptionPlan;
    amount: number;
    currency: 'USD';
    provider: PaymentProvider;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    paymentReference: string;
    transactionDate: string;
    receiptNumber: string;
    description: string;
  };
}

export type PaymentExecutionResult = CheckoutSessionResult | InstantPaymentResult;

export const PLAN_PRICING: Record<string, number> = {
  FREE: 0,
  SABBATH_MEMBER: 39,
  FAMILY_EXCHANGE: 59,
  GLOBAL_FAMILY: 79,
};

export const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free Explorer',
  SABBATH_MEMBER: 'Sabbath Member',
  FAMILY_EXCHANGE: 'Family Exchange',
  GLOBAL_FAMILY: 'Global Family',
};

export function calculateExpirationDate(startDateISO?: string): string {
  const start = startDateISO ? new Date(startDateISO) : new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  return end.toISOString();
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_')) return null;
  return new Stripe(key);
}

function buildInstantResult(
  request: PaymentRequest,
  status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'COMPLETED',
  errorMessage?: string
): InstantPaymentResult {
  const provider = request.provider || 'stripe';
  const prefix =
    provider === 'paypal'
      ? 'PAYPAL_ORDER'
      : provider === 'pesapal'
        ? 'PESAPAL_MERCHANT'
        : provider === 'free'
          ? 'FREE_REG'
          : 'STRIPE_TX';

  const txRef = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const receipt = `REC-${provider.toUpperCase().slice(0, 6)}-${Date.now().toString().slice(-6)}`;
  const verifiedAt = new Date().toISOString();

  return {
    mode: 'instant',
    verification: {
      success: status !== 'FAILED',
      transactionRef: txRef,
      receiptNumber: receipt,
      provider,
      amount: request.amount,
      currency: 'USD',
      errorMessage,
      verifiedAt,
    },
    transaction: {
      userId: request.userId,
      userName: request.userName,
      householdName: request.householdName,
      plan: request.plan,
      amount: request.amount,
      currency: 'USD',
      provider,
      status,
      paymentReference: txRef,
      transactionDate: verifiedAt,
      receiptNumber: receipt,
      description: `Annual Membership: ${String(request.plan).replace(/_/g, ' ')} ($${request.amount}/yr)`,
    },
  };
}

/**
 * Executes membership payment.
 * - FREE / amount 0 → instant free activation
 * - Stripe + STRIPE_SECRET_KEY → Checkout Session (caller redirects)
 * - Otherwise → simulated instant settlement for local/demo
 */
export async function executePayment(request: PaymentRequest): Promise<PaymentExecutionResult> {
  if (request.plan === 'FREE' || request.amount <= 0 || request.provider === 'free') {
    return buildInstantResult({ ...request, provider: 'free', amount: 0 });
  }

  if (request.provider === 'stripe' && isStripeConfigured()) {
    const stripe = getStripe();
    if (!stripe) {
      return buildInstantResult(request, 'FAILED', 'Stripe is misconfigured');
    }

    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const members = request.coveredMembers?.length
      ? request.coveredMembers.join(', ')
      : request.userName;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: request.userEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(request.amount * 100),
            product_data: {
              name: `AdventistStay ${PLAN_LABELS[request.plan] || request.plan}`,
              description:
                'Annual platform membership. Hospitality stays remain free between members.',
            },
          },
        },
      ],
      success_url: `${appUrl}/?membership=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?membership=cancelled`,
      metadata: {
        userId: request.userId,
        plan: request.plan,
        householdName: request.householdName || `${request.userName} Household`,
        coveredMembers: members,
        amount: String(request.amount),
      },
    });

    if (!session.url) {
      return buildInstantResult(request, 'FAILED', 'Stripe Checkout session missing URL');
    }

    return {
      mode: 'checkout',
      checkoutUrl: session.url,
      sessionId: session.id,
      provider: 'stripe',
      amount: request.amount,
      plan: request.plan,
    };
  }

  // Demo / local adapters for PayPal, PesaPal, or Stripe without keys
  return buildInstantResult(request);
}

export async function fulfillStripeCheckoutSession(session: Stripe.Checkout.Session): Promise<{
  userId: string;
  plan: SubscriptionPlan;
  paymentReference: string;
  amount: number;
  householdName: string;
  coveredMembers: string[];
} | null> {
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return null;
  }

  const meta = session.metadata || {};
  const userId = meta.userId;
  const plan = meta.plan as SubscriptionPlan;
  if (!userId || !plan) return null;

  return {
    userId,
    plan,
    paymentReference: session.id,
    amount: Number(meta.amount || PLAN_PRICING[plan] || 0),
    householdName: meta.householdName || 'Household',
    coveredMembers: (meta.coveredMembers || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
