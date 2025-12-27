// app/components/schedule/MonthView.tsx

'use client';

import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CalendarDays,
  Briefcase,
  Palmtree,
  CalendarClock,
  Target,
  CalendarRange,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { Task } from '@/lib/types';

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

  // ✅ Updated with all frequency types
  const shouldShowTaskOnDate = (task: Task, targetDate: string): boolean => {
    const taskDate = new Date(task.date);
    const checkDate = new Date(targetDate);
    
    if (taskDate > checkDate) return false;

    const targetDay = checkDate.getDay();

    switch (task.frequency) {
      case 'daily':
        return true;

      case 'weekdays':
        return targetDay >= 1 && targetDay <= 5;

      case 'weekends':
        return targetDay === 0 || targetDay === 6;

      case 'weekly':
        return taskDate.getDay() === targetDay;

      case 'custom':
        return task.selectedDays?.includes(targetDay) || false;

      case 'monthly':
        return taskDate.getDate() === checkDate.getDate();

      case 'once':
      default:
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

  const getHeatmapColor = (percentage: number, hasHighPriority: boolean) => {
    if (percentage === 0) {
      return hasHighPriority ? 'bg-red-50 border-red-200' : 'bg-gray-50';
    }
    if (percentage < 25) return 'bg-red-100 border-red-200';
    if (percentage < 50) return 'bg-orange-100 border-orange-200';
    if (percentage < 75) return 'bg-yellow-100 border-yellow-200';
    return 'bg-green-100 border-green-200';
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return <CalendarDays className="w-2.5 h-2.5" />;
      case 'weekdays':
        return <Briefcase className="w-2.5 h-2.5" />;
      case 'weekends':
        return <Palmtree className="w-2.5 h-2.5" />;
      case 'weekly':
        return <CalendarClock className="w-2.5 h-2.5" />;
      case 'custom':
        return <Target className="w-2.5 h-2.5" />;
      case 'monthly':
        return <CalendarRange className="w-2.5 h-2.5" />;
      default:
        return <Calendar className="w-2.5 h-2.5" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-300';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300';
      case 'low':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-white border-gray-200';
    }
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

  const isWeekend = (date: string) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  const hasHighPriorityTasks = (date: string) => {
    return getTasksForDay(date).some(task => task.priority === 'high' && !task.completed);
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#234C6A]">{monthName}</h2>
          <p className="text-sm text-gray-500 mt-1">Click any day to view tasks</p>
        </div>
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
      <Card className="rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {dayNames.map((day, idx) => (
            <div 
              key={day} 
              className={`text-center font-bold py-3 text-sm ${
                idx === 0 || idx === 6 ? 'text-orange-600' : 'text-[#234C6A]'
              }`}
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {monthDays.map((date) => {
            const dayTasks = getTasksForDay(date);
            const percentage = getCompletionPercentage(date);
            const isThisMonth = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            const isWeekendDay = isWeekend(date);
            const hasHighPriority = hasHighPriorityTasks(date);

            return (
              <div
                key={date}
                onClick={() => setSelectedDay(selectedDay === date ? null : date)}
                className={`relative p-3 rounded-xl text-center text-sm cursor-pointer transition-all duration-300 hover:scale-105 border ${
                  getHeatmapColor(percentage, hasHighPriority)
                } ${!isThisMonth ? 'opacity-40' : 'opacity-100'} ${
                  isTodayDate ? 'ring-2 ring-[#234C6A] shadow-lg' : ''
                } ${selectedDay === date ? 'scale-105 shadow-xl ring-2 ring-[#456882]' : ''} ${
                  isWeekendDay && isThisMonth ? 'bg-orange-50/50' : ''
                }`}
              >
                <p className={`font-bold mb-2 ${
                  isTodayDate ? 'text-[#234C6A]' : 
                  isWeekendDay ? 'text-orange-600' : 
                  'text-gray-700'
                }`}>
                  {date.split('-')[2]}
                </p>
                
                {hasHighPriority && (
                  <div className="absolute top-1 right-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  </div>
                )}

                {dayTasks.length > 0 && (
                  <Badge className="bg-[#234C6A] text-white text-xs px-2 py-0.5 mb-2">
                    {dayTasks.filter((t) => t.completed).length}/{dayTasks.length}
                  </Badge>
                )}

                {/* Task Indicator Dots with Frequency Icons */}
                {dayTasks.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {dayTasks.slice(0, 4).map((task, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.completed ? 'bg-green-500' : 
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 4 && (
                      <span className="text-[8px] text-gray-500 font-semibold">+{dayTasks.length - 4}</span>
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
        <Card className="rounded-2xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[#234C6A] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(selectedDay).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(null)}
              className="text-gray-500 hover:text-[#234C6A]"
            >
              Close
            </Button>
          </div>

          <div className="space-y-3">
            {getTasksForDay(selectedDay).length > 0 ? (
              getTasksForDay(selectedDay).map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl transition-all duration-200 hover:shadow-md border ${
                    task.completed
                      ? 'bg-green-50 border-green-200'
                      : getPriorityColor(task.priority)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1 border-2 border-[#234C6A] data-[state=checked]:bg-[#234C6A]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${
                        task.completed ? 'line-through text-gray-400' : 'text-[#234C6A]'
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {getFrequencyIcon(task.frequency)}
                          <span className="capitalize">{task.frequency}</span>
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {task.time}
                        </div>
                        {task.priority && (
                          <Badge className={`text-xs ${
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          } text-white`}>
                            {task.priority}
                          </Badge>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                      {task.frequency === 'custom' && task.selectedDays && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          Days: {task.selectedDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No tasks for this day</p>
                <p className="text-xs text-gray-400 mt-1">
                  {isWeekend(selectedDay) ? 'Enjoy your day off!' : 'Add a task to get started'}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Heatmap Legend */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { color: 'bg-gray-50 border border-gray-200', label: 'No tasks', desc: '0%' },
          { color: 'bg-red-100 border border-red-200', label: 'Low', desc: '1-24%' },
          { color: 'bg-orange-100 border border-orange-200', label: 'Medium', desc: '25-49%' },
          { color: 'bg-yellow-100 border border-yellow-200', label: 'Good', desc: '50-74%' },
          { color: 'bg-green-100 border border-green-200', label: 'Excellent', desc: '75-100%' },
        ].map((item) => (
          <div key={item.label} className="text-xs text-center">
            <div className={`${item.color} h-10 rounded-lg shadow-sm flex items-center justify-center`}>
              <span className="font-semibold text-gray-700">{item.desc}</span>
            </div>
            <p className="mt-2 text-gray-600 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded border-2 border-[#234C6A]"></div>
          <span className="text-gray-700">Today</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-orange-50 border border-orange-200"></div>
          <span className="text-gray-700">Weekend</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-gray-700">High Priority</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
          <span className="text-gray-700">All Complete</span>
        </div>
      </div>
    </div>
  );
}
