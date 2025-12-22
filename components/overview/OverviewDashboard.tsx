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
  const { selectedDate, toggleTaskCompletion, getTodayTasks, habits, deleteTask } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get fresh data
  const todayTasks = getTodayTasks();
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const totalTasks = todayTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const completedHabits = habits.filter(h => h.completedDates.includes(selectedDate)).length;
  const totalHabits = habits.length;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);

  const overallProgress = totalTasks + totalHabits > 0 
    ? ((completedTasks + completedHabits) / (totalTasks + totalHabits)) * 100 
    : 0;

  // Chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = getTodayTasks().filter(t => t.date === dateStr);
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3C53]">New Report</h1>
          <p className="text-sm text-gray-500 mt-1">
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
          className="bg-[#234C6A] text-white hover:bg-[#1B3C53] shadow-sm rounded-lg h-10 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Revenue-style Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stat - Overall Progress */}
        <Card className="lg:col-span-2 border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-[#1B3C53]">Overall Progress</CardTitle>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-[#1B3C53]">
                {completedTasks + completedHabits}
              </span>
              <span className="text-2xl text-gray-400">
                /{totalTasks + totalHabits}
              </span>
              <Badge className={`ml-3 ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}
              </Badge>
              <Badge className="bg-[#234C6A] text-white">
                {Math.round(overallProgress)}%
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              vs prev. day • {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </CardHeader>
        </Card>

        {/* Top Sales Style - Top Performer */}
        <Card className="border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase">Top Category</CardTitle>
            <div className="mt-4 flex items-center gap-3">
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

      {/* Stats Cards - Platform Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(taskProgress)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1B3C53]">{completedTasks}</p>
            <p className="text-sm text-gray-600 mt-1">Tasks completed</p>
            <Progress value={taskProgress} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Habits */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#234C6A] flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <Badge variant="outline" className="text-xs">
                {Math.round(habitProgress)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1B3C53]">{completedHabits}</p>
            <p className="text-sm text-gray-600 mt-1">Habits tracked</p>
            <Progress value={habitProgress} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Best: {longestStreak}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1B3C53]">{totalStreak}</p>
            <p className="text-sm text-gray-600 mt-1">Day streak</p>
            <div className="mt-3 flex items-center text-xs text-orange-600">
              <Flame className="w-3 h-3 mr-1" />
              Keep going!
            </div>
          </CardContent>
        </Card>

        {/* Score */}
        <Card className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                Daily
              </Badge>
            </div>
            <p className="text-2xl font-bold text-[#1B3C53]">{Math.round(overallProgress)}</p>
            <p className="text-sm text-gray-600 mt-1">Points earned</p>
            <div className="mt-3 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Excellent!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout - Tasks + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks - Platform List Style */}
        <Card className="border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#234C6A] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-[#1B3C53]">Today's Tasks</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {completedTasks} of {totalTasks} completed
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowAddTask(true)}
                size="sm"
                variant="ghost"
                className="text-[#234C6A] hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 max-h-[400px] overflow-y-auto">
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl transition-all group border ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-[#234C6A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                        className="w-4 h-4 border-2 border-[#234C6A] data-[state=checked]:bg-[#234C6A]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          task.completed ? 'line-through text-gray-400' : 'text-[#1B3C53]'
                        }`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.time}
                        </span>
                        {task.frequency !== 'once' && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
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
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-[#1B3C53] mb-1">No tasks yet</h3>
                <p className="text-sm text-gray-500 mb-4">Start by adding your first task</p>
                <Button
                  onClick={() => setShowAddTask(true)}
                  size="sm"
                  className="bg-[#234C6A] text-white hover:bg-[#1B3C53]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <Card className="border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#234C6A] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-[#1B3C53]">Weekly Trend</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Last 7 days performance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#6B7280', fontSize: 11 }}
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
      <Card className="border border-gray-200 rounded-2xl shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-[#1B3C53]">Achievements</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Unlock badges by reaching milestones
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
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
