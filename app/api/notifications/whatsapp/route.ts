import { NextRequest, NextResponse } from "next/server";

// In production, use Twilio:
// import twilio from 'twilio';
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface NotificationRequest {
    to: string; // Phone number with country code
    message: string;
    type: 'booking_confirmation' | 'reminder' | 'payment' | 'general';
}

export async function POST(request: NextRequest) {
    try {
        const body: NotificationRequest = await request.json();
        const { to, message, type } = body;

        if (!to || !message) {
            return NextResponse.json(
                { error: "Destinatário e mensagem são obrigatórios" },
                { status: 400 }
            );
        }

        // Format phone number for WhatsApp
        const whatsappNumber = `whatsapp:${to.replace(/\D/g, "")}`;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

        // In development, log the message
        console.log(`[DEV] WhatsApp notification to ${whatsappNumber}:`);
        console.log(`Message: ${message}`);
        console.log(`Type: ${type}`);

        // In production, send via Twilio WhatsApp:
        /*
        const result = await client.messages.create({
            body: message,
            from: fromNumber,
            to: whatsappNumber,
        });
        
        return NextResponse.json({ 
            success: true,
            messageId: result.sid,
            message: "Notificação enviada com sucesso"
        });
        */

        // Development response
        return NextResponse.json({
            success: true,
            messageId: `dev_${Date.now()}`,
            message: "Notificação simulada com sucesso (modo desenvolvimento)"
        });

    } catch (error) {
        console.error("Error sending WhatsApp notification:", error);
        return NextResponse.json(
            { error: "Erro ao enviar notificação" },
            { status: 500 }
        );
    }
}

// Template messages for common notifications
export const NOTIFICATION_TEMPLATES = {
    booking_confirmation: (providerName: string, date: string, time: string) =>
        `✅ *Agendamento Confirmado!*\n\n` +
        `Seu serviço com *${providerName}* foi confirmado para:\n` +
        `📅 ${date}\n` +
        `🕐 ${time}\n\n` +
        `_MotherWorks - Cuidando do seu lar_`,

    reminder: (providerName: string, date: string, time: string) =>
        `⏰ *Lembrete de Agendamento*\n\n` +
        `Seu serviço com *${providerName}* é amanhã:\n` +
        `📅 ${date}\n` +
        `🕐 ${time}\n\n` +
        `_MotherWorks - Cuidando do seu lar_`,

    payment_released: (amount: number) =>
        `💰 *Pagamento Liberado!*\n\n` +
        `O valor de *€${amount.toFixed(2)}* foi liberado para sua conta.\n\n` +
        `_MotherWorks - Cuidando do seu lar_`,

    service_completed: () =>
        `🎉 *Serviço Finalizado!*\n\n` +
        `Por favor, confirme a conclusão do serviço no app para liberar o pagamento.\n\n` +
        `_MotherWorks - Cuidando do seu lar_`,
};
