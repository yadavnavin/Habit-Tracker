// app/components/dialogs/AddHabitDialog.tsx

'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Habit } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingHabit?: Habit | null;
  onHabitSaved?: () => void;
}

export function AddHabitDialog({
  open,
  onOpenChange,
  editingHabit,
  onHabitSaved,
}: AddHabitDialogProps) {
  const { addHabit, updateHabit } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [color, setColor] = useState('#896C6C');

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setFrequency(editingHabit.frequency);
      setReminderEnabled(editingHabit.reminderEnabled);
      setReminderTime(editingHabit.reminderTime || '09:00');
      setColor(editingHabit.color);
    } else {
      resetForm();
    }
  }, [editingHabit, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setFrequency('daily');
    setReminderEnabled(false);
    setReminderTime('09:00');
    setColor('#896C6C');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name,
        description,
        frequency,
        reminderEnabled,
        reminderTime,
        color,
      });
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name,
        description,
        frequency,
        color,
        createdAt: new Date().toISOString().split('T')[0],
        streak: 0,
        lastCompletedDate: '',
        completedDates: [],
        reminderEnabled,
        reminderTime,
      };
      addHabit(newHabit);
    }

    resetForm();
    onOpenChange(false);
    onHabitSaved?.();
  };

  const colors = [
    '#896C6C', // Mauve
    '#E5BEB5', // Rose
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Salmon
    '#98D8C8', // Mint
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-habit-light border-habit-cream max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-habit-mauve">
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-habit-mauve font-semibold">
              Habit Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Meditation, Drink Water, Exercise"
              className="border-habit-cream focus:border-habit-mauve focus:ring-habit-mauve"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-habit-mauve font-semibold">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this habit important? (optional)"
              className="border-habit-cream focus:border-habit-mauve focus:ring-habit-mauve"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-habit-mauve font-semibold">
                Frequency
              </Label>
              <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                <SelectTrigger className="border-habit-cream">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-habit-cream">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-habit-mauve font-semibold">Color</Label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      color === c ? 'border-habit-mauve scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-habit-cream">
            <div className="flex items-center gap-3">
              <Checkbox
                id="reminder"
                checked={reminderEnabled}
                onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
                className="border-habit-mauve text-habit-mauve"
              />
              <Label htmlFor="reminder" className="text-habit-mauve font-medium cursor-pointer">
                Set Daily Reminder
              </Label>
            </div>

            {reminderEnabled && (
              <div className="pl-9 space-y-2">
                <Label htmlFor="reminderTime" className="text-habit-mauve text-sm">
                  Reminder Time
                </Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="border-habit-cream focus:border-habit-mauve focus:ring-habit-mauve"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="border-habit-mauve text-habit-mauve"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-habit-mauve text-white hover:bg-habit-rose"
            >
              {editingHabit ? 'Update Habit' : 'Create Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
