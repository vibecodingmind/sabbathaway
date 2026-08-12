export type PaymentProvider = 'stripe' | 'paypal' | 'pesapal' | 'free';
export type SubscriptionPlan = 'FREE' | 'SABBATH_MEMBER' | 'FAMILY_EXCHANGE' | 'GLOBAL_FAMILY';

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

/**
 * Payment adapters — currently settlement-simulated for local/dev.
 * When STRIPE_SECRET_KEY (etc.) is set, replace processPayment with real SDK calls.
 */
export async function executePayment(request: PaymentRequest): Promise<{
  verification: PaymentVerificationResult;
  transaction: {
    userId: string;
    userName: string;
    householdName?: string;
    plan: SubscriptionPlan;
    amount: number;
    currency: 'USD';
    provider: PaymentProvider;
    status: 'COMPLETED' | 'FAILED';
    paymentReference: string;
    transactionDate: string;
    receiptNumber: string;
    description: string;
  };
}> {
  const provider = request.provider || 'stripe';
  const prefix =
    provider === 'paypal' ? 'PAYPAL_ORDER' :
    provider === 'pesapal' ? 'PESAPAL_MERCHANT' :
    provider === 'free' ? 'FREE_REG' : 'STRIPE_TX';

  const txRef = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const receipt = `REC-${provider.toUpperCase().slice(0, 6)}-${Date.now().toString().slice(-6)}`;
  const verifiedAt = new Date().toISOString();

  // Hook for real Stripe: if STRIPE_SECRET_KEY is present and provider is stripe,
  // integrate stripe.paymentIntents.create here.
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  if (provider === 'stripe' && stripeConfigured && request.amount > 0) {
    // Placeholder path until Stripe SDK is wired with client PaymentIntents.
    // Still records a completed membership payment for platform access.
  }

  const verification: PaymentVerificationResult = {
    success: true,
    transactionRef: txRef,
    receiptNumber: receipt,
    provider,
    amount: request.amount,
    currency: 'USD',
    verifiedAt,
  };

  return {
    verification,
    transaction: {
      userId: request.userId,
      userName: request.userName,
      householdName: request.householdName,
      plan: request.plan,
      amount: request.amount,
      currency: 'USD',
      provider,
      status: 'COMPLETED',
      paymentReference: txRef,
      transactionDate: verifiedAt,
      receiptNumber: receipt,
      description: `Annual Membership: ${String(request.plan).replace(/_/g, ' ')} ($${request.amount}/yr)`,
    },
  };
}

export function calculateExpirationDate(startDateISO?: string): string {
  const start = startDateISO ? new Date(startDateISO) : new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  return end.toISOString();
}

export const PLAN_PRICING: Record<string, number> = {
  FREE: 0,
  SABBATH_MEMBER: 39,
  FAMILY_EXCHANGE: 59,
  GLOBAL_FAMILY: 79,
};
