import { NextRequest, NextResponse } from "next/server";

// In production, use Twilio:
// import twilio from 'twilio';
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Store codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json(
                { error: "Número de telefone é obrigatório" },
                { status: 400 }
            );
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store code
        verificationCodes.set(phoneNumber, { code, expires });

        // In development, log the code
        console.log(`[DEV] Verification code for ${phoneNumber}: ${code}`);

        // In production, send via Twilio:
        /*
        await client.messages.create({
            body: `Seu código de verificação MotherWorks é: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });
        */

        return NextResponse.json({
            success: true,
            message: "Código enviado com sucesso",
            // Remove in production:
            devCode: process.env.NODE_ENV === "development" ? code : undefined
        });
    } catch (error) {
        console.error("Error sending verification code:", error);
        return NextResponse.json(
            { error: "Erro ao enviar código" },
            { status: 500 }
        );
    }
}

// Export the codes map for verification endpoint
export { verificationCodes };
