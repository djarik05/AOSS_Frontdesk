import React from 'react';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumb,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8',
        className
      )}
    >
      <div>
        {breadcrumb && (
          <p className="text-xs font-semibold text-accent-violet tracking-wider uppercase mb-1">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
