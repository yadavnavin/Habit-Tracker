// app/components/common/Sidebar.tsx

'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  Zap, 
  Plus,
  Home,
  BarChart3,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Users,
  FolderOpen
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const { view, setView } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
  const [counts, setCounts] = useState({
    habits: '0/0'
  });

  useEffect(() => {
    setMounted(true);
    
    const state = useStore.getState();
    const completedHabits = state.habits.filter(h => 
      h.completedDates.includes(state.selectedDate)
    ).length;
    
    setCounts({
      habits: `${completedHabits}/${state.habits.length}`
    });
  }, []);

  const toggleMenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([...expandedMenus, menuId]);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home, count: null, parent: null },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, count: null, parent: null, hasSubmenu: true },
    { id: 'week', label: 'Week', icon: Calendar, count: null, parent: 'dashboard' },
    { id: 'month', label: 'Month', icon: Calendar, count: null, parent: 'dashboard' },
    { id: 'habits', label: 'Habits', icon: Zap, count: mounted ? counts.habits : null, parent: null },
    { id: 'stats', label: 'Reports', icon: BarChart3, count: null, parent: null },
    { id: 'settings', label: 'Settings', icon: Settings, count: null, parent: null },
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-[calc(100vh-80px)] sticky top-20 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => !item.parent).map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          const isExpanded = expandedMenus.includes(item.id);
          const hasSubmenu = item.hasSubmenu;

          return (
            <div key={item.id}>
              <Button
                onClick={() => {
                  if (hasSubmenu && !isCollapsed) {
                    toggleMenu(item.id);
                  } else if (!hasSubmenu) {
                    setView(item.id as any);
                  }
                }}
                variant="ghost"
                className={`w-full gap-3 h-11 transition-all duration-200 rounded-lg ${
                  isCollapsed ? 'justify-center px-0' : 'justify-start'
                } ${
                  isActive
                    ? 'bg-[#234C6A] text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#234C6A]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium text-sm">
                      {item.label}
                    </span>
                    {item.count && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#234C6A]'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {hasSubmenu && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </>
                )}
              </Button>

              {/* Submenu */}
              {hasSubmenu && isExpanded && !isCollapsed && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                  {navItems.filter(sub => sub.parent === item.id).map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = view === subItem.id;
                    return (
                      <Button
                        key={subItem.id}
                        onClick={() => setView(subItem.id as any)}
                        variant="ghost"
                        className={`w-full justify-start gap-3 h-9 transition-all duration-200 rounded-lg ${
                          isSubActive
                            ? 'bg-[#456882] text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#234C6A]'
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{subItem.label}</span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="px-4 pb-2 border-t border-gray-200">
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          className="w-full text-gray-600 hover:text-[#234C6A] hover:bg-gray-100 transition-all duration-200 h-10 rounded-lg mt-2"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* Quick Add Button */}
      <div className="p-4">
        <Button 
          onClick={() => setView('overview')}
          className={`w-full bg-[#234C6A] text-white hover:bg-[#1B3C53] transition-all duration-200 h-11 font-semibold rounded-lg shadow-sm hover:shadow-md ${
            isCollapsed ? 'px-0' : ''
          }`}
          title={isCollapsed ? 'Quick Add' : undefined}
        >
          <Plus className={`w-5 h-5 ${isCollapsed ? '' : 'mr-2'}`} />
          {!isCollapsed && <span>Quick Add</span>}
        </Button>
      </div>
    </aside>
  );
}
