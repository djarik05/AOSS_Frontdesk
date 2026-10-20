import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DemoModeBanner } from '@/components/feedback/DemoModeBanner';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/utils/cn';

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AppLayout() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleMobileOpen = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main area */}
      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 30 }
        }
        className="flex flex-col min-h-screen"
      >
        <TopBar
          onMobileMenuToggle={handleMobileOpen}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Content area */}
        <main className="flex-1 bg-decorative-gradient">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </motion.div>

      {/* Demo banner */}
      <DemoModeBanner />
    </div>
  );
}
