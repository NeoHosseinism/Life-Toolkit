import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Calendar, Heart, Wallet,
  BookOpen, Target, Clock, Settings, GraduationCap, Sparkles,
  Menu, Sun, Moon, Globe, ChevronLeft, ChevronRight,
  Layers, MessageSquare, PenLine, Timer, Bell, Brain, Search,
  Star, ChevronDown, HandCoins, Cake,
} from 'lucide-react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { startNotificationScheduler } from '@/lib/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import CommandPalette, { CommandPaletteHint } from '@/components/CommandPalette';
import MobileNav from '@/components/MobileNav';

import './App.css';

// Lazy load all sections for code splitting
const Dashboard = lazy(() => import('@/sections/Dashboard'));
const Tasks = lazy(() => import('@/sections/Tasks'));
const CalendarView = lazy(() => import('@/sections/CalendarView'));
const Health = lazy(() => import('@/sections/Health'));
const Money = lazy(() => import('@/sections/Money'));
const Learning = lazy(() => import('@/sections/Learning'));
const Habits = lazy(() => import('@/sections/Habits'));
const Goals = lazy(() => import('@/sections/Goals'));
const Pomodoro = lazy(() => import('@/sections/Pomodoro'));
const Meditation = lazy(() => import('@/sections/Meditation'));
const SettingsView = lazy(() => import('@/sections/Settings'));
const Planning = lazy(() => import('@/sections/Planning'));
const PromptLibrary = lazy(() => import('@/sections/PromptLibrary'));
const Journal = lazy(() => import('@/sections/Journal'));
const TimeBlocking = lazy(() => import('@/sections/TimeBlocking'));
const NotificationsManager = lazy(() => import('@/sections/NotificationsManager'));
const Psychology = lazy(() => import('@/sections/Psychology'));
const Debts = lazy(() => import('@/sections/Debts'));
const Birthdays = lazy(() => import('@/sections/Birthdays'));

// Loading skeleton component
function SectionLoader() {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

type ViewType =
  | 'dashboard' | 'tasks' | 'calendar' | 'health' | 'money'
  | 'learning' | 'habits' | 'goals' | 'pomodoro' | 'meditation'
  | 'planning' | 'prompts' | 'journal' | 'timeblocking' | 'notifications'
  | 'psychology' | 'settings' | 'debts' | 'birthdays';

interface NavItemDef { id: ViewType; icon: React.ElementType; group?: string; }

const navGroups: { label: string; items: NavItemDef[] }[] = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard',     icon: LayoutDashboard },
      { id: 'tasks',         icon: CheckSquare },
      { id: 'calendar',      icon: Calendar },
    ],
  },
  {
    label: 'Planning',
    items: [
      { id: 'planning',      icon: Layers },
      { id: 'timeblocking',  icon: Timer },
      { id: 'goals',         icon: Target },
      { id: 'habits',        icon: Sparkles },
    ],
  },
  {
    label: 'Wellbeing',
    items: [
      { id: 'health',        icon: Heart },
      { id: 'pomodoro',      icon: Clock },
      { id: 'meditation',    icon: BookOpen },
      { id: 'journal',       icon: PenLine },
      { id: 'psychology',    icon: Brain },
    ],
  },
  {
    label: 'Life',
    items: [
      { id: 'debts',         icon: HandCoins },
      { id: 'birthdays',     icon: Cake },
    ],
  },
  {
    label: 'Growth',
    items: [
      { id: 'learning',      icon: GraduationCap },
      { id: 'money',         icon: Wallet },
      { id: 'prompts',       icon: MessageSquare },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'notifications', icon: Bell },
      { id: 'settings',      icon: Settings },
    ],
  },
];

const sectionMap: Record<ViewType, React.LazyExoticComponent<() => React.JSX.Element>> = {
  dashboard: Dashboard,
  tasks: Tasks,
  calendar: CalendarView,
  health: Health,
  money: Money,
  learning: Learning,
  habits: Habits,
  goals: Goals,
  pomodoro: Pomodoro,
  meditation: Meditation,
  planning: Planning,
  prompts: PromptLibrary,
  journal: Journal,
  timeblocking: TimeBlocking,
  notifications: NotificationsManager,
  psychology: Psychology,
  debts: Debts,
  birthdays: Birthdays,
  settings: SettingsView,
};

function renderView(view: ViewType) {
  const Section = sectionMap[view];

  return (
    <Suspense fallback={<SectionLoader />}>
      <Section />
    </Suspense>
  );
}

// ─── Start notification scheduler once on app boot ────────────────────────────
function NotificationBoot() {
  useEffect(() => {
    const STORAGE_KEY = 'selfmonitor-notification-rules';
    try {
      const rules = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      startNotificationScheduler(rules);
    } catch {
      startNotificationScheduler([]);
    }
  }, []);
  return null;
}

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<ViewType[]>(['dashboard', 'tasks', 'calendar']);

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const toggleFavorite = (id: ViewType) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const { isDark, toggleTheme }               = useTheme();
  const { language, isRTL, setLanguage, t }   = useLanguage();
  const { getDashboardStats }                 = useApp();
  const stats                                 = getDashboardStats();

  const navigate = (id: ViewType) => { setCurrentView(id); setMobileOpen(false); };

  // ── Sidebar inner content ──────────────────────────────────────────────────
  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-border/40 ${compact ? 'p-3 justify-center' : 'p-5'}`}>
        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
          <CheckSquare className="w-4 h-4 text-primary-foreground" />
        </div>
        {!compact && (
          <span className="text-base font-bold truncate leading-tight">
            {language === 'fa' ? 'جعبه‌ابزار' : 'Life'}<br />
            {language === 'fa' ? 'زندگی' : 'Toolkit'}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 overflow-y-auto py-3 ${compact ? 'px-2' : 'px-3'} space-y-0.5 custom-scrollbar`}>
        {/* Favorites Section */}
        {!compact && favorites.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 mb-1 flex items-center gap-1">
              <Star className="w-3 h-3" />
              {t('favorites') || 'Favorites'}
            </p>
            {favorites.map((favId) => {
              const favItem = navGroups.flatMap(g => g.items).find(i => i.id === favId);
              if (!favItem) return null;
              const Icon = favItem.icon;
              const isActive = currentView === favItem.id;
              return (
                <button
                  key={favItem.id}
                  onClick={() => navigate(favItem.id)}
                  className={`
                    group w-full flex items-center rounded-xl transition-all duration-150 font-medium gap-3 px-3 py-2.5
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className={`shrink-0 w-[17px] h-[17px] ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="flex-1 text-sm text-start capitalize">{t(favItem.id) || favItem.id.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(favItem.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  >
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </button>
                </button>
              );
            })}
          </div>
        )}

        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {group.label && !compact && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 mb-1 group"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                  {group.label}
                </p>
                <ChevronDown className={`w-3 h-3 text-muted-foreground/40 transition-transform ${collapsedGroups[group.label] ? '-rotate-90' : ''}`} />
              </button>
            )}
            {(!collapsedGroups[group.label] || compact) && group.items.map((item) => {
              const Icon     = item.icon;
              const isActive = currentView === item.id;
              const badge    = item.id === 'tasks' && stats.pendingTasks > 0 ? stats.pendingTasks : null;
              const isFavorite = favorites.includes(item.id);

              const btn = (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`
                    group w-full flex items-center rounded-xl transition-all duration-150 font-medium
                    ${compact ? 'justify-center p-2.5 mb-0.5' : 'gap-3 px-3 py-2.5'}
                    ${isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className={`shrink-0 w-[17px] h-[17px] ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  {!compact && (
                    <>
                      <span className="flex-1 text-sm text-start capitalize">{t(item.id) || item.id.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-1">
                        {!isFavorite && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        {isFavorite && (
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        )}
                        {badge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}>
                            {badge}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );

              return compact ? (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side={isRTL ? 'left' : 'right'} className="text-xs capitalize">
                    {t(item.id) || item.id}{badge ? ` (${badge})` : ''}
                  </TooltipContent>
                </Tooltip>
              ) : btn;
            })}
          </div>
        ))}
      </nav>

      {/* Bottom controls */}
      {!compact && (
        <div className="px-3 pb-4 pt-2 border-t border-border/40 space-y-1">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground text-sm">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? t('light') : t('dark')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')} className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground text-sm">
            <Globe className="w-4 h-4" />
            {language === 'fa' ? t('english') : t('persian')}
          </Button>
        </div>
      )}
    </div>
  );

  const desktopW = collapsed ? 'w-[60px]' : 'w-60';

  return (
    <div className={`min-h-screen h-screen overflow-hidden bg-background flex ${isRTL ? 'rtl flex-row-reverse' : 'ltr flex-row'}`}>
      <NotificationBoot />
      <TooltipProvider>
        {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          className={`
            hidden lg:flex flex-col sticky top-0 h-screen shrink-0 z-50
            border-r border-border/40 bg-card/70 backdrop-blur-xl
            transition-all duration-300 ease-in-out relative
            ${desktopW}
          `}
        >
          <SidebarContent compact={collapsed} />

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`
              absolute top-1/2 -translate-y-1/2 w-5 h-9 flex items-center justify-center
              bg-card border border-border/60 rounded-full shadow-sm z-10
              text-muted-foreground hover:text-foreground hover:bg-muted transition-all
              ${isRTL ? '-left-2.5' : '-right-2.5'}
            `}
          >
            {collapsed
              ? (isRTL ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)
              : (isRTL ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />)
            }
          </button>
        </aside>

        {/* ── MOBILE DRAWER ───────────────────────────────────────────────── */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side={isRTL ? 'right' : 'left'}
            className="w-64 p-0 border-r border-border/40 bg-card/95 backdrop-blur-xl"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setMobileOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold truncate capitalize">
                {t(currentView) || currentView.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex"
                title="Search (Cmd+K)"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')} className="hidden sm:flex">
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderView(currentView)}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </TooltipProvider>
      
      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        setOpen={setCommandPaletteOpen} 
        onNavigate={(view) => {
          setCurrentView(view);
          setMobileOpen(false);
        }}
      />
      
      {/* Mobile Bottom Navigation */}
      <MobileNav 
        currentView={currentView} 
        onNavigate={(view) => {
          setCurrentView(view);
          setMobileOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
