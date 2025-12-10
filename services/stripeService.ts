"use server";

import Stripe from 'stripe';

// Initialize Stripe with secret key (lazy initialization to avoid build errors)
const getStripe = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.');
    }
    return new Stripe(secretKey, {
        apiVersion: '2025-11-17.clover',
    });
};

export interface CreateCheckoutSessionParams {
    jobId: string;
    amount: number; // in cents
    currency?: string;
    customerEmail: string;
    customerName: string;
    serviceName: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CreatePayoutParams {
    providerId: string;
    amount: number; // in cents
    currency?: string;
}

/**
 * Create a Stripe Checkout session for a booking payment
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
    const {
        jobId,
        amount,
        currency = 'eur',
        customerEmail,
        customerName,
        serviceName,
        successUrl,
        cancelUrl,
    } = params;

    try {
        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: customerEmail,
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: serviceName,
                            description: `Serviço de limpeza - Job #${jobId}`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                jobId,
                customerName,
            },
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
        });

        return { sessionId: session.id, url: session.url };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

/**
 * Retrieve a checkout session to verify payment
 */
export async function getCheckoutSession(sessionId: string) {
    try {
        const session = await getStripe().checkout.sessions.retrieve(sessionId);
        return {
            id: session.id,
            paymentStatus: session.payment_status,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total,
            currency: session.currency,
            metadata: session.metadata,
        };
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        throw error;
    }
}

/**
 * Create a PaymentIntent for more control over the payment flow
 */
export async function createPaymentIntent(amount: number, currency: string = 'eur', metadata?: Record<string, string>) {
    try {
        const paymentIntent = await getStripe().paymentIntents.create({
            amount,
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

/**
 * Handle refund for a payment
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
    try {
        const refund = await getStripe().refunds.create({
            payment_intent: paymentIntentId,
            amount: amount, // If undefined, refunds the entire amount
        });

        return {
            id: refund.id,
            status: refund.status,
            amount: refund.amount,
        };
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
}
