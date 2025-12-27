// app/components/habits/HabitTracker.tsx

'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { HabitCard } from './HabitCard';
import { StreakCounter } from './StreakCounter';
import { Habit } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { AddHabitDialog } from '../dialogs/AddHabitDialog';

export function HabitTracker() {
  const { habits, selectedDate, updateAllStreaks } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    // Update all streaks when component mounts
    if (updateAllStreaks) {
      updateAllStreaks();
    }
  }, [updateAllStreaks]);

  const todayHabits = habits;
  const completedCount = habits.filter((h) =>
    h.completedDates.includes(selectedDate)
  ).length;

  const completionPercentage = todayHabits.length > 0 
    ? Math.round((completedCount / todayHabits.length) * 100)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3C53]">Habit Tracker</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingHabit(null);
            setIsDialogOpen(true);
          }}
          className="bg-[#234C6A] text-white hover:bg-[#1B3C53] shadow-sm rounded-lg h-10 px-4 sm:px-6 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-[#234C6A] to-[#456882] text-white overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Today's Progress</p>
              <p className="text-2xl sm:text-4xl font-bold mt-1">
                {completedCount}/{todayHabits.length}
              </p>
              <p className="text-xs opacity-75 mt-1">{completionPercentage}% complete</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm opacity-90">Total Streaks</p>
              <p className="text-2xl sm:text-4xl font-bold mt-1">
                {todayHabits.reduce((acc, h) => acc + h.streak, 0)}
              </p>
              <p className="text-xs opacity-75 mt-1">combined days</p>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-end">
              <Button
                onClick={() => {
                  setEditingHabit(null);
                  setIsDialogOpen(true);
                }}
                className="bg-white text-[#234C6A] hover:bg-gray-100 w-full h-10 sm:h-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Add Habit</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Streak Stats */}
      {todayHabits.length > 0 && (
        <StreakCounter habits={todayHabits} />
      )}

      {/* Habits Grid */}
      {todayHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {todayHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={(h) => {
                setEditingHabit(h);
                setIsDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-white border border-gray-200">
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg mb-4">
              No habits yet. Start building good habits today!
            </p>
            <Button
              onClick={() => {
                setEditingHabit(null);
                setIsDialogOpen(true);
              }}
              className="bg-[#234C6A] text-white hover:bg-[#1B3C53]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Habit
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Habit Dialog */}
      <AddHabitDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingHabit(null);
          }
        }}
        editingHabit={editingHabit}
        onHabitSaved={() => {
          setEditingHabit(null);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}
