// app/components/common/Navbar.tsx

'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Search, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  Settings,
  User,
  LogOut,
  HelpCircle,
  X,
  Menu
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SearchDialog } from '@/components/dialogs/SearchDialog';

// ADD THIS INTERFACE
interface NavbarProps {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
}

// Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'warning' | 'info';
}

// UPDATE FUNCTION SIGNATURE TO ACCEPT PROPS
export function Navbar({ onMenuClick, onToggleSidebar }: NavbarProps) {
  const { selectedDate, setSelectedDate, tasks, habits } = useStore();
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Task Completed',
      message: 'You completed "Morning workout"',
      time: '5 min ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Streak Alert',
      message: 'You\'re on a 7-day streak! Keep going!',
      time: '1 hour ago',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Reminder',
      message: 'Don\'t forget your evening routine',
      time: '3 hours ago',
      read: true,
      type: 'warning'
    }
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearchDialog(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-8 flex items-center justify-between">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-6 flex-1">
            {/* MOBILE MENU BUTTON - ADD THIS */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-gray-600 hover:text-[#234C6A] hover:bg-gray-100 rounded-lg"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-[#234C6A] p-2.5 rounded-xl shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#234C6A]">Habit Flow</h1>
              </div>
            </div>

            {/* Search Button (opens dialog) */}
            <div className="flex-1 max-w-md">
              <button
                onClick={() => setShowSearchDialog(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
              >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-[#234C6A]" />
                <span className="text-gray-500 flex-1">Try searching "morning routine"</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            </div>
          </div>

          {/* Center: Date Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-[#234C6A] hover:bg-gray-100 rounded-lg"
              onClick={() => changeDate(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="min-w-[180px] text-center">
              <p className="text-sm font-semibold text-[#1B3C53]">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-[#234C6A] hover:bg-gray-100 rounded-lg"
              onClick={() => changeDate(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {!isToday && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 ml-2 border-gray-200 text-[#234C6A] hover:bg-gray-100 rounded-lg"
                onClick={goToToday}
              >
                <Calendar className="w-3 h-3 mr-2" />
                Today
              </Button>
            )}
          </div>

          {/* Right: Notifications + Settings + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-600 hover:text-[#234C6A] hover:bg-gray-100 rounded-lg relative"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#1B3C53]">Notifications</h3>
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-[#234C6A] hover:bg-gray-100"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'success' ? 'bg-green-100' :
                              notification.type === 'warning' ? 'bg-orange-100' :
                              'bg-blue-100'
                            }`}>
                              <Bell className={`w-4 h-4 ${
                                notification.type === 'success' ? 'text-green-600' :
                                notification.type === 'warning' ? 'text-orange-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1B3C53]">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        className="w-full text-sm text-[#234C6A] hover:bg-gray-100"
                        onClick={() => {
                          setShowNotifications(false);
                        }}
                      >
                        View all notifications
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-[#234C6A] hover:bg-gray-100 rounded-lg"
              onClick={() => {
                useStore.getState().setView('settings');
                setShowProfile(false);
                setShowNotifications(false);
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="ml-2 w-9 h-9 rounded-lg bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-lg transition-all"
              >
                U
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#234C6A] to-[#456882] flex items-center justify-center text-white font-bold text-lg">
                        U
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#1B3C53]">User Name</p>
                        <p className="text-xs text-gray-500">user@example.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        useStore.getState().setView('settings');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        console.log('Logout clicked');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Dialog */}
      <SearchDialog open={showSearchDialog} onOpenChange={setShowSearchDialog} />
    </>
  );
}
