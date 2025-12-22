// app/components/common/Navigation.tsx

'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Calendar, Zap } from 'lucide-react';

export function Navigation() {
  const { view, setView } = useStore();

  const navItems = [
    { id: 'day', label: 'Day', icon: Calendar },
    { id: 'week', label: 'Week', icon: Calendar },
    { id: 'month', label: 'Month', icon: Calendar },
    { id: 'habits', label: 'Habits', icon: Zap },
  ];

  return (
    <nav className="bg-habit-cream border-b-2 border-habit-rose sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <Button
                key={item.id}
                onClick={() => setView(item.id as any)}
                variant={isActive ? 'default' : 'ghost'}
                className={`gap-2 transition-all ${
                  isActive
                    ? 'bg-habit-mauve text-white'
                    : 'text-habit-mauve hover:bg-habit-light'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
