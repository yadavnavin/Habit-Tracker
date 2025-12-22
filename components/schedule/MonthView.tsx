// app/components/schedule/MonthView.tsx

'use client';

import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';

export function MonthView() {
  const { tasks, selectedDate, toggleTaskCompletion } = useStore();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const getMonthDays = () => {
    const current = new Date(selectedDate);
    current.setMonth(current.getMonth() + monthOffset);
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    const days = [];
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      days.push(startDate.toISOString().split('T')[0]);
      startDate.setDate(startDate.getDate() + 1);
    }

    return days;
  };

  // ✅ Check if task should appear on this date based on frequency
  const shouldShowTaskOnDate = (task: any, targetDate: string): boolean => {
    const taskDate = new Date(task.date);
    const checkDate = new Date(targetDate);
    
    // Task must start on or before the target date
    if (taskDate > checkDate) return false;

    switch (task.frequency) {
      case 'daily':
        return true; // Show every day after start date

      case 'weekly':
        // Show on same day of week as original task
        return taskDate.getDay() === checkDate.getDay();

      case 'monthly':
        // Show on same date each month
        return taskDate.getDate() === checkDate.getDate();

      case 'once':
      default:
        // Show only on exact date
        return task.date === targetDate;
    }
  };

  const getTasksForDay = (date: string) => {
    return tasks.filter((task) => shouldShowTaskOnDate(task, date));
  };

  const getCompletionPercentage = (date: string) => {
    const dayTasks = getTasksForDay(date);
    if (dayTasks.length === 0) return 0;
    const completed = dayTasks.filter((t) => t.completed).length;
    return Math.round((completed / dayTasks.length) * 100);
  };

  const getHeatmapColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-100';
    if (percentage < 25) return 'bg-red-200';
    if (percentage < 50) return 'bg-orange-200';
    if (percentage < 75) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  const monthDays = getMonthDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const current = new Date(selectedDate);
  current.setMonth(current.getMonth() + monthOffset);
  const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isCurrentMonth = (date: string) => {
    return date.substring(0, 7) === current.toISOString().split('T')[0].substring(0, 7);
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          className="border-[#234C6A] text-[#234C6A] hover:bg-[#234C6A] hover:text-white transition-all duration-200"
          onClick={() => setMonthOffset(monthOffset - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold text-[#234C6A]">{monthName}</h2>
        <Button
          variant="outline"
          size="sm"
          className="border-[#234C6A] text-[#234C6A] hover:bg-[#234C6A] hover:text-white transition-all duration-200"
          onClick={() => setMonthOffset(monthOffset + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="glass rounded-2xl shadow-brown-lg border border-habit-rose/30 p-6">
        <div className="grid grid-cols-7 gap-3">
          {/* Day Headers */}
          {dayNames.map((day) => (
            <div key={day} className="text-center font-bold text-[#234C6A] py-3 text-sm">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {monthDays.map((date) => {
            const dayTasks = getTasksForDay(date);
            const percentage = getCompletionPercentage(date);
            const isThisMonth = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={date}
                onClick={() => setSelectedDay(selectedDay === date ? null : date)}
                className={`relative p-3 rounded-xl text-center text-sm cursor-pointer transition-all duration-300 card-hover ${
                  getHeatmapColor(percentage)
                } ${!isThisMonth ? 'opacity-40' : 'opacity-100'} ${
                  isTodayDate ? 'ring-2 ring-[#234C6A] shadow-lg' : ''
                } ${selectedDay === date ? 'scale-105 shadow-xl' : ''}`}
              >
                <p className={`font-bold mb-2 ${isTodayDate ? 'text-[#234C6A]' : 'text-gray-700'}`}>
                  {date.split('-')[2]}
                </p>
                
                {dayTasks.length > 0 && (
                  <Badge className="bg-[#234C6A] text-white text-xs px-2 py-0.5">
                    {dayTasks.filter((t) => t.completed).length}/{dayTasks.length}
                  </Badge>
                )}

                {/* Task Indicator Dots */}
                {dayTasks.length > 0 && (
                  <div className="flex justify-center gap-1 mt-2">
                    {dayTasks.slice(0, 3).map((task, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.completed ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-gray-500">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Day Tasks */}
      {selectedDay && (
        <Card className="glass rounded-2xl shadow-brown-lg border border-habit-rose/30 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-xl font-bold text-[#234C6A] mb-4">
            Tasks for {new Date(selectedDay).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="space-y-3">
            {getTasksForDay(selectedDay).map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl transition-all duration-200 card-hover ${
                  task.completed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="w-5 h-5 rounded border-2 border-[#234C6A] text-[#456882]"
                  />
                  <div className="flex-1">
                    <p className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-[#234C6A]'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.frequency}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {task.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getTasksForDay(selectedDay).length === 0 && (
              <p className="text-center text-gray-500 py-8">No tasks for this day</p>
            )}
          </div>
        </Card>
      )}

      {/* Heatmap Legend */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { color: 'bg-gray-100', label: '0%' },
          { color: 'bg-red-200', label: '1-24%' },
          { color: 'bg-orange-200', label: '25-49%' },
          { color: 'bg-yellow-200', label: '50-74%' },
          { color: 'bg-green-200', label: '75-100%' },
        ].map((item) => (
          <div key={item.label} className="text-xs text-center">
            <div className={`${item.color} h-8 rounded-lg shadow-sm`}></div>
            <p className="mt-2 text-gray-600 font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
