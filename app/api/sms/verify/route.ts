import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json(
                { error: 'Telefone e código são obrigatórios' },
                { status: 400 }
            );
        }

        // Verify the code
        const result = otpStore.verify(phone, code);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            verified: true,
            message: 'Telefone verificado com sucesso'
        });

    } catch (error) {
        console.error('SMS verify error:', error);
        return NextResponse.json(
            { error: 'Erro ao verificar código' },
            { status: 500 }
        );
    }
}
