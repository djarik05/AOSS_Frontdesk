import React from 'react';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ className, options, placeholder, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full h-10 px-3.5 rounded-xl border border-border bg-white text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-violet/30 focus:border-accent-violet transition-all',
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

SelectField.displayName = 'SelectField';
