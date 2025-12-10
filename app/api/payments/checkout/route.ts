import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/services/stripeService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, amount, customerEmail, customerName, serviceName } = body;

        if (!jobId || !amount || !customerEmail || !customerName || !serviceName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert amount to cents if it's in euros
        const amountInCents = Math.round(amount * 100);

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await createCheckoutSession({
            jobId,
            amount: amountInCents,
            customerEmail,
            customerName,
            serviceName,
            successUrl: `${origin}/client/bookings/${jobId}?payment=success`,
            cancelUrl: `${origin}/client/bookings/${jobId}?payment=cancelled`,
        });

        return NextResponse.json(session);
    } catch (error) {
        console.error('Checkout session error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
