// app/components/dialogs/AddTaskDialog.tsx

'use client';

import { useStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { Calendar, Clock, Repeat } from 'lucide-react';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

type FrequencyType = 'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom' | 'monthly';

export function AddTaskDialog({ open, onOpenChange, editingTask }: AddTaskDialogProps) {
  const { addTask, updateTask, selectedDate } = useStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState<FrequencyType>('once');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Sun', name: 'Sunday' },
    { value: 1, label: 'Mon', name: 'Monday' },
    { value: 2, label: 'Tue', name: 'Tuesday' },
    { value: 3, label: 'Wed', name: 'Wednesday' },
    { value: 4, label: 'Thu', name: 'Thursday' },
    { value: 5, label: 'Fri', name: 'Friday' },
    { value: 6, label: 'Sat', name: 'Saturday' },
  ];

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setTime(editingTask.time);
      setFrequency((editingTask.frequency as FrequencyType) || 'once');
      setPriority(editingTask.priority || 'medium');
      setCategory(editingTask.category || '');
      setSelectedDays(editingTask.selectedDays || []);
    } else {
      resetForm();
    }
  }, [editingTask, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime('09:00');
    setFrequency('once');
    setSelectedDays([]);
    setPriority('medium');
    setCategory('');
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleFrequencyChange = (value: FrequencyType) => {
    setFrequency(value);
    
    // Auto-select days based on frequency
    if (value === 'weekdays') {
      setSelectedDays([1, 2, 3, 4, 5]); // Mon-Fri
    } else if (value === 'weekends') {
      setSelectedDays([0, 6]); // Sat-Sun
    } else if (value === 'daily') {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // All days
    } else if (value === 'weekly') {
      const currentDay = new Date(selectedDate).getDay();
      setSelectedDays([currentDay]); // Same day each week
    } else if (value !== 'custom') {
      setSelectedDays([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    // Validate custom frequency
    if (frequency === 'custom' && selectedDays.length === 0) {
      alert('Please select at least one day for custom frequency');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time,
      frequency,
      selectedDays,
      priority,
      category: category.trim(),
      completed: false,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }

    onOpenChange(false);
    resetForm();
  };

  const getFrequencyDescription = () => {
    switch (frequency) {
      case 'once':
        return '✓ Task appears only on the selected date';
      case 'daily':
        return '✓ Task appears every day from the selected date';
      case 'weekdays':
        return '✓ Task appears Monday through Friday';
      case 'weekends':
        return '✓ Task appears on Saturday and Sunday';
      case 'weekly':
        return '✓ Task appears every week on the same day';
      case 'custom':
        return selectedDays.length > 0 
          ? `✓ Task appears on: ${selectedDays.map(d => daysOfWeek[d].label).join(', ')}`
          : '⚠ Please select at least one day';
      case 'monthly':
        return '✓ Task appears every month on the same date';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#234C6A] flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#234C6A] font-semibold text-sm">
              Task Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning workout"
              className="border-gray-300 focus:border-[#234C6A] focus:ring-[#234C6A]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#234C6A] font-semibold text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="border-gray-300 focus:border-[#234C6A] focus:ring-[#234C6A] min-h-[80px]"
            />
          </div>

          {/* Time and Priority */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-[#234C6A] font-semibold text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-gray-300 focus:border-[#234C6A] focus:ring-[#234C6A]"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-[#234C6A] font-semibold text-sm">
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="border-gray-300 focus:border-[#234C6A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-[#234C6A] font-semibold text-sm">
              Category (Optional)
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Work, Personal, Health"
              className="border-gray-300 focus:border-[#234C6A] focus:ring-[#234C6A]"
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency" className="text-[#234C6A] font-semibold text-sm flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Frequency
            </Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="border-gray-300 focus:border-[#234C6A]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Every Day</SelectItem>
                <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                <SelectItem value="weekends">Weekends (Sat-Sun)</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom Days</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Days Selection */}
          {frequency === 'custom' && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <Label className="text-[#234C6A] font-semibold text-sm">
                Select Days
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`p-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedDays.includes(day.value)
                        ? 'bg-[#234C6A] text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-[#234C6A]'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency Description */}
          <div className={`p-3 rounded-lg ${
            frequency === 'custom' && selectedDays.length === 0
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className="text-xs text-gray-700 font-medium">
              {getFrequencyDescription()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#234C6A] text-white hover:bg-[#1B3C53] shadow-sm"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
