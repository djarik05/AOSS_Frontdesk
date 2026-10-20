import React from 'react';
import { cn } from '@/utils/cn';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  children,
  className,
  id,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-text-primary tracking-wide"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-[11px] text-text-muted">{helpText}</p>
      )}
      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
};
