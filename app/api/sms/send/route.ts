import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { otpStore } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json(
                { error: 'Número de telefone é obrigatório' },
                { status: 400 }
            );
        }

        // Check if OTP was recently sent (rate limiting)
        if (otpStore.exists(phone)) {
            const remaining = otpStore.getRemainingTime(phone);
            if (remaining > 540) { // Less than 1 minute since last send
                return NextResponse.json(
                    { error: `Aguarde ${Math.ceil((remaining - 540) / 60)} minuto(s) para reenviar` },
                    { status: 429 }
                );
            }
        }

        // Get Twilio credentials from environment
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone) {
            console.error('Twilio credentials not configured');
            return NextResponse.json(
                { error: 'SMS não configurado. Entre em contato com o suporte.' },
                { status: 500 }
            );
        }

        // Generate OTP and store it
        const otp = otpStore.generate(phone);

        // Initialize Twilio client
        const client = twilio(accountSid, authToken);

        // Send SMS
        await client.messages.create({
            body: `Seu código de verificação MotherWorks é: ${otp}. Válido por 10 minutos.`,
            from: twilioPhone,
            to: phone
        });

        // OTP sent successfully - do not log the code for security

        return NextResponse.json({
            success: true,
            message: 'Código enviado com sucesso'
        });

    } catch (error) {
        console.error('SMS send error:', error);

        // Check for specific Twilio errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('unverified')) {
            return NextResponse.json(
                { error: 'Este número não está verificado no Twilio. Use um número verificado para testes.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Falha ao enviar SMS. Verifique o número e tente novamente.' },
            { status: 500 }
        );
    }
}
