// app/components/schedule/WeekView.tsx

'use client';

import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Task } from '@/lib/types';

export function WeekView() {
  const { tasks, selectedDate } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);

  // ✅ Helper function to check if task should appear on date
  const shouldShowTaskOnDate = (task: Task, targetDate: string): boolean => {
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

  const getWeekDays = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + weekOffset * 7);
    const first = new Date(current);
    first.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(first);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // ✅ Use recurring task logic
  const getTasksForDay = (date: string) => {
    return tasks.filter((task) => shouldShowTaskOnDate(task, date));
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const formatDateRange = () => {
    const start = new Date(weekDays[0]);
    const end = new Date(weekDays[6]);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="border-[#234C6A] text-[#234C6A] hover:bg-[#234C6A] hover:text-white transition-all duration-200"
          onClick={() => setWeekOffset(weekOffset - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#234C6A]">This Week</h2>
          <p className="text-sm text-gray-600 mt-1">{formatDateRange()}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-[#234C6A] text-[#234C6A] hover:bg-[#234C6A] hover:text-white transition-all duration-200"
          onClick={() => setWeekOffset(weekOffset + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Grid - Fixed width with scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-7 gap-3 min-w-[900px]">
          {weekDays.map((date, index) => {
            const dayTasks = getTasksForDay(date);
            const completed = dayTasks.filter((t) => t.completed).length;
            const isTodayDate = isToday(date);

            return (
              <Card
                key={date}
                className={`glass rounded-2xl shadow-brown-lg border transition-all duration-300 card-hover ${
                  isTodayDate 
                    ? 'border-[#234C6A] ring-2 ring-[#234C6A]/30' 
                    : 'border-[#E3E3E3] hover:border-[#456882]'
                }`}
              >
                {/* Day Header */}
                <div className={`p-4 text-center border-b ${
                  isTodayDate ? 'bg-[#234C6A] text-white' : 'bg-[#F8F9FA] text-[#234C6A]'
                }`}>
                  <p className="text-xs font-semibold uppercase mb-1">
                    {dayNames[index].substring(0, 3)}
                  </p>
                  <p className="text-2xl font-bold">
                    {date.split('-')[2]}
                  </p>
                </div>

                {/* Task Count Badge */}
                <div className="p-3 text-center border-b border-gray-100">
                  <Badge className={`${
                    completed === dayTasks.length && dayTasks.length > 0
                      ? 'bg-green-500'
                      : 'bg-[#234C6A]'
                  } text-white text-sm px-3 py-1`}>
                    {completed}/{dayTasks.length}
                  </Badge>
                </div>

                {/* Task List */}
                <div className="p-3 space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                  {dayTasks.length > 0 ? (
                    <>
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-2 rounded-lg font-medium transition-all duration-200 ${
                            task.completed
                              ? 'bg-green-50 text-green-700 line-through border border-green-200'
                              : 'bg-white text-[#234C6A] border border-[#E3E3E3] hover:border-[#456882]'
                          }`}
                        >
                          <p className="truncate font-semibold">{task.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-500">{task.time}</span>
                            {task.frequency !== 'once' && (
                              <span className="text-[9px] bg-[#456882] text-white px-1.5 py-0.5 rounded">
                                {task.frequency}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                      <Calendar className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs">No tasks</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#234C6A]"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-[#234C6A]"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
