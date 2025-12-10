import { NextRequest, NextResponse } from "next/server";

// Import shared verification codes (in production, use Redis/database)
// For now, we'll use a simple in-memory check
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
    try {
        const { phoneNumber, code } = await request.json();

        if (!phoneNumber || !code) {
            return NextResponse.json(
                { error: "Número e código são obrigatórios" },
                { status: 400 }
            );
        }

        const stored = verificationCodes.get(phoneNumber);

        // In development, accept any 6-digit code or "123456"
        if (process.env.NODE_ENV === "development") {
            if (code === "123456" || code.length === 6) {
                verificationCodes.delete(phoneNumber);
                return NextResponse.json({
                    success: true,
                    verified: true,
                    message: "Telefone verificado com sucesso"
                });
            }
        }

        if (!stored) {
            return NextResponse.json(
                { error: "Código expirado ou inválido" },
                { status: 400 }
            );
        }

        if (Date.now() > stored.expires) {
            verificationCodes.delete(phoneNumber);
            return NextResponse.json(
                { error: "Código expirado" },
                { status: 400 }
            );
        }

        if (stored.code !== code) {
            return NextResponse.json(
                { error: "Código inválido" },
                { status: 400 }
            );
        }

        // Code is valid - remove from store
        verificationCodes.delete(phoneNumber);

        return NextResponse.json({
            success: true,
            verified: true,
            message: "Telefone verificado com sucesso"
        });
    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json(
            { error: "Erro ao verificar código" },
            { status: 500 }
        );
    }
}
