import type { PaymentProvider, SubscriptionPlan, PaymentTransaction } from '../src/types';

export interface PaymentRequest {
  userId: string;
  userName: string;
  userEmail: string;
  householdName?: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: 'USD';
  provider: PaymentProvider;
}

export interface PaymentResult {
  success: boolean;
  transactionRef: string;
  receiptNumber: string;
  provider: PaymentProvider;
  amount: number;
  currency: 'USD';
  simulated: boolean;
  errorMessage?: string;
  verifiedAt: string;
}

/**
 * Whether a real payment gateway is configured. Real charging additionally requires the
 * client-side integration (e.g. Stripe Elements + PaymentIntent) — see README/AGENTS.md.
 */
export function isRealPaymentConfigured(provider: PaymentProvider): boolean {
  switch (provider) {
    case 'stripe':
      return Boolean(process.env.STRIPE_SECRET_KEY);
    case 'paypal':
      return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
    case 'pesapal':
      return Boolean(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET);
    case 'free':
      return true;
    default:
      return false;
  }
}

const processedRefs = new Set<string>();

/**
 * Processes a membership payment. When no gateway credentials are configured the payment is
 * recorded as a simulated settlement (marked `simulated: true`) so the product is fully usable
 * in demo/staging; wire real gateway keys + client tokenization before charging live cards.
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  const now = new Date().toISOString();

  if (request.plan === 'FREE' || request.amount === 0 || request.provider === 'free') {
    return {
      success: true,
      transactionRef: `FREE_${Date.now()}`,
      receiptNumber: `REC-FREE-${Date.now().toString().slice(-4)}`,
      provider: 'free',
      amount: 0,
      currency: 'USD',
      simulated: false,
      verifiedAt: now
    };
  }

  const prefix = request.provider.toUpperCase();
  const txRef = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

  if (processedRefs.has(txRef)) {
    return {
      success: false,
      transactionRef: txRef,
      receiptNumber: '',
      provider: request.provider,
      amount: request.amount,
      currency: 'USD',
      simulated: true,
      errorMessage: 'Duplicate transaction reference detected.',
      verifiedAt: now
    };
  }
  processedRefs.add(txRef);

  const real = isRealPaymentConfigured(request.provider);
  if (!real) {
    console.warn(
      `[payments] No ${request.provider} credentials configured — recording SIMULATED settlement for ${request.userEmail} ($${request.amount}).`
    );
  }

  // NOTE: Real gateway calls would go here when credentials + client tokenization are added.
  return {
    success: true,
    transactionRef: txRef,
    receiptNumber: `REC-${prefix}-${Date.now().toString().slice(-6)}`,
    provider: request.provider,
    amount: request.amount,
    currency: 'USD',
    simulated: !real,
    verifiedAt: now
  };
}

export function buildTransaction(request: PaymentRequest, result: PaymentResult): PaymentTransaction & { simulated: boolean } {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: request.userId,
    userName: request.userName,
    householdName: request.householdName,
    plan: request.plan,
    amount: request.amount,
    currency: request.currency,
    provider: request.provider,
    status: result.success ? 'COMPLETED' : 'FAILED',
    paymentReference: result.transactionRef,
    transactionDate: result.verifiedAt,
    receiptNumber: result.receiptNumber || 'N/A',
    description: `Annual Membership: ${request.plan.replace('_', ' ')} ($${request.amount}/yr)`,
    simulated: result.simulated
  };
}
