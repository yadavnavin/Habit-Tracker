// app/components/dialogs/AddTaskDialog.tsx

'use client';

import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

export function AddTaskDialog({ open, onOpenChange, editingTask }: AddTaskDialogProps) {
  const { addTask, updateTask, selectedDate } = useStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setTime(editingTask.time);
      setFrequency(editingTask.frequency || 'once');
    } else {
      setTitle('');
      setDescription('');
      setTime('09:00');
      setFrequency('once');
    }
  }, [editingTask, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time,
      frequency,
      completed: false,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#234C6A]">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#234C6A] font-semibold">
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning workout"
              className="border-[#E3E3E3] focus:border-[#456882] focus:ring-[#456882]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#234C6A] font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="border-[#E3E3E3] focus:border-[#456882] focus:ring-[#456882] min-h-[80px]"
            />
          </div>

          {/* Time and Frequency Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-[#234C6A] font-semibold">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-[#E3E3E3] focus:border-[#456882] focus:ring-[#456882]"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-[#234C6A] font-semibold">
                Frequency
              </Label>
              <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                <SelectTrigger className="border-[#E3E3E3] focus:border-[#456882] focus:ring-[#456882]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency Description */}
          <div className="bg-[#E3E3E3]/30 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              {frequency === 'once' && '✓ Task appears only on the selected date'}
              {frequency === 'daily' && '✓ Task appears every day from the selected date'}
              {frequency === 'weekly' && '✓ Task appears every week on the same day'}
              {frequency === 'monthly' && '✓ Task appears every month on the same date'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#E3E3E3] text-gray-700 hover:bg-[#E3E3E3]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#234C6A] text-white hover:bg-[#1B3C53]"
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
