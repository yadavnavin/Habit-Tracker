// app/components/habits/HabitCard.tsx

'use client';

import { Habit } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Flame, Trash2, Edit2, Check, Calendar } from 'lucide-react';
import { useStore } from '@/lib/store';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { 
    toggleHabit, 
    deleteHabit, 
    selectedDate,
    calculateCurrentStreak,
    getLongestStreak 
  } = useStore();
  
  const isCompletedToday = habit.completedDates.includes(selectedDate);
  const currentStreak = calculateCurrentStreak ? calculateCurrentStreak(habit.id) : habit.streak;
  const longestStreak = getLongestStreak ? getLongestStreak(habit.id) : habit.streak;

  // Calculate monthly progress
  const getMonthlyProgress = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const completedThisMonth = habit.completedDates.filter(date => {
      const d = new Date(date);
      return d >= firstDayOfMonth && d <= lastDayOfMonth;
    }).length;
    
    return Math.round((completedThisMonth / daysInMonth) * 100);
  };

  const monthlyProgress = getMonthlyProgress();

  return (
    <Card className="bg-white border border-gray-200 hover:border-[#234C6A] transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 sm:gap-3 mb-2">
              <Checkbox
                checked={isCompletedToday}
                onCheckedChange={() => toggleHabit(habit.id, selectedDate)}
                className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#234C6A] data-[state=checked]:bg-[#234C6A] mt-0.5 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className={`text-base sm:text-xl font-bold truncate ${
                  isCompletedToday ? 'line-through text-gray-400' : 'text-[#234C6A]'
                }`}>
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                    {habit.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-8 text-[#234C6A] hover:bg-gray-100"
              onClick={() => onEdit(habit)}
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:bg-red-50"
              onClick={() => deleteHabit(habit.id)}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Streak Counter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
              <span className="text-base sm:text-lg font-bold text-[#234C6A]">
                {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            {longestStreak > 0 && (
              <Badge variant="outline" className="text-xs">
                Best: {longestStreak}
              </Badge>
            )}
          </div>

          {/* Progress Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600">This Month Progress</span>
              <span className="font-bold text-[#234C6A]">{monthlyProgress}%</span>
            </div>
            <Progress
              value={monthlyProgress}
              className="h-2 bg-gray-100"
            />
          </div>

          {/* Frequency Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#234C6A] text-white text-xs">
              {habit.frequency}
            </Badge>
            {habit.reminderEnabled && (
              <Badge className="bg-[#456882] text-white text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {habit.reminderTime}
              </Badge>
            )}
            {currentStreak > 0 && (
              <Badge className="bg-orange-500 text-white text-xs">
                <Flame className="w-3 h-3 mr-1" />
                On Fire
              </Badge>
            )}
          </div>

          {/* Calendar Heatmap (Last 7 days) */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-2">Last 7 days</p>
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                const isCompleted = habit.completedDates.includes(dateStr);

                return (
                  <div
                    key={i}
                    className={`flex-1 aspect-square max-w-[32px] rounded text-xs flex items-center justify-center cursor-pointer hover:opacity-80 transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white font-bold scale-105'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    title={dateStr}
                  >
                    {isCompleted && <Check className="w-3 h-3" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
