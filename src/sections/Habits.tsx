import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Plus, Flame, Check, X, Snowflake, Trophy, Info,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

const habitColors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const weekDays   = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const weekDaysFa = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

// ─── Streak Freeze logic ──────────────────────────────────────────────────────

const FREEZE_KEY = 'selfmonitor-streakfreezes';

interface FreezeStore {
  [habitId: string]: {
    available: number;       // freezes remaining this week
    usedDates: string[];     // dates that were frozen
    earnedTotal: number;     // all-time freezes earned
    lastWeekReset: string;   // ISO week string e.g. "2025-W30"
  };
}

function getWeekLabel(d = new Date()): string {
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const weekNo = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

function loadFreezes(): FreezeStore {
  try { return JSON.parse(localStorage.getItem(FREEZE_KEY) ?? '{}'); }
  catch { return {}; }
}

function saveFreezes(store: FreezeStore) {
  localStorage.setItem(FREEZE_KEY, JSON.stringify(store));
}

function getHabitFreezeInfo(store: FreezeStore, habitId: string) {
  const thisWeek = getWeekLabel();
  const existing = store[habitId];

  // Reset each calendar week + award +1 freeze for maintaining a streak >= 7
  if (!existing || existing.lastWeekReset !== thisWeek) {
    return {
      available: (existing?.available ?? 0) + 1, // +1 each new week
      usedDates: existing?.usedDates ?? [],
      earnedTotal: (existing?.earnedTotal ?? 0) + 1,
      lastWeekReset: thisWeek,
    };
  }
  return existing;
}

function useStreakFreezes(habitId: string) {
  const [store, setStore] = useState<FreezeStore>(loadFreezes);

  const info = getHabitFreezeInfo(store, habitId);
  const available = info.available;
  const usedDates = info.usedDates;

  const useFreeze = (date: string): boolean => {
    if (available <= 0 || usedDates.includes(date)) return false;
    const updated: FreezeStore = {
      ...store,
      [habitId]: { ...info, available: info.available - 1, usedDates: [...info.usedDates, date] },
    };
    setStore(updated);
    saveFreezes(updated);
    return true;
  };

  // Persist the reset when first loading this week
  const syncReset = () => {
    if (!store[habitId] || store[habitId].lastWeekReset !== getWeekLabel()) {
      const updated = { ...store, [habitId]: info };
      setStore(updated);
      saveFreezes(updated);
    }
  };

  return { available, usedDates, useFreeze, syncReset };
}

// ─── HabitCard ────────────────────────────────────────────────────────────────

function HabitCard({
  habit, index,
}: {
  habit: { id: string; name: string; color: string; frequency: string; streak: number; longestStreak: number; completions: string[] };
  index: number;
}) {
  const { toggleHabit, deleteHabit } = useApp();
  const { t, toPersianNum, isRTL }   = useLanguage();
  const { available, usedDates, useFreeze, syncReset } = useStreakFreezes(habit.id);

  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completions.includes(today);
  const isFrozenToday    = usedDates.includes(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const missedYesterday =
    !habit.completions.includes(yesterdayStr) &&
    !usedDates.includes(yesterdayStr) &&
    habit.streak > 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const days = isRTL ? weekDaysFa : weekDays;

  // Sync freeze reset on render
  syncReset();

  const handleFreeze = () => {
    const ok = useFreeze(today);
    if (ok) {
      // Visually show freeze applied (streak maintained even if not completed)
    }
  };

  const progressPct = Math.min(100,
    (habit.streak / Math.max(habit.longestStreak, 30)) * 100
  );

  // Milestone badges
  const milestones = [7, 21, 30, 66, 100, 365];
  const nextMilestone = milestones.find((m) => m > habit.streak);
  const lastMilestone = milestones.filter((m) => m <= habit.streak).at(-1);

  return (
    <motion.div
      key={habit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Color indicator */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              <Sparkles className="w-5 h-5" style={{ color: habit.color }} />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">{habit.name}</h4>
                <Badge variant="secondary" className="text-xs">{t(habit.frequency)}</Badge>
                {lastMilestone && (
                  <Badge className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    <Trophy className="w-2.5 h-2.5 mr-0.5" />{lastMilestone}d
                  </Badge>
                )}
                {isFrozenToday && (
                  <Badge className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Snowflake className="w-2.5 h-2.5 mr-0.5" />Frozen
                  </Badge>
                )}
              </div>

              {/* 7-day grid */}
              <div className="flex items-center gap-1">
                {last7Days.map((date, i) => {
                  const done   = habit.completions.includes(date);
                  const frozen = usedDates.includes(date);
                  const isToday = date === today;
                  return (
                    <TooltipProvider key={i}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all
                              ${done ? 'text-white' : frozen ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}
                              ${isToday && !done && !frozen ? 'ring-2 ring-primary' : ''}
                            `}
                            style={{ backgroundColor: done ? habit.color : undefined }}
                          >
                            {frozen && !done ? <Snowflake className="w-3 h-3" /> : days[i]}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {done ? 'Completed ✅' : frozen ? 'Streak frozen ❄️' : date}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Best: {toPersianNum(habit.longestStreak)}d</span>
                  {nextMilestone && (
                    <span className="text-primary">{nextMilestone - habit.streak}d to {nextMilestone}-day milestone</span>
                  )}
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, backgroundColor: habit.color }}
                  />
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Streak count */}
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="text-lg font-bold">{toPersianNum(habit.streak)}</span>
              </div>

              {/* Action buttons */}
              <Button
                variant={isCompletedToday ? 'default' : 'outline'}
                size="icon"
                className="w-9 h-9"
                onClick={() => toggleHabit(habit.id, today)}
                style={isCompletedToday ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
              >
                <Check className="w-4 h-4" />
              </Button>

              {/* Freeze button — show when not completed and freezes available */}
              {!isCompletedToday && !isFrozenToday && (
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-9 h-9 border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                        onClick={handleFreeze}
                        disabled={available === 0}
                      >
                        <Snowflake className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-[180px] text-center">
                      {available > 0
                        ? `Use a streak freeze (${available} left this week). Protects your streak for today.`
                        : 'No freezes left this week. You earn 1 new freeze every Monday.'
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-red-500" onClick={() => deleteHabit(habit.id)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Missed yesterday warning */}
          {missedYesterday && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-500/10 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              You missed yesterday. Use a freeze ({available} left) to protect your {habit.streak}-day streak, or check in today to keep going.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Habits ──────────────────────────────────────────────────────────────

export default function Habits() {
  const { habits, addHabit }         = useApp();
  const { t, toPersianNum }          = useLanguage();
  const [isAddDialogOpen, setIsOpen] = useState(false);
  const [habitName, setHabitName]    = useState('');
  const [habitColor, setHabitColor]  = useState(habitColors[0]);
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly'>('daily');

  const today     = new Date().toISOString().split('T')[0];
  const maxStreak = Math.max(...habits.map((h) => h.streak), 0);
  const completedToday = habits.filter((h) => h.completions.includes(today)).length;

  const handleAddHabit = () => {
    if (habitName.trim()) {
      addHabit({ name: habitName, color: habitColor, frequency: habitFrequency, streak: 0, longestStreak: 0, completions: [] });
      setHabitName('');
      setHabitColor(habitColors[0]);
      setIsOpen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('habits'),    value: habits.length,     color: '' },
            { label: t('streak'),    value: maxStreak,         color: 'text-orange-500' },
            { label: t('completed'), value: habits.reduce((s,h) => s + h.completions.length, 0), color: 'text-green-500' },
            { label: t('today'),     value: completedToday,    color: 'text-primary' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{toPersianNum(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Freeze explainer */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-600">
          <Snowflake className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Streak Freeze</strong> — Like Duolingo's streak freeze, you earn 1 freeze per week.
            Use it on any day you'd miss a habit to protect your streak. New freezes reset every Monday.
          </div>
        </div>

        {/* Add button */}
        <div className="flex justify-end">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />{t('add')} {t('habit')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('add')} {t('habit')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t('name')}</Label>
                  <Input value={habitName} onChange={(e) => setHabitName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()} placeholder={t('name')} />
                </div>
                <div className="space-y-2">
                  <Label>{t('frequency')}</Label>
                  <Select value={habitFrequency} onValueChange={(v) => setHabitFrequency(v as typeof habitFrequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t('daily')}</SelectItem>
                      <SelectItem value="weekly">{t('weekly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('color')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {habitColors.map((color) => (
                      <button key={color} onClick={() => setHabitColor(color)}
                        className={`w-7 h-7 rounded-full transition-transform ${habitColor === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddHabit} className="w-full">{t('save')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Habits list */}
        <div className="space-y-3">
          {habits.map((habit, i) => (
            <HabitCard key={habit.id} habit={habit} index={i} />
          ))}
          {habits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t('noData')}</p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
