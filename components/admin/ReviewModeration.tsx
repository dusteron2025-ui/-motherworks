"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Star,
    Trash2,
    Eye,
    Loader2,
    MessageSquare,
    Flag,
} from 'lucide-react';
import { Review } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReviewModerationProps {
    reviews: Review[];
    onApprove?: (reviewId: string) => void;
    onDelete?: (reviewId: string) => void;
}

export function ReviewModeration({ reviews, onApprove, onDelete }: ReviewModerationProps) {
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setIsLoading(true);
        try {
            onDelete?.(deleteConfirm.id);
        } finally {
            setIsLoading(false);
            setDeleteConfirm(null);
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-green-600 bg-green-100';
        if (rating >= 3) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <>
            <Card className="border-none shadow-lg bg-white rounded-2xl">
                <CardHeader className="border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Flag className="h-5 w-5 text-amber-600" />
                            Avaliações para Moderação
                            <Badge className="bg-amber-100 text-amber-700 border-none ml-2">
                                {reviews.length} pendentes
                            </Badge>
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                            <p>Nenhuma avaliação para moderar</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-slate-100 font-bold">
                                                {review.authorName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-slate-900">{review.authorName}</span>
                                                <Badge className={cn("border-none", getRatingColor(review.rating))}>
                                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                                    {review.rating}/5
                                                </Badge>
                                                {review.rating <= 2 && (
                                                    <Badge className="bg-red-100 text-red-700 border-none">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Baixa avaliação
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                {review.comment || 'Sem comentário'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {format(new Date(review.createdAt), "d 'de' MMM, HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedReview(review)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onApprove?.(review.id)}
                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteConfirm(review)}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Detail Dialog */}
            <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
                <DialogContent className="rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detalhes da Avaliação</DialogTitle>
                    </DialogHeader>
                    {selectedReview && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-slate-100 font-bold">
                                        {selectedReview.authorName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{selectedReview.authorName}</p>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={cn(
                                                    "h-4 w-4",
                                                    star <= selectedReview.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-slate-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <MessageSquare className="h-4 w-4 text-slate-400 mb-2" />
                                <p className="text-slate-700">
                                    {selectedReview.comment || 'Nenhum comentário fornecido.'}
                                </p>
                            </div>
                            <div className="text-sm text-slate-500">
                                <p>Job ID: {selectedReview.jobId}</p>
                                <p>Data: {format(new Date(selectedReview.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedReview(null)}
                            className="rounded-xl"
                        >
                            Fechar
                        </Button>
                        <Button
                            onClick={() => {
                                onApprove?.(selectedReview!.id);
                                setSelectedReview(null);
                            }}
                            className="rounded-xl bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aprovar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Excluir Avaliação</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
