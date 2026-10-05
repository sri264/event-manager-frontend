import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/** Ids of open modals, so only the top-most one reacts to Escape. */
const openStack: string[] = [];

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const id = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    openStack.push(id);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openStack[openStack.length - 1] === id) closeRef.current();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      openStack.splice(openStack.indexOf(id), 1);
      if (!openStack.length) document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, id]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className={cn(
              'relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl',
              SIZES[size],
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-navy">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
