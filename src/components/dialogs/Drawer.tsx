import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.classList.add('scroll-locked');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('scroll-locked');
    }
    return () => {
      document.body.classList.remove('scroll-locked');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0F0A2E]/50 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={cn(
                'relative w-screen bg-white shadow-2xl border-l border-border flex flex-col',
                widthClasses[width],
                className
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
                <div>
                  {typeof title === 'string' ? (
                    <h3 className="text-lg font-bold text-text-primary tracking-tight">
                      {title}
                    </h3>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-text-muted hover:text-text-primary hover:bg-bg-main transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="p-4 px-6 border-t border-border bg-bg-main/60 flex items-center justify-end gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
