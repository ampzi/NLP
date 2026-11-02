import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PrimaryButton, SecondaryButton } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  isLoading,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="glass w-full max-w-sm rounded-lg p-5 shadow-subtle"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {danger && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal/10">
                <AlertTriangle className="h-3.5 w-3.5 text-signal" strokeWidth={2.25} />
              </span>
            )}
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="بستن"
            className="rounded p-1 text-charcoal hover:bg-ink/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {description && <p className="mt-2 text-sm text-charcoal">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <SecondaryButton onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
