import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50',
              variant === 'danger' && 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
              variant === 'warning' && 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
              variant === 'primary' && 'bg-accent-violet hover:bg-sidebar-highlight shadow-indigo-200'
            )}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
            variant === 'danger' && 'bg-rose-50 text-rose-600',
            variant === 'warning' && 'bg-amber-50 text-amber-600',
            variant === 'primary' && 'bg-accent-lavender text-accent-violet'
          )}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-text-primary">{title}</h4>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
