import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 bg-bg-main rounded-2xl border border-border w-fit overflow-x-auto',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 select-none whitespace-nowrap',
              isActive
                ? 'text-accent-violet'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(118,88,232,0.12)] border border-accent-violet/20"
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    isActive
                      ? 'bg-accent-lavender text-accent-violet'
                      : 'bg-black/5 text-text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
