// app/components/habits/HabitTracker.tsx

'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { HabitCard } from './HabitCard';
import { Habit } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddHabitDialog } from '../dialogs/AddHabitDialog';

export function HabitTracker() {
  const { habits, selectedDate } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const todayHabits = habits;
  const completedCount = habits.filter((h) =>
    h.completedDates.includes(selectedDate)
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-habit-mauve to-habit-rose text-white p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm opacity-80">Today's Habits</p>
            <p className="text-4xl font-bold">{completedCount}/{todayHabits.length}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Current Streaks</p>
            <p className="text-4xl font-bold">
              {todayHabits.reduce((acc, h) => acc + h.streak, 0)}
            </p>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-white text-habit-mauve hover:bg-habit-light w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </div>
      </Card>

      {/* Habits Grid */}
      {todayHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <Card className="bg-white border-habit-cream p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No habits yet. Start building good habits today!</p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-habit-mauve text-white hover:bg-habit-rose"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Habit
          </Button>
        </Card>
      )}

      {/* Add/Edit Habit Dialog */}
      <AddHabitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingHabit={editingHabit}
        onHabitSaved={() => {
          setEditingHabit(null);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}
