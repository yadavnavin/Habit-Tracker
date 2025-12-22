// app/components/common/Header.tsx

'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, Bell, Sparkles } from 'lucide-react';

export function Header() {
  const { selectedDate, setSelectedDate } = useStore();

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <header className="bg-gradient-to-r from-habit-mauve via-[#2a3f7a] to-habit-rose text-white shadow-2xl">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-habit-cream" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Habit Tracker</h1>
              <p className="text-habit-cream mt-1 text-lg">Build better habits, one day at a time</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <p className="text-sm text-habit-cream opacity-90">Today</p>
              <p className="text-lg font-semibold">{formatDate(selectedDate)}</p>
            </div>
            <Button
              onClick={handleToday}
              variant="outline"
              className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm font-semibold"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Jump to Today
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
