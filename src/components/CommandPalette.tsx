import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, CheckSquare, Calendar, Heart, Wallet,
  BookOpen, Target, Clock, Settings, GraduationCap, Sparkles,
  Layers, MessageSquare, PenLine, Timer, Bell, Brain,
  Sun, Moon, Globe, Search, Plus, X, HandCoins, Cake,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';

type ViewType =
  | 'dashboard' | 'tasks' | 'calendar' | 'health' | 'money'
  | 'learning' | 'habits' | 'goals' | 'pomodoro' | 'meditation'
  | 'planning' | 'prompts' | 'journal' | 'timeblocking' | 'notifications'
  | 'psychology' | 'settings' | 'debts' | 'birthdays';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onNavigate: (view: ViewType) => void;
}

const navItems: { id: ViewType; icon: React.ElementType; group: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, group: 'Core' },
  { id: 'tasks', icon: CheckSquare, group: 'Core' },
  { id: 'calendar', icon: Calendar, group: 'Core' },
  { id: 'health', icon: Heart, group: 'Wellbeing' },
  { id: 'pomodoro', icon: Clock, group: 'Wellbeing' },
  { id: 'meditation', icon: BookOpen, group: 'Wellbeing' },
  { id: 'journal', icon: PenLine, group: 'Wellbeing' },
  { id: 'psychology', icon: Brain, group: 'Wellbeing' },
  { id: 'planning', icon: Layers, group: 'Planning' },
  { id: 'timeblocking', icon: Timer, group: 'Planning' },
  { id: 'goals', icon: Target, group: 'Planning' },
  { id: 'habits', icon: Sparkles, group: 'Planning' },
  { id: 'debts', icon: HandCoins, group: 'Finance' },
  { id: 'birthdays', icon: Cake, group: 'Finance' },
  { id: 'learning', icon: GraduationCap, group: 'Growth' },
  { id: 'money', icon: Wallet, group: 'Growth' },
  { id: 'prompts', icon: MessageSquare, group: 'Growth' },
  { id: 'notifications', icon: Bell, group: 'System' },
  { id: 'settings', icon: Settings, group: 'System' },
];

export default function CommandPalette({ open, setOpen, onNavigate }: CommandPaletteProps) {
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme, theme, setTheme } = useTheme();

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, [setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput 
          placeholder={t('searchCommands') || 'Search commands...'} 
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <CommandList className="max-h-[min(400px,60vh)] overflow-y-auto p-2">
        <CommandEmpty>{t('noResults') || 'No results found.'}</CommandEmpty>

        {/* Navigation Group */}
        <CommandGroup heading={t('navigation') || 'Navigation'}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => handleSelect(() => onNavigate(item.id))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1 capitalize">
                  {t(item.id) || item.id.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.group}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator className="my-1 h-px bg-border" />

        {/* Quick Actions */}
        <CommandGroup heading={t('quickActions') || 'Quick Actions'}>
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate('tasks'))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>{t('addTask') || 'Add New Task'}</span>
          </CommandItem>
          
          <CommandItem
            onSelect={() => handleSelect(() => onNavigate('journal'))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            <PenLine className="mr-2 h-4 w-4" />
            <span>{t('writeJournal') || 'Write Journal Entry'}</span>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(() => onNavigate('pomodoro'))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            <Clock className="mr-2 h-4 w-4" />
            <span>{t('startFocus') || 'Start Focus Session'}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1 h-px bg-border" />

        {/* Settings */}
        <CommandGroup heading={t('settings') || 'Settings'}>
          <CommandItem
            onSelect={() => handleSelect(() => {
              if (theme === 'dark') setTheme('light');
              else if (theme === 'light') setTheme('system');
              else setTheme('dark');
            })}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>
              {t('toggleTheme') || `Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            </span>
          </CommandItem>

          <CommandItem
            onSelect={() => handleSelect(() => setLanguage(language === 'fa' ? 'en' : 'fa'))}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
          >
            <Globe className="mr-2 h-4 w-4" />
            <span>
              {t('switchLanguage') || `Switch to ${language === 'fa' ? 'English' : 'Persian'}`}
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Keyboard shortcut hint component
export function CommandPaletteHint() {
  const { t } = useLanguage();
  return (
    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
        <span className="text-xs">⌘</span>K
      </kbd>
      <span className="hidden md:inline">{t('openCommandPalette') || 'to open'}</span>
    </div>
  );
}
