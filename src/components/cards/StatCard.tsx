import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#7658E8',
  trendText,
  trendType = 'neutral',
  onClick,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white p-5 border border-border transition-all duration-200',
        'shadow-[0_2px_12px_rgba(33,22,79,0.03)] hover:shadow-[0_8px_24px_rgba(118,88,232,0.08)]',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {value}
          </h3>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200"
          style={{
            backgroundColor: `${accentColor}14`,
            color: accentColor,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || trendText) && (
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/50 text-xs">
          {trendText && (
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded font-medium',
                trendType === 'positive' && 'bg-emerald-50 text-emerald-600',
                trendType === 'negative' && 'bg-rose-50 text-rose-600',
                trendType === 'neutral' && 'bg-accent-lavender text-accent-violet'
              )}
            >
              {trendText}
            </span>
          )}
          {subtitle && <span className="text-text-muted">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
};
