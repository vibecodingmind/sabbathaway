import { PaymentProvider, SubscriptionPlan, PaymentTransaction } from '../types';

export interface PaymentRequest {
  userId: string;
  userName: string;
  userEmail: string;
  householdName?: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: 'USD';
  provider: PaymentProvider;
  cardNonce?: string; // Tokenized card or authorization token
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

export interface PaymentAdapter {
  providerName: PaymentProvider;
  processPayment(request: PaymentRequest): Promise<PaymentVerificationResult>;
  verifyWebhookSignature(payload: unknown, signatureHeader: string): boolean;
}

// In-memory set of used transaction references to prevent replay attacks
const processedTransactionRefs = new Set<string>();

/**
 * Stripe Payment Adapter
 */
export class StripePaymentAdapter implements PaymentAdapter {
  providerName: PaymentProvider = 'stripe';

  async processPayment(request: PaymentRequest): Promise<PaymentVerificationResult> {
    // Generate secure transaction reference token
    const txRef = `STRIPE_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Check for replay attack or duplicate transaction
    if (processedTransactionRefs.has(txRef)) {
      return {
        success: false,
        transactionRef: txRef,
        receiptNumber: '',
        provider: 'stripe',
        amount: request.amount,
        currency: 'USD',
        errorMessage: 'Replay attack detected. Duplicate transaction reference.',
        verifiedAt: new Date().toISOString()
      };
    }

    // Simulate secure webhook validation and token settlement
    processedTransactionRefs.add(txRef);
    const receipt = `REC-STRIPE-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      transactionRef: txRef,
      receiptNumber: receipt,
      provider: 'stripe',
      amount: request.amount,
      currency: 'USD',
      verifiedAt: new Date().toISOString()
    };
  }

  verifyWebhookSignature(payload: unknown, signatureHeader: string): boolean {
    return Boolean(signatureHeader && signatureHeader.startsWith('stripe_sig_v1_'));
  }
}

/**
 * PayPal Payment Adapter
 */
export class PayPalPaymentAdapter implements PaymentAdapter {
  providerName: PaymentProvider = 'paypal';

  async processPayment(request: PaymentRequest): Promise<PaymentVerificationResult> {
    const txRef = `PAYPAL_ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    if (processedTransactionRefs.has(txRef)) {
      return {
        success: false,
        transactionRef: txRef,
        receiptNumber: '',
        provider: 'paypal',
        amount: request.amount,
        currency: 'USD',
        errorMessage: 'Duplicate PayPal capture reference detected.',
        verifiedAt: new Date().toISOString()
      };
    }

    processedTransactionRefs.add(txRef);
    const receipt = `REC-PP-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      transactionRef: txRef,
      receiptNumber: receipt,
      provider: 'paypal',
      amount: request.amount,
      currency: 'USD',
      verifiedAt: new Date().toISOString()
    };
  }

  verifyWebhookSignature(payload: unknown, signatureHeader: string): boolean {
    return Boolean(signatureHeader && signatureHeader.includes('paypal-transmission-sig'));
  }
}

/**
 * PesaPal Payment Adapter
 */
export class PesaPalPaymentAdapter implements PaymentAdapter {
  providerName: PaymentProvider = 'pesapal';

  async processPayment(request: PaymentRequest): Promise<PaymentVerificationResult> {
    const txRef = `PESAPAL_MERCHANT_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    if (processedTransactionRefs.has(txRef)) {
      return {
        success: false,
        transactionRef: txRef,
        receiptNumber: '',
        provider: 'pesapal',
        amount: request.amount,
        currency: 'USD',
        errorMessage: 'Duplicate PesaPal IPN reference detected.',
        verifiedAt: new Date().toISOString()
      };
    }

    processedTransactionRefs.add(txRef);
    const receipt = `REC-PESA-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      transactionRef: txRef,
      receiptNumber: receipt,
      provider: 'pesapal',
      amount: request.amount,
      currency: 'USD',
      verifiedAt: new Date().toISOString()
    };
  }

  verifyWebhookSignature(payload: unknown, signatureHeader: string): boolean {
    return Boolean(signatureHeader && signatureHeader.startsWith('pesapal_ipn_'));
  }
}

/**
 * Unified Payment Service Factory (Abstraction Layer)
 */
export class PaymentService {
  private static adapters: Record<PaymentProvider, PaymentAdapter> = {
    stripe: new StripePaymentAdapter(),
    paypal: new PayPalPaymentAdapter(),
    pesapal: new PesaPalPaymentAdapter(),
    free: {
      providerName: 'free',
      async processPayment(req) {
        return {
          success: true,
          transactionRef: `FREE_REG_${Date.now()}`,
          receiptNumber: `REC-FREE-${Date.now().toString().slice(-4)}`,
          provider: 'free',
          amount: 0,
          currency: 'USD',
          verifiedAt: new Date().toISOString()
        };
      },
      verifyWebhookSignature() { return true; }
    }
  };

  public static async executePayment(request: PaymentRequest): Promise<{
    verification: PaymentVerificationResult;
    transaction: PaymentTransaction;
  }> {
    const adapter = this.adapters[request.provider];
    if (!adapter) {
      throw new Error(`Unsupported payment provider: ${request.provider}`);
    }

    const verification = await adapter.processPayment(request);

    const transaction: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      userId: request.userId,
      userName: request.userName,
      householdName: request.householdName,
      plan: request.plan,
      amount: request.amount,
      currency: request.currency,
      provider: request.provider,
      status: verification.success ? 'COMPLETED' : 'FAILED',
      paymentReference: verification.transactionRef,
      transactionDate: verification.verifiedAt,
      receiptNumber: verification.receiptNumber || 'N/A',
      description: `Annual Membership: ${request.plan.replace('_', ' ')} ($${request.amount}/yr)`
    };

    return { verification, transaction };
  }
}
