import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar (fixed on the right side) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64">
        <AppSidebar />
      </div>

      {/* Mobile drawer (slides in from the right) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
            role="presentation"
          />
          <div className="absolute inset-y-0 right-0 w-72 max-w-[85vw]">
            <AppSidebar
              isMobile
              onClose={() => setMobileNavOpen(false)}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="lg:mr-64">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
