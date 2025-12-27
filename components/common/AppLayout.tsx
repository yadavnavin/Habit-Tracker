// app/components/layout/AppLayout.tsx

'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/common/Sidebar';
import { Navbar } from '@/components/common/Navbar';
import { OverviewDashboard } from '@/components/overview/OverviewDashboard';
import { WeekView } from '@/components/schedule/WeekView';
import { MonthView } from '@/components/schedule/MonthView';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { ReportsView } from '@/components/reports/ReportsView';
import { DataManager } from '@/components/settings/DataManager';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function AppLayout() {
  const { view } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar 
        onMenuClick={() => setMobileMenuOpen(true)} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Container - Below navbar */}
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 pt-0">
            {/* Add VisuallyHidden SheetTitle for accessibility */}
            <VisuallyHidden>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden>
            
            <div className="h-full overflow-y-auto">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-0'
          }`}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {view === 'overview' && <OverviewDashboard />}
            {view === 'week' && <WeekView />}
            {view === 'month' && <MonthView />}
            {view === 'habits' && <HabitTracker />}
            {view === 'reports' && <ReportsView />}
            
            {view === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-[#1B3C53]">Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your app preferences and data
                  </p>
                </div>
                <DataManager />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
