"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, MessageCircle, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chat, ChatMessage } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatWindowProps {
    chat: Chat;
    otherPartyName: string;
    otherPartyAvatar?: string;
    onClose: () => void;
    onSendMessage: (content: string) => Promise<void>;
}

export function ChatWindow({
    chat,
    otherPartyName,
    otherPartyAvatar,
    onClose,
    onSendMessage,
}: ChatWindowProps) {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isActive = chat.status === "ACTIVE";

    useEffect(() => {
        // Scroll to bottom on new messages
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat.messages]);

    const handleSend = async () => {
        if (!message.trim() || isSending || !isActive) return;

        setIsSending(true);
        try {
            await onSendMessage(message.trim());
            setMessage("");
            inputRef.current?.focus();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return format(date, "HH:mm", { locale: ptBR });
    };

    const formatMessageDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return format(date, "dd 'de' MMMM", { locale: ptBR });
    };

    // Group messages by date
    const groupedMessages = chat.messages.reduce((groups, msg) => {
        const date = formatMessageDate(msg.createdAt);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(msg);
        return groups;
    }, {} as Record<string, ChatMessage[]>);

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
                <div className="flex items-center gap-3">
                    {otherPartyAvatar ? (
                        <img
                            src={otherPartyAvatar}
                            alt={otherPartyName}
                            className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold">{otherPartyName}</h3>
                        <p className="text-xs text-white/70">
                            {isActive ? "Conversa ativa" : "Conversa encerrada"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
                {Object.entries(groupedMessages).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MessageCircle className="h-12 w-12 mb-2" />
                        <p>Nenhuma mensagem ainda</p>
                        <p className="text-sm">Envie uma mensagem para começar</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="flex justify-center my-4">
                                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                                    {date}
                                </span>
                            </div>
                            {msgs.map((msg) => {
                                const isOwn = msg.senderId === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex mb-3",
                                            isOwn ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[75%] px-4 py-2 rounded-2xl",
                                                isOwn
                                                    ? "bg-teal-600 text-white rounded-br-sm"
                                                    : "bg-slate-100 text-slate-900 rounded-bl-sm"
                                            )}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {msg.content}
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-[10px] mt-1 text-right",
                                                    isOwn ? "text-white/70" : "text-slate-400"
                                                )}
                                            >
                                                {formatMessageTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </ScrollArea>

            {/* Input or Closed Message */}
            {isActive ? (
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Digite sua mensagem..."
                            disabled={isSending}
                            className="flex-1 h-11 bg-white border-slate-200 rounded-xl"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            className="h-11 px-4 bg-teal-600 hover:bg-teal-700 rounded-xl"
                        >
                            {isSending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-t border-slate-100 bg-slate-100 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Esta conversa foi encerrada</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Floating Chat Button Component
interface ChatButtonProps {
    unreadCount?: number;
    onClick: () => void;
    className?: string;
}

export function ChatButton({ unreadCount = 0, onClick, className }: ChatButtonProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "fixed bottom-24 right-6 md:bottom-8 h-14 w-14 rounded-full shadow-lg bg-teal-600 hover:bg-teal-700 z-50",
                className
            )}
        >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </Button>
    );
}
