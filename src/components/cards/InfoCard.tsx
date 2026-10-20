import React from 'react';
import { cn } from '@/utils/cn';

interface InfoCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-border shadow-[0_2px_12px_rgba(33,22,79,0.03)] overflow-hidden',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4.5 border-b border-border/70">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-text-primary tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn('p-6', bodyClassName)}>{children}</div>
    </div>
  );
};
