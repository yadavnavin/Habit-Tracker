// app/components/layout/AppLayout.tsx

'use client';

import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/common/Sidebar';
import { Navbar } from '@/components/common/Navbar';
import { OverviewDashboard } from '@/components/overview/OverviewDashboard';
import { WeekView } from '@/components/schedule/WeekView';
import { MonthView } from '@/components/schedule/MonthView';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { DataManager } from '@/components/settings/DataManager';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function AppLayout() {
  const { view } = useStore();

  return (
    <div className="min-h-screen bg-[#F8F9FA]"> {/* Light gray background */}
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area with rounded corners and shadow */}
        <main className="flex-1 overflow-x-hidden ml-4 mt-4 mr-4 mb-4 bg-white rounded-3xl shadow-sm">
          <div className="p-8">
            {view === 'overview' && <OverviewDashboard />}
            {view === 'week' && <WeekView />}
            {view === 'month' && <MonthView />}
            {view === 'habits' && <HabitTracker />}
            
            {/* Stats View - Placeholder */}
            {view === 'stats' && (
              <Card className="p-12 text-center glass rounded-3xl shadow-brown-lg border border-habit-rose/30">
                <TrendingUp className="w-16 h-16 mx-auto text-habit-mauve opacity-50 mb-4" />
                <h3 className="text-2xl font-bold text-habit-mauve">Analytics Dashboard</h3>
                <p className="text-gray-600 mt-2">Track your progress with detailed insights</p>
              </Card>
            )}
            
            {/* Settings View */}
            {view === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-habit-mauve mb-6">Settings</h2>
                <DataManager />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
