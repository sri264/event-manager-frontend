import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/common/FormField';
import { RatingStars } from '@/components/common/RatingStars';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { reviewsApi } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/api/client';
import type { BookingDetail } from '@/types/models';

interface ReviewModalProps {
  booking: BookingDetail;
  open: boolean;
  onClose: () => void;
}

export function ReviewModal({ booking, open, onClose }: ReviewModalProps) {
  const existing = booking.review;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setRating(existing?.rating ?? 5);
      setComment(existing?.comment ?? '');
      setError('');
    }
  }, [open, existing]);

  const submit = async () => {
    const text = comment.trim();
    if (text.length < 10) return setError('Please write at least 10 characters');
    setSaving(true);
    try {
      if (existing) {
        await reviewsApi.updateMine(existing.id, { rating, comment: text });
        toast.success('Your review has been updated');
      } else {
        await reviewsApi.create({ bookingId: booking.id, rating, comment: text });
        toast.success('Thanks for sharing your experience!');
      }
      void queryClient.invalidateQueries({ queryKey: ['my'] });
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Edit your review' : 'Rate your experience'}
      description={booking.venue.name}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : existing ? 'Update review' : 'Submit review'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-2 pb-4">
        <RatingStars value={rating} onChange={setRating} size="lg" />
        <p className="text-sm text-muted-foreground">{rating} out of 5</p>
      </div>
      <FormField label="Your review" htmlFor="comment" error={error}>
        <Textarea
          id="comment"
          rows={5}
          maxLength={1000}
          value={comment}
          onChange={event => {
            setComment(event.target.value);
            setError('');
          }}
          placeholder="Tell others about the venue, service and ambience…"
        />
      </FormField>
    </Modal>
  );
}
