// app/components/schedule/WeekView.tsx

'use client';

import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  CalendarDays,
  Briefcase,
  Palmtree,
  CalendarClock,
  Target,
  CalendarRange,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Task } from '@/lib/types';

export function WeekView() {
  const { tasks, selectedDate, toggleTaskCompletion } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);

  // ✅ Updated helper function with all frequency types
  const shouldShowTaskOnDate = (task: Task, targetDate: string): boolean => {
    const taskDate = new Date(task.date);
    const checkDate = new Date(targetDate);
    
    // Task must start on or before the target date
    if (taskDate > checkDate) return false;

    const targetDay = checkDate.getDay(); // 0=Sunday, 6=Saturday

    switch (task.frequency) {
      case 'daily':
        return true;

      case 'weekdays':
        // Monday(1) to Friday(5)
        return targetDay >= 1 && targetDay <= 5;

      case 'weekends':
        // Saturday(6) or Sunday(0)
        return targetDay === 0 || targetDay === 6;

      case 'weekly':
        // Show on same day of week as original task
        return taskDate.getDay() === targetDay;

      case 'custom':
        // Show on selected days
        return task.selectedDays?.includes(targetDay) || false;

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

  const getTasksForDay = (date: string) => {
    return tasks.filter((task) => shouldShowTaskOnDate(task, date));
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isWeekend = (date: string) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  };

  const formatDateRange = () => {
    const start = new Date(weekDays[0]);
    const end = new Date(weekDays[6]);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-700';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'low':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      case 'medium':
        return <Clock className="w-3 h-3 text-yellow-600" />;
      case 'low':
        return <Target className="w-3 h-3 text-green-600" />;
      default:
        return null;
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return <CalendarDays className="w-3 h-3" />;
      case 'weekdays':
        return <Briefcase className="w-3 h-3" />;
      case 'weekends':
        return <Palmtree className="w-3 h-3" />;
      case 'weekly':
        return <CalendarClock className="w-3 h-3" />;
      case 'custom':
        return <Target className="w-3 h-3" />;
      case 'monthly':
        return <CalendarRange className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((date, index) => {
          const dayTasks = getTasksForDay(date);
          const completed = dayTasks.filter((t) => t.completed).length;
          const isTodayDate = isToday(date);
          const isWeekendDay = isWeekend(date);

          return (
            <Card
              key={date}
              className={`rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg ${
                isTodayDate 
                  ? 'border-[#234C6A] ring-2 ring-[#234C6A]/30' 
                  : isWeekendDay
                  ? 'border-orange-200 bg-orange-50/30'
                  : 'border-gray-200 hover:border-[#456882]'
              }`}
            >
              {/* Day Header */}
              <div className={`p-4 text-center border-b ${
                isTodayDate 
                  ? 'bg-[#234C6A] text-white' 
                  : isWeekendDay
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-50 text-[#234C6A]'
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
              <div className="p-3 space-y-2 min-h-[250px] max-h-[350px] overflow-y-auto">
                {dayTasks.length > 0 ? (
                  <>
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`text-xs p-3 rounded-lg font-medium transition-all duration-200 cursor-pointer group border ${
                          task.completed
                            ? 'bg-green-50 text-green-700 line-through border-green-200'
                            : `${getPriorityColor(task.priority)} hover:shadow-md`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-[10px] text-gray-600 truncate mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                          {task.priority && !task.completed && (
                            <div className="flex-shrink-0">
                              {getPriorityIcon(task.priority)}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 text-[10px]">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{task.time}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {task.category && (
                              <span className="bg-white/50 px-2 py-0.5 rounded text-[9px] border border-gray-300">
                                {task.category}
                              </span>
                            )}
                            {task.frequency !== 'once' && (
                              <span className="bg-[#456882] text-white px-2 py-0.5 rounded text-[9px] flex items-center gap-1">
                                {getFrequencyIcon(task.frequency)}
                                <span className="capitalize">{task.frequency}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hover tooltip for custom days */}
                        {task.frequency === 'custom' && task.selectedDays && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 text-[9px] bg-white/80 p-1 rounded border border-gray-300">
                            Days: {task.selectedDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                    <Calendar className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-xs">No tasks</p>
                    <p className="text-[10px] mt-1">
                      {isWeekendDay ? 'Enjoy your weekend!' : 'Free day'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-[#234C6A]"></div>
          <span className="text-gray-700">Pending</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-700">Completed</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-[#234C6A]"></div>
          <span className="text-gray-700">Today</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300"></div>
          <span className="text-gray-700">Weekend</span>
        </div>
      </div>

      {/* Frequency Legend */}
      <div className="p-4 bg-white rounded-xl border border-gray-200">
        <h3 className="text-sm font-semibold text-[#234C6A] mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Frequency Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: CalendarDays, label: 'Daily', desc: 'Every day' },
            { icon: Briefcase, label: 'Weekdays', desc: 'Mon-Fri' },
            { icon: Palmtree, label: 'Weekends', desc: 'Sat-Sun' },
            { icon: CalendarClock, label: 'Weekly', desc: 'Same day' },
            { icon: Target, label: 'Custom', desc: 'Select days' },
            { icon: CalendarRange, label: 'Monthly', desc: 'Same date' },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.label} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className="w-6 h-6 text-[#234C6A]" />
                </div>
                <p className="text-xs font-semibold text-[#234C6A]">{item.label}</p>
                <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
