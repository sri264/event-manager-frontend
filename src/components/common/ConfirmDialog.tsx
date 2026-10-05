import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  withReason?: boolean;
  reasonPlaceholder?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  loading,
  withReason,
  reasonPlaceholder = 'Reason (optional)',
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Go back
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm text-slate-600">{description}</div>
      {withReason && (
        <Textarea
          className="mt-4"
          value={reason}
          onChange={event => setReason(event.target.value)}
          placeholder={reasonPlaceholder}
          maxLength={255}
        />
      )}
    </Modal>
  );
}
