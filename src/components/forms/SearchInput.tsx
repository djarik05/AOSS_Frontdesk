import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  placeholder = 'Search...',
  className,
  debounceMs = 250,
}) => {
  const [localValue, setLocalValue] = useState(
    controlledValue !== undefined ? controlledValue : defaultValue
  );

  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, onChange, debounceMs]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-9 rounded-xl border border-border bg-white text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-violet/30 focus:border-accent-violet transition-all"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-3 p-1 rounded-full text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
