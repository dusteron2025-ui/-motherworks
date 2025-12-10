import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutSession } from '@/services/stripeService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID required' },
                { status: 400 }
            );
        }

        const session = await getCheckoutSession(sessionId);

        return NextResponse.json({
            success: session.paymentStatus === 'paid',
            session,
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
