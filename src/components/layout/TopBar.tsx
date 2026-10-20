import { useLocation } from 'react-router-dom';
import { Search, Bell, Command } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SidebarMobileToggle } from './Sidebar';

/** Map of route paths to readable page titles. */
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/appointments': 'Appointments',
  '/inbox': 'Inbox',
  '/patients': 'Patients',
  '/reminders': 'Reminders & Recall',
  '/tasks': 'Tasks',
  '/team': 'Team',
  '/ai-studio': 'AI Studio',
  '/reports': 'Reports',
  '/activity': 'Activity Log',
  '/settings': 'Clinic Settings',
  '/help': 'Help & Support',
};

interface TopBarProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export function TopBar({ onMobileMenuToggle, sidebarCollapsed }: TopBarProps) {
  const location = useLocation();

  const currentTitle =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path + '/')
    )?.[1] ??
    'Dashboard';

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center justify-between gap-4 px-4 sm:px-6 h-16 bg-bg-card/80 backdrop-blur-md border-b border-border'
      )}
    >
      {/* Left: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarMobileToggle onClick={onMobileMenuToggle} />
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="text-text-muted hidden sm:block">AOSS FrontDesk</li>
            <li className="text-text-muted hidden sm:block" aria-hidden>/</li>
            <li className="font-semibold text-text-primary truncate">
              {currentTitle}
            </li>
          </ol>
        </nav>
      </div>

      {/* Right: Search + Notifications + Demo pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-main border border-border text-text-muted text-sm hover:border-accent/30 hover:text-text-secondary transition-colors cursor-pointer"
          aria-label="Search (Cmd+K)"
        >
          <Search size={16} />
          <span className="hidden md:inline">Search…</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-bg-card border border-border text-[11px] text-text-muted font-mono">
            <Command size={11} />K
          </kbd>
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent-light transition-colors"
          aria-label="Notifications (5 unread)"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-error text-[10px] font-bold text-white">
            5
          </span>
        </button>

        {/* Demo Mode Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow/40 border border-yellow/60 text-[11px] font-semibold text-text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          Demo
        </div>
      </div>
    </header>
  );
}
