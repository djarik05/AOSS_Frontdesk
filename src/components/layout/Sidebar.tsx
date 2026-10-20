import { useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  Bell,
  CheckSquare,
  UserCog,
  Bot,
  BarChart3,
  Clock,
  Settings,
  HelpCircle,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Appointments', path: '/appointments', icon: Calendar },
      { label: 'Inbox', path: '/inbox', icon: MessageSquare, badge: 3 },
      { label: 'Patients', path: '/patients', icon: Users },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Reminders & Recall', path: '/reminders', icon: Bell },
      { label: 'Tasks', path: '/tasks', icon: CheckSquare },
      { label: 'Team', path: '/team', icon: UserCog },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'AI Studio', path: '/ai-studio', icon: Bot },
      { label: 'Reports', path: '/reports', icon: BarChart3 },
      { label: 'Activity Log', path: '/activity', icon: Clock },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      { label: 'Clinic Settings', path: '/settings', icon: Settings },
      { label: 'Help & Support', path: '/help', icon: HelpCircle },
    ],
  },
];

const demoUser = {
  name: 'Dr. Sarah Mitchell',
  role: 'Admin',
  initials: 'SM',
};

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: -280 },
  visible: { x: 0 },
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavClick = useCallback(() => {
    if (isMobile) onMobileClose();
  }, [isMobile, onMobileClose]);

  const showLabels = isMobile ? true : !collapsed;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn('flex items-center px-5 pt-6 pb-4', collapsed && !isMobile && 'px-3 justify-center')}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-sidebar-highlight/20 flex items-center justify-center">
            <Sparkles size={20} className="text-sidebar-highlight" />
            <div className="absolute inset-0 rounded-xl bg-sidebar-highlight/10 blur-sm" />
          </div>
          {showLabels && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <h1 className="text-white font-bold text-base leading-tight tracking-tight">
                AOSS FrontDesk
              </h1>
              <p className="text-[10px] font-medium tracking-[0.15em] text-sidebar-highlight/70 uppercase">
                Dental Clinic Portal
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {showLabels && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] text-white/30 uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                        collapsed && !isMobile && 'justify-center px-0',
                        isActive
                          ? 'text-white'
                          : 'text-white/50 hover:text-white/80'
                      )}
                    >
                      {/* Active background */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-xl bg-sidebar-highlight/15 nav-active-glow"
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 350, damping: 30 }
                          }
                        />
                      )}

                      {/* Hover background */}
                      {!isActive && hoveredItem === item.path && (
                        <motion.div
                          initial={reducedMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-xl bg-white/5"
                        />
                      )}

                      {/* Active left indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-highlight"
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 350, damping: 30 }
                          }
                        />
                      )}

                      <Icon
                        size={20}
                        className={cn(
                          'relative z-10 flex-shrink-0',
                          isActive ? 'text-sidebar-highlight' : ''
                        )}
                      />

                      {showLabels && (
                        <span className="relative z-10 truncate">{item.label}</span>
                      )}

                      {showLabels && item.badge && (
                        <span className="relative z-10 ml-auto flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white px-1.5">
                          {item.badge}
                        </span>
                      )}

                      {/* Collapsed badge dot */}
                      {!showLabels && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop/tablet only) */}
      {!isMobile && (
        <div className="px-3 pb-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            >
              <ChevronLeft size={18} />
            </motion.div>
            {showLabels && (
              <span className="text-xs font-medium">Collapse</span>
            )}
          </button>
        </div>
      )}

      {/* User Section */}
      <div className={cn(
        'border-t border-white/10 px-3 py-4',
        collapsed && !isMobile && 'px-2'
      )}>
        <div className={cn(
          'flex items-center gap-3',
          collapsed && !isMobile && 'justify-center'
        )}>
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center text-white text-sm font-semibold">
            {demoUser.initials}
          </div>
          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {demoUser.name}
              </p>
              <p className="text-[11px] text-white/40">{demoUser.role}</p>
            </div>
          )}
          {showLabels && (
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile: Drawer overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onMobileClose}
              aria-hidden
            />
            {/* Drawer */}
            <motion.aside
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 30 }
              }
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-sidebar-gradient"
            >
              {/* Close button */}
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop/Tablet: Fixed sidebar
  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 300, damping: 30 }
      }
      className="fixed inset-y-0 left-0 z-30 bg-sidebar-gradient flex-shrink-0 overflow-hidden"
    >
      {sidebarContent}
    </motion.aside>
  );
}

/** Sidebar mobile toggle button for use in TopBar. */
export function SidebarMobileToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-accent-light transition-colors md:hidden"
      aria-label="Open sidebar"
    >
      <Menu size={22} />
    </button>
  );
}
