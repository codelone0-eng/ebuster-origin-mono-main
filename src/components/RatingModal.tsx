import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptId: string;
  scriptTitle: string;
  currentRating?: number;
  currentReview?: string;
  onRatingSubmit: (rating: number, review: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  scriptId,
  scriptTitle,
  currentRating = 0,
  currentReview = '',
  onRatingSubmit
}) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(currentRating);
  const [review, setReview] = useState(currentReview);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(currentRating);
      setReview(currentReview);
    }
  }, [isOpen, currentRating, currentReview]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating, review);
      onClose();
    } catch (error) {
      console.error('Ошибка при отправке оценки:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(currentRating);
    setReview(currentReview);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Оценить скрипт</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-2">
              {scriptTitle}
            </h3>
          </div>

          <div className="space-y-3">
            <Label>Ваша оценка</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-150 hover:scale-110"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating === 1 && 'Ужасно'}
                    {rating === 2 && 'Плохо'}
                    {rating === 3 && 'Нормально'}
                    {rating === 4 && 'Хорошо'}
                    {rating === 5 && 'Отлично'}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="review">Отзыв (необязательно)</Label>
            <Textarea
              id="review"
              placeholder="Расскажите о вашем опыте использования скрипта..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить оценку'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
