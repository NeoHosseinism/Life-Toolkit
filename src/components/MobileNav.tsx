import { useState } from 'react';
import {
  LayoutDashboard, CheckSquare, Plus, Menu,
  Heart, Wallet, BookOpen, Settings, Target,
  Sparkles, Clock, Layers, Brain, HandCoins, Cake
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

type ViewType =
  | 'dashboard' | 'tasks' | 'calendar' | 'health' | 'money'
  | 'learning' | 'habits' | 'goals' | 'pomodoro' | 'meditation'
  | 'planning' | 'prompts' | 'journal' | 'timeblocking' | 'notifications'
  | 'psychology' | 'settings' | 'debts' | 'birthdays';

interface MobileNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onAddAction?: () => void;
}

const mainNavItems: { id: ViewType; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'calendar', icon: Clock, label: 'Calendar' },
  { id: 'health', icon: Heart, label: 'Health' },
];

const secondaryNavItems: { id: ViewType; icon: React.ElementType; label: string }[] = [
  { id: 'habits', icon: Sparkles, label: 'Habits' },
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'journal', icon: BookOpen, label: 'Journal' },
  { id: 'money', icon: Wallet, label: 'Money' },
];

export default function MobileNav({ currentView, onNavigate, onAddAction }: MobileNavProps) {
  const { t, isRTL } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Main items */}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 flex-1 h-12 max-w-[64px]
                  transition-colors rounded-lg
                  ${isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{t(item.id) || item.label}</span>
              </button>
            );
          })}

          {/* Add button in center */}
          <button
            onClick={onAddAction || (() => onNavigate('tasks'))}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-12 max-w-[64px]"
          >
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 -mt-5">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Add</span>
          </button>

          {/* More button (triggers drawer) */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 flex-1 h-12 max-w-[64px] text-muted-foreground hover:text-foreground">
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent 
              side={isRTL ? 'right' : 'left'} 
              className="w-72 p-0 bg-background"
            >
              <div className="flex flex-col h-full py-4">
                <div className="px-4 pb-4 border-b">
                  <h2 className="font-semibold text-lg">{t('navigation') || 'Navigation'}</h2>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                  {/* Secondary Navigation */}
                  <div className="px-2">
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id);
                            setMoreOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                            transition-colors
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium capitalize">
                            {t(item.id) || item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t my-2 mx-4" />

                  {/* Planning & Growth */}
                  <div className="px-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">
                      {t('planning') || 'Planning'}
                    </p>
                    {[
                      { id: 'planning', icon: Layers, label: 'Planning' },
                      { id: 'timeblocking', icon: Clock, label: 'Time Blocking' },
                      { id: 'pomodoro', icon: Clock, label: 'Pomodoro' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id as ViewType);
                            setMoreOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                            transition-colors
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium capitalize">
                            {t(item.id) || item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t my-2 mx-4" />

                  {/* System */}
                  <div className="px-2">
                    {[
                      { id: 'settings', icon: Settings, label: 'Settings' },
                      { id: 'psychology', icon: Brain, label: 'Psychology' },
                      { id: 'notifications', icon: Menu, label: 'Notifications' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id as ViewType);
                            setMoreOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1
                            transition-colors
                            ${isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium capitalize">
                            {t(item.id) || item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

    </>
  );
}
