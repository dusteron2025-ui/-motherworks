import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY not configured');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
}) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Create admin Supabase client for database operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(request: NextRequest) {
    // Check if Stripe is configured
    if (!stripe) {
        return NextResponse.json(
            { error: 'Stripe not configured' },
            { status: 500 }
        );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        if (webhookSecret && signature) {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } else {
            // Dev mode without webhook secret - ONLY for testing
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json(
                    { error: 'Webhook signature required in production' },
                    { status: 400 }
                );
            }
            event = JSON.parse(body) as Stripe.Event;
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Webhook signature verification failed:', errorMessage);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentSuccess(paymentIntent);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentFailed(paymentIntent);
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                await handleRefund(charge);
                break;
            }

            default:
                // Log unhandled events only in development
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`Unhandled event type: ${event.type}`);
                }
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error processing webhook:', errorMessage);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}

// Handle successful checkout
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const jobId = session.metadata?.jobId;
    const providerId = session.metadata?.providerId;
    const amount = session.amount_total || 0;
    const amountInEuros = amount / 100;

    if (!jobId || !supabaseAdmin) {
        console.error('Missing jobId or Supabase client');
        return;
    }

    // Update job status to PAID
    const { error: jobError } = await supabaseAdmin
        .from('jobs')
        .update({
            status: 'PAID',
            updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

    if (jobError) {
        console.error('Failed to update job status:', jobError.message);
    }

    // Add funds to provider wallet (as pending)
    if (providerId) {
        // Get or create wallet
        let { data: wallet } = await supabaseAdmin
            .from('wallets')
            .select('id, pending_balance')
            .eq('user_id', providerId)
            .single();

        if (!wallet) {
            // Create wallet
            const { data: newWallet, error: createError } = await supabaseAdmin
                .from('wallets')
                .insert({
                    user_id: providerId,
                    balance: 0,
                    pending_balance: 0
                })
                .select()
                .single();

            if (createError || !newWallet) {
                console.error('Failed to create wallet:', createError?.message);
                return;
            }
            wallet = newWallet;
        }

        // Verify wallet exists before using
        if (!wallet) {
            console.error('Wallet is null after creation attempt');
            return;
        }

        // Calculate provider payout (80% after platform fee)
        const platformFeePercent = 20;
        const providerPayout = amountInEuros * (1 - platformFeePercent / 100);

        // Update pending balance
        await supabaseAdmin
            .from('wallets')
            .update({
                pending_balance: (wallet.pending_balance ?? 0) + providerPayout,
                updated_at: new Date().toISOString()
            })
            .eq('id', wallet.id);

        // Create transaction record
        await supabaseAdmin
            .from('wallet_transactions')
            .insert({
                wallet_id: wallet.id,
                type: 'CREDIT',
                amount: providerPayout,
                status: 'PENDING',
                description: `Pagamento do serviço #${jobId.slice(0, 8)}`,
                job_id: jobId
            });
    }

    // Create notification for provider
    if (providerId) {
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: providerId,
                type: 'PAYMENT_RECEIVED',
                title: 'Pagamento recebido!',
                message: `Um pagamento de €${amountInEuros.toFixed(2)} foi recebido e está pendente de liberação.`,
                data: { jobId, amount: amountInEuros },
                read: false
            });
    }
}

// Handle successful payment intent
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Payment intent succeeded - could be used for additional logging
    if (process.env.NODE_ENV !== 'production') {
        console.log('PaymentIntent succeeded:', paymentIntent.id);
    }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const clientId = paymentIntent.metadata?.clientId;
    const jobId = paymentIntent.metadata?.jobId;

    if (clientId && supabaseAdmin) {
        // Notify client of failed payment
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: clientId,
                type: 'PAYMENT_FAILED',
                title: 'Falha no pagamento',
                message: 'Seu pagamento não foi processado. Por favor, tente novamente.',
                data: { jobId, paymentIntentId: paymentIntent.id },
                read: false
            });
    }

    console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
}

// Handle refund
async function handleRefund(charge: Stripe.Charge) {
    const jobId = charge.metadata?.jobId;
    const providerId = charge.metadata?.providerId;
    const refundAmount = (charge.amount_refunded || 0) / 100;

    if (!supabaseAdmin) return;

    // Update job status
    if (jobId) {
        await supabaseAdmin
            .from('jobs')
            .update({
                status: 'CANCELLED',
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);
    }

    // Deduct from provider wallet
    if (providerId) {
        const { data: wallet } = await supabaseAdmin
            .from('wallets')
            .select('id, balance, pending_balance')
            .eq('user_id', providerId)
            .single();

        if (wallet && supabaseAdmin) {
            // Calculate provider portion of refund
            const platformFeePercent = 20;
            const providerDeduction = refundAmount * (1 - platformFeePercent / 100);

            // Deduct from pending first, then from balance
            let newPending = (wallet.pending_balance ?? 0) - providerDeduction;
            let newBalance = wallet.balance ?? 0;

            if (newPending < 0) {
                newBalance += newPending; // newPending is negative
                newPending = 0;
            }

            await supabaseAdmin
                .from('wallets')
                .update({
                    balance: Math.max(0, newBalance),
                    pending_balance: Math.max(0, newPending),
                    updated_at: new Date().toISOString()
                })
                .eq('id', wallet.id);

            // Create transaction record
            await supabaseAdmin
                .from('wallet_transactions')
                .insert({
                    wallet_id: wallet.id,
                    type: 'REFUND',
                    amount: -providerDeduction,
                    status: 'COMPLETED',
                    description: `Reembolso do serviço #${jobId?.slice(0, 8) || 'N/A'}`,
                    job_id: jobId
                });
        }
    }
}
