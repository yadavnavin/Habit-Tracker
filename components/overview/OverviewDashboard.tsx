// app/components/overview/OverviewDashboard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Target, 
  Zap,
  Calendar,
  Clock,
  Award,
  Flame,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AchievementBadges } from '@/components/gamification/AchievementBadges';
import { AddTaskDialog } from '@/components/dialogs/AddTaskDialog';
import { Task } from '@/lib/types';

export function OverviewDashboard() {
  const { 
    selectedDate, 
    toggleTaskCompletion, 
    tasks, 
    habits, 
    deleteTask, 
    getTasksForDate,
    calculateCurrentStreak,
    getLongestStreak,
    updateAllStreaks
  } = useStore();
  
  const [mounted, setMounted] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setMounted(true);
    // Update all streaks on mount
    if (updateAllStreaks) {
      updateAllStreaks();
    }
  }, [updateAllStreaks]);

  // ✅ Re-calculate when selectedDate changes
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedHabits, setCompletedHabits] = useState(0);

  useEffect(() => {
    if (mounted) {
      // Get tasks for the selected date
      const tasksForDate = getTasksForDate ? getTasksForDate(selectedDate) : [];

      setTodayTasks(tasksForDate);
      setCompletedTasks(tasksForDate.filter(t => t.completed).length);
      setTotalTasks(tasksForDate.length);
      
      // Get habits completed on selected date
      const habitsCompleted = habits.filter(h => h.completedDates.includes(selectedDate)).length;
      setCompletedHabits(habitsCompleted);
    }
  }, [selectedDate, tasks, habits, mounted, getTasksForDate]);

  if (!mounted) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div className="h-24 sm:h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 sm:h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalHabits = habits.length;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  // ✅ Calculate actual current streaks (consecutive days)
  const totalStreak = habits.reduce((acc, h) => {
    const currentStreak = calculateCurrentStreak ? calculateCurrentStreak(h.id) : h.streak;
    return acc + currentStreak;
  }, 0);

  // ✅ Get longest streak across all habits
  const longestStreak = Math.max(
    ...habits.map(h => getLongestStreak ? getLongestStreak(h.id) : h.streak),
    0
  );

  // ✅ Get active streaks count (habits with streak > 0)
  const activeStreaks = habits.filter(h => {
    const currentStreak = calculateCurrentStreak ? calculateCurrentStreak(h.id) : h.streak;
    return currentStreak > 0;
  }).length;

  const overallProgress = totalTasks + totalHabits > 0 
    ? ((completedTasks + completedHabits) / (totalTasks + totalHabits)) * 100 
    : 0;

  // Chart data for last 7 days from selected date
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    // Get tasks for this day
    const dayTasks = getTasksForDate ? getTasksForDate(dateStr) : [];
    const dayCompletedTasks = dayTasks.filter(t => t.completed).length;
    const dayHabits = habits.filter(h => h.completedDates.includes(dateStr)).length;
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      tasks: dayCompletedTasks,
      habits: dayHabits,
      total: dayCompletedTasks + dayHabits,
    };
  });

  const chartConfig = {
    tasks: {
      label: 'Tasks',
      color: '#456882',
    },
    habits: {
      label: 'Habits',
      color: '#234C6A',
    },
  } satisfies ChartConfig;

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddTask(true);
  };

  const handleCloseDialog = () => {
    setShowAddTask(false);
    setEditingTask(null);
  };

  // Calculate trends
  const yesterdayCompleted = chartData[5]?.total || 0;
  const todayCompleted = completedTasks + completedHabits;
  const trend = todayCompleted - yesterdayCompleted;

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Page Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B3C53]">Daily Report</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <Button
          onClick={() => setShowAddTask(true)}
          className="bg-[#234C6A] text-white hover:bg-[#1B3C53] shadow-sm rounded-lg h-10 px-4 sm:px-6 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Revenue-style Stats Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Stat - Overall Progress */}
        <Card className="lg:col-span-2 border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-[#1B3C53]">Overall Progress</CardTitle>
            <div className="flex flex-wrap items-baseline gap-2 mt-3 sm:mt-4">
              <span className="text-3xl sm:text-4xl font-bold text-[#1B3C53]">
                {completedTasks + completedHabits}
              </span>
              <span className="text-xl sm:text-2xl text-gray-400">
                /{totalTasks + totalHabits}
              </span>
              <Badge className={`ml-2 sm:ml-3 ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}
              </Badge>
              <Badge className="bg-[#234C6A] text-white">
                {Math.round(overallProgress)}%
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              vs prev. day • Week of {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </CardHeader>
        </Card>

        {/* Top Performer */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-gray-600 uppercase">Top Category</CardTitle>
            <div className="mt-3 sm:mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#234C6A] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1B3C53]">Habits</p>
                <p className="text-xs text-gray-500">{completedHabits}/{totalHabits} completed</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tasks */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(taskProgress)}%
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{completedTasks}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Tasks completed</p>
            <Progress value={taskProgress} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Habits */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#234C6A] flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(habitProgress)}%
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{completedHabits}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Habits tracked</p>
            <Progress value={habitProgress} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Best: {longestStreak}
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{totalStreak}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Day streak</p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex items-center text-xs text-orange-600">
                <Flame className="w-3 h-3 mr-1" />
                <span className="truncate">{activeStreaks > 0 ? `${activeStreaks} active` : 'Start'}</span>
              </div>
              {totalStreak > 0 && (
                <Badge className="bg-orange-500 text-white text-xs px-2 w-fit">
                  On Fire
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Daily
              </Badge>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1B3C53]">{Math.round(overallProgress)}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Points earned</p>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Excellent!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Today's Tasks */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#234C6A] flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-lg text-[#1B3C53] truncate">
                    <span className="hidden sm:inline">Tasks for </span>
                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {completedTasks} of {totalTasks} completed
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowAddTask(true)}
                size="sm"
                variant="ghost"
                className="text-[#234C6A] hover:bg-gray-100 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all group border ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-[#234C6A]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="w-4 h-4 border-2 border-[#234C6A] data-[state=checked]:bg-[#234C6A] mt-0.5 sm:mt-0 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium truncate ${
                          task.completed ? 'line-through text-gray-400' : 'text-[#1B3C53]'
                        }`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5 hidden sm:block">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.time}
                        </span>
                        {task.frequency !== 'once' && (
                          <Badge variant="outline" className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 hidden sm:inline-flex">
                            {task.frequency}
                          </Badge>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-[#234C6A]"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-500"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#1B3C53] mb-1">No tasks for this day</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">Add a task to get started</p>
                <Button
                  onClick={() => setShowAddTask(true)}
                  size="sm"
                  className="bg-[#234C6A] text-white hover:bg-[#1B3C53] text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#234C6A] flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-lg text-[#1B3C53]">Weekly Trend</CardTitle>
                <CardDescription className="text-xs mt-0.5 truncate">
                  Last 7 days
                  <span className="hidden sm:inline"> from {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#456882" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#456882" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="habitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#234C6A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#234C6A" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#456882" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tasksGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="habits" 
                  stroke="#234C6A" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#habitsGradient)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-lg text-[#1B3C53]">Achievements</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Unlock badges by reaching milestones
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <AchievementBadges />
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddTask}
        onOpenChange={handleCloseDialog}
        editingTask={editingTask}
      />
    </div>
  );
}
