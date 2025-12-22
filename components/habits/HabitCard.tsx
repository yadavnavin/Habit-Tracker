// app/components/habits/HabitCard.tsx

'use client';

import { Habit } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Flame, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '@/lib/store';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { toggleHabitCompletion, deleteHabit, getHabitStats, selectedDate } = useStore();
  const stats = getHabitStats(habit.id);
  const isCompletedToday = habit.completedDates.includes(selectedDate);

  return (
    <Card className="bg-white border-habit-cream hover:border-habit-rose transition-colors overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Checkbox
                checked={isCompletedToday}
                onCheckedChange={() => toggleHabitCompletion(habit.id, selectedDate)}
                className="w-6 h-6 border-habit-mauve text-habit-mauve"
              />
              <h3 className={`text-xl font-bold ${isCompletedToday ? 'line-through text-gray-400' : 'text-habit-mauve'}`}>
                {habit.name}
              </h3>
            </div>
            {habit.description && (
              <p className="text-gray-600 text-sm ml-9">{habit.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-habit-mauve hover:bg-habit-cream"
              onClick={() => onEdit(habit)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-500 hover:bg-red-50"
              onClick={() => deleteHabit(habit.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Streak Counter */}
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold text-habit-mauve">
              {stats.streak} day streak
            </span>
          </div>

          {/* Progress Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Month Progress</span>
              <span className="font-bold text-habit-mauve">{stats.percentage}%</span>
            </div>
            <Progress
              value={stats.percentage}
              className="h-2 bg-habit-cream"
            />
          </div>

          {/* Frequency Badge */}
          <div className="flex items-center gap-2">
            <Badge className="bg-habit-rose text-white">
              {habit.frequency}
            </Badge>
            {habit.reminderEnabled && (
              <Badge className="bg-habit-mauve text-white">
                Reminder: {habit.reminderTime}
              </Badge>
            )}
          </div>

          {/* Calendar Heatmap (Last 7 days) */}
          <div className="mt-4 pt-4 border-t border-habit-cream">
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
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${
                      isCompleted
                        ? 'bg-green-500 text-white font-bold'
                        : 'bg-habit-cream text-gray-400'
                    }`}
                    title={dateStr}
                  >
                    {isCompleted ? '✓' : ''}
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
