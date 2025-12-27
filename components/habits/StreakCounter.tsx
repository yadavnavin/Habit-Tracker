// app/components/habits/StreakCounter.tsx

'use client';

import { Habit } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, TrendingUp } from 'lucide-react';
import { useStore } from '@/lib/store';

interface StreakCounterProps {
  habits: Habit[];
}

export function StreakCounter({ habits }: StreakCounterProps) {
  const { calculateCurrentStreak, getLongestStreak } = useStore();

  // Fallback if functions don't exist
  const getCurrentStreak = (habitId: string) => {
    if (calculateCurrentStreak) {
      return calculateCurrentStreak(habitId);
    }
    const habit = habits.find(h => h.id === habitId);
    return habit?.streak || 0;
  };

  const getBestStreak = (habitId: string) => {
    if (getLongestStreak) {
      return getLongestStreak(habitId);
    }
    const habit = habits.find(h => h.id === habitId);
    return habit?.streak || 0;
  };

  // Calculate stats using proper streak logic
  const habitsWithCurrentStreaks = habits.map(h => ({
    ...h,
    currentStreak: getCurrentStreak(h.id),
    bestStreak: getBestStreak(h.id),
  }));

  const longestStreak = Math.max(
    ...habitsWithCurrentStreaks.map(h => h.bestStreak),
    0
  );
  
  const totalStreak = habitsWithCurrentStreaks.reduce(
    (acc, h) => acc + h.currentStreak,
    0
  );
  
  const habitsWithStreak = habitsWithCurrentStreaks.filter(
    h => h.currentStreak > 0
  ).length;

  const topHabits = habitsWithCurrentStreaks
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 3)
    .filter(h => h.currentStreak > 0);

  return (
    <Card className="bg-gradient-to-br from-[#234C6A] to-[#456882] text-white overflow-hidden border-none shadow-lg">
      <div className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 text-white">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            Streak Stats
          </h2>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Best Ever Streak */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-white/30">
              <p className="text-xs sm:text-sm text-white/90 mb-1 sm:mb-2 font-medium">Best Ever</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{longestStreak}</p>
              <p className="text-[10px] sm:text-xs text-white/75 mt-1">days</p>
            </div>

            {/* Total Active Streak */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-white/30">
              <p className="text-xs sm:text-sm text-white/90 mb-1 sm:mb-2 font-medium">Total Active</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{totalStreak}</p>
              <p className="text-[10px] sm:text-xs text-white/75 mt-1">days</p>
            </div>

            {/* On Fire Count */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-white/30">
              <p className="text-xs sm:text-sm text-white/90 mb-1 sm:mb-2 font-medium">On Fire</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">{habitsWithStreak}</p>
              <p className="text-[10px] sm:text-xs text-white/75 mt-1">of {habits.length}</p>
            </div>
          </div>

          {/* Top Habits */}
          {topHabits.length > 0 ? (
            <div className="space-y-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
              <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Top Streaks
              </h3>
              <div className="space-y-2">
                {topHabits.map((habit, index) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 gap-2 border border-white/20"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <span className="text-base sm:text-xl font-bold flex-shrink-0 text-yellow-400">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-sm sm:text-base truncate text-white">
                        {habit.name}
                      </span>
                    </div>
                    <Badge className="bg-white text-[#234C6A] font-bold text-xs flex-shrink-0">
                      <Flame className="w-3 h-3 mr-1" />
                      {habit.currentStreak}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 border-t border-white/20 mt-4">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-white/50" />
              <p className="text-xs sm:text-sm text-white/75">Start completing habits to build streaks!</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
