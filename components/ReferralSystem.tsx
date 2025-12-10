"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Share2, Check, Users, Euro, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralStats {
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    totalEarned: number;
}

interface ReferralSystemProps {
    userId: string;
    userName: string;
    stats?: ReferralStats;
    discountPercentage?: number;
    rewardAmount?: number;
}

export function ReferralSystem({
    userId,
    userName,
    stats = { totalReferrals: 0, pendingReferrals: 0, completedReferrals: 0, totalEarned: 0 },
    discountPercentage = 10,
    rewardAmount = 15,
}: ReferralSystemProps) {
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Generate unique referral code
    const referralCode = `${userName.split(' ')[0].toUpperCase()}${userId.slice(-4).toUpperCase()}`;
    const referralLink = `https://motherworks.com/signup?ref=${referralCode}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'MotherWorks - Convite',
                    text: `Olá! Use meu código ${referralCode} e ganhe ${discountPercentage}% de desconto no primeiro serviço!`,
                    url: referralLink,
                });
            } catch (error) {
                console.error("Share failed:", error);
            }
        } else {
            // Fallback: copy to clipboard
            await handleCopy();
        }

        setIsSharing(false);
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(
            `Olá! 🧹✨\n\nVocê conhece o MotherWorks? É uma plataforma incrível para encontrar profissionais de limpeza!\n\n` +
            `Use meu código: *${referralCode}*\n` +
            `E ganhe *${discountPercentage}% de desconto* no primeiro serviço!\n\n` +
            `Acesse: ${referralLink}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Main Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Gift className="h-6 w-6" />
                        Indique e Ganhe!
                    </CardTitle>
                    <CardDescription className="text-white/80">
                        Convide amigos e ganhe €{rewardAmount} por cada indicação bem-sucedida.
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                    {/* Referral Code */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-white/70 mb-2">Seu código de indicação:</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-white/20 rounded-xl px-4 py-3 font-mono text-2xl font-bold tracking-wider text-center">
                                {referralCode}
                            </div>
                            <Button
                                onClick={handleCopy}
                                variant="secondary"
                                className={cn(
                                    "h-12 w-12 rounded-xl",
                                    copied ? "bg-green-500 hover:bg-green-600" : "bg-white/20 hover:bg-white/30"
                                )}
                            >
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Referral Link */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-sm text-white/70 mb-2">Link de indicação:</p>
                        <div className="flex items-center gap-2">
                            <Input
                                value={referralLink}
                                readOnly
                                className="flex-1 bg-white/20 border-none text-white text-sm h-11"
                            />
                            <Button
                                onClick={handleCopy}
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 h-11 px-3"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="h-12 bg-white text-teal-600 hover:bg-white/90 rounded-xl font-semibold"
                        >
                            {isSharing ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <Share2 className="h-5 w-5 mr-2" />
                            )}
                            Compartilhar
                        </Button>
                        <Button
                            onClick={handleShareWhatsApp}
                            className="h-12 bg-[#25D366] hover:bg-[#22c05a] text-white rounded-xl font-semibold"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto text-teal-600 mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{stats.totalReferrals}</p>
                        <p className="text-xs text-slate-500">Total indicações</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                            <span className="text-xl">⏳</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-600">{stats.pendingReferrals}</p>
                        <p className="text-xs text-slate-500">Pendentes</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                            <span className="text-xl">✅</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.completedReferrals}</p>
                        <p className="text-xs text-slate-500">Confirmadas</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <Euro className="h-6 w-6 mx-auto text-teal-600 mb-2" />
                        <p className="text-2xl font-bold text-slate-900">€{stats.totalEarned}</p>
                        <p className="text-xs text-slate-500">Total ganho</p>
                    </CardContent>
                </Card>
            </div>

            {/* How it works */}
            <Card className="border-none shadow-sm bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-lg">Como funciona?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Compartilhe seu código</p>
                                <p className="text-sm text-slate-500">Envie para amigos e família</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Amigo se cadastra</p>
                                <p className="text-sm text-slate-500">E ganha {discountPercentage}% de desconto</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Você recebe €{rewardAmount}</p>
                                <p className="text-sm text-slate-500">Após o primeiro serviço</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
