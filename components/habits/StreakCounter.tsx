// app/components/habits/StreakCounter.tsx

'use client';

import { Habit } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';

interface StreakCounterProps {
  habits: Habit[];
}

export function StreakCounter({ habits }: StreakCounterProps) {
  const longestStreak = Math.max(...habits.map((h) => h.streak), 0);
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const habitsWithStreak = habits.filter((h) => h.streak > 0).length;

  const topHabits = habits.sort((a, b) => b.streak - a.streak).slice(0, 3);

  return (
    <Card className="bg-gradient-to-br from-habit-mauve to-habit-rose text-white p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="w-6 h-6" />
          Streak Stats
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <p className="text-sm opacity-90">Longest Streak</p>
            <p className="text-3xl font-bold mt-2">{longestStreak}</p>
            <p className="text-xs opacity-75 mt-1">days</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <p className="text-sm opacity-90">Total Streak</p>
            <p className="text-3xl font-bold mt-2">{totalStreak}</p>
            <p className="text-xs opacity-75 mt-1">days</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
            <p className="text-sm opacity-90">Active Habits</p>
            <p className="text-3xl font-bold mt-2">{habitsWithStreak}</p>
            <p className="text-xs opacity-75 mt-1">/{habits.length}</p>
          </div>
        </div>

        {/* Top Habits */}
        {topHabits.length > 0 && (
          <div className="space-y-3 mt-6 pt-6 border-t border-white border-opacity-20">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Streaks
            </h3>
            <div className="space-y-2">
              {topHabits.map((habit, index) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between bg-white bg-opacity-10 rounded p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">#{index + 1}</span>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <Badge className="bg-white text-habit-rose font-bold">
                    <Flame className="w-3 h-3 mr-1" />
                    {habit.streak}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
