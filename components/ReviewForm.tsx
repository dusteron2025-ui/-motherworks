"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Review } from '@/types';

interface ReviewFormProps {
    jobId: string;
    targetId: string;
    targetName: string;
    authorId: string;
    authorName: string;
    type: 'CLIENT_TO_PROVIDER' | 'PROVIDER_TO_CLIENT';
    onSubmit: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
    onCancel?: () => void;
}

export function ReviewForm({
    jobId,
    targetId,
    targetName,
    authorId,
    authorName,
    type,
    onSubmit,
    onCancel,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                rating,
                comment,
                authorId,
                authorName,
                targetId,
                jobId,
                type,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

    return (
        <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                    Avaliar {type === 'CLIENT_TO_PROVIDER' ? 'Profissional' : 'Cliente'}
                </CardTitle>
                <p className="text-sm text-slate-500">
                    Como foi sua experiência com {targetName}?
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-2">
                    <Label>Nota geral</Label>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            (hoverRating || rating) >= star
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-slate-300"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hoverRating || rating) > 0 && (
                            <span className="text-sm font-medium text-slate-700">
                                {ratingLabels[hoverRating || rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                    <Label htmlFor="comment">Comentário (opcional)</Label>
                    <Textarea
                        id="comment"
                        placeholder="Conte como foi sua experiência..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-purple-500"
                    />
                </div>

                {/* Quick Tags */}
                <div className="space-y-2">
                    <Label>Tags rápidas</Label>
                    <div className="flex flex-wrap gap-2">
                        {(type === 'CLIENT_TO_PROVIDER'
                            ? ['Pontual', 'Atencioso(a)', 'Caprichoso(a)', 'Profissional', 'Ótima comunicação']
                            : ['Educado(a)', 'Casa organizada', 'Pagamento em dia', 'Boa comunicação']
                        ).map((tag) => (
                            <Button
                                key={tag}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setComment(prev =>
                                    prev ? `${prev}, ${tag.toLowerCase()}` : tag
                                )}
                                className="rounded-full text-xs"
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1 rounded-xl"
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Enviar Avaliação
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
