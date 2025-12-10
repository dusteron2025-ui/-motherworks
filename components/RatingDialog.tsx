"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDialogProps {
    providerName: string;
    jobId: string;
    onSubmit: (rating: number, comment: string) => void;
    trigger?: React.ReactNode;
}

export function RatingDialog({ providerName, jobId, onSubmit, trigger }: RatingDialogProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onSubmit(rating, comment);
        setIsSubmitting(false);
        setIsOpen(false);
        setRating(0);
        setComment("");
    };

    const ratingLabels = ["", "Ruim", "Regular", "Bom", "Muito Bom", "Excelente"];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50">
                        <Star className="w-4 h-4 mr-2" />
                        Avaliar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                <DialogHeader className="text-center pb-4">
                    <DialogTitle className="text-2xl font-bold text-slate-900">Avalie o Serviço</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Como foi sua experiência com <span className="font-semibold text-slate-700">{providerName}</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        className={cn(
                                            "h-10 w-10 transition-colors",
                                            (hoverRating || rating) >= star
                                                ? "text-amber-400 fill-amber-400"
                                                : "text-slate-200"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hoverRating || rating) > 0 && (
                            <span className="text-sm font-medium text-slate-600 animate-in fade-in duration-200">
                                {ratingLabels[hoverRating || rating]}
                            </span>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Deixe um comentário (opcional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px] bg-slate-50 border-none rounded-2xl resize-none p-4 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl text-slate-500"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar Avaliação"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
