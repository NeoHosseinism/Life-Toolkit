import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  CheckSquare, Clock, Wallet, Flame, Activity,
  Calendar, ArrowUpRight, ArrowDownRight, Sparkles, Target,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
  RadialBarChart, RadialBar,
} from 'recharts';

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// ─── StatCard (module-level for React.memo stability) ────────────────────────

const StatCard = memo(({ title, value, subtitle, icon: Icon, trend, trendUp, color }: {
  title: string; value: string | number; subtitle?: string; icon: React.ElementType;
  trend?: string; trendUp?: boolean; color: string;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));
StatCard.displayName = 'StatCard';

// ─── Shared chart styles ──────────────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

// ─── Activity Heatmap (GitHub-style) ─────────────────────────────────────────

function ActivityHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const { toPersianNum, isRTL } = useLanguage();
  const WEEKS = 15;
  const DAYS = WEEKS * 7;

  const today = new Date();
  const cells = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (DAYS - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const entry = data.find(x => x.date === dateStr);
    return { date: dateStr, count: entry?.count ?? 0, day: d.getDay() };
  });

  const maxCount = Math.max(...cells.map(c => c.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'hsl(var(--muted))';
    const pct = count / maxCount;
    if (pct < 0.25) return 'hsl(142 71% 45% / 0.3)';
    if (pct < 0.5)  return 'hsl(142 71% 45% / 0.55)';
    if (pct < 0.75) return 'hsl(142 71% 45% / 0.8)';
    return 'hsl(142 71% 45%)';
  };

  // Group by week columns
  const weeks: typeof cells[] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div className={`overflow-x-auto ${isRTL ? 'direction-rtl' : ''}`} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="flex gap-0.5 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell.date}: ${toPersianNum(cell.count)}`}
                className="w-3 h-3 rounded-sm cursor-default transition-opacity hover:opacity-80"
                style={{ backgroundColor: getColor(cell.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <span>{isRTL ? 'کمتر' : 'Less'}</span>
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(v * maxCount) }} />
        ))}
        <span>{isRTL ? 'بیشتر' : 'More'}</span>
      </div>
    </div>
  );
}

// ─── Daily Score Gauge ────────────────────────────────────────────────────────

function DailyScoreGauge({ score }: { score: number }) {
  const { toPersianNum, isRTL } = useLanguage();
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const gaugeData = [{ value: clamped, fill: clamped >= 70 ? '#22c55e' : clamped >= 40 ? '#f59e0b' : '#ef4444' }];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="65%" outerRadius="90%"
            startAngle={210} endAngle={-30}
            data={[{ value: 100, fill: 'hsl(var(--muted))' }, ...gaugeData]}
          >
            <RadialBar dataKey="value" cornerRadius={6} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{toPersianNum(clamped)}</span>
          <span className="text-[10px] text-muted-foreground">{isRTL ? 'امتیاز روز' : 'Daily Score'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    tasks, habits, transactions, pomodoroSessions, getDashboardStats,
    exercises, meditations, goals, courses, books,
  } = useApp();
  const { t, toPersianNum, formatCurrency, isRTL } = useLanguage();

  const stats = getDashboardStats();
  const today = new Date().toISOString().split('T')[0];

  const taskCompletionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const todayTasks = tasks.filter(t => t.dueDate === today || (!t.dueDate && t.status !== 'done'));
  const recentTransactions = transactions.slice(-5).reverse();
  const habitsWithStreaks = habits.filter(h => h.streak > 0).slice(0, 6);

  // ── Last 7 days ──
  const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  }), []);

  const taskChartData = useMemo(() => last7Days.map(date => ({
    name: date.slice(5),
    completed: tasks.filter(t => t.completedAt?.startsWith(date)).length,
  })), [last7Days, tasks]);

  const focusTimeData = useMemo(() => last7Days.map(date => ({
    name: date.slice(5),
    minutes: Math.round(pomodoroSessions.filter(s => s.startTime.startsWith(date) && s.completed).reduce((sum, s) => sum + s.duration, 0) / 60 * 10) / 10,
  })), [last7Days, pomodoroSessions]);

  // ── Expense categories (donut with total) ──
  const { expenseCats, totalExpenses, hasExpenses } = useMemo(() => {
    const cats = [
      { name: t('necessary'),    value: 0, color: '#22c55e' },
      { name: t('emergency'),    value: 0, color: '#ef4444' },
      { name: t('semiNecessary'),value: 0, color: '#f59e0b' },
      { name: t('donating'),     value: 0, color: '#3b82f6' },
      { name: t('fun'),          value: 0, color: '#8b5cf6' },
    ];
    transactions.filter(tr => tr.type === 'expense').forEach(tr => {
      const cat = cats.find(c => c.name === t(tr.category));
      if (cat) cat.value += tr.amount;
    });
    const total = cats.reduce((s, c) => s + c.value, 0);
    return { expenseCats: cats, totalExpenses: total, hasExpenses: total > 0 };
  }, [transactions, t]);

  // ── Last 30 days ──
  const last30Days = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  }), []);

  // ── Life Balance Radar ──
  const lifeBalanceData = useMemo(() => {
    const last30DaysSet = new Set(last30Days);
    const exerciseCount = exercises.filter(e => last30DaysSet.has(e.date)).length;
    const healthScore = Math.min(100, Math.round((exerciseCount / 20) * 100));

    const income = transactions.filter(tr => tr.type === 'income').reduce((s, tr) => s + tr.amount, 0);
    const expenses = transactions.filter(tr => tr.type === 'expense').reduce((s, tr) => s + tr.amount, 0);
    const financeScore = income + expenses > 0 ? Math.min(100, Math.round((income / (income + expenses)) * 100)) : 50;

    const allProgress = [...courses.map(c => c.progress), ...books.map(b => b.progress)];
    const learningScore = allProgress.length > 0 ? Math.round(allProgress.reduce((s, p) => s + p, 0) / allProgress.length) : 0;

    const habitScore = habits.length > 0 ? Math.min(100, Math.round(
      habits.reduce((sum, h) => sum + (h.completions.filter(c => last30DaysSet.has(c)).length / 30) * 100, 0) / habits.length
    )) : 0;

    const meditationCount = meditations.filter(m => last30DaysSet.has(m.date)).length;
    const meditationScore = Math.min(100, Math.round((meditationCount / 15) * 100));

    const activeGoals = goals.filter(g => g.status === 'active');
    const goalScore = activeGoals.length > 0 ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length) : 0;

    return [
      { subject: isRTL ? 'سلامت' : 'Health',    A: healthScore },
      { subject: isRTL ? 'مالی' : 'Finance',     A: financeScore },
      { subject: isRTL ? 'یادگیری' : 'Learning', A: learningScore },
      { subject: isRTL ? 'عادت‌ها' : 'Habits',  A: habitScore },
      { subject: isRTL ? 'وظایف' : 'Tasks',      A: taskCompletionRate },
      { subject: isRTL ? 'مدیتیشن' : 'Meditate', A: meditationScore },
      { subject: isRTL ? 'اهداف' : 'Goals',      A: goalScore },
    ];
  }, [exercises, transactions, courses, books, habits, meditations, goals, last30Days, taskCompletionRate, isRTL]);

  // ── 30-day habit completion trend ──
  const habitTrendData = useMemo(() => last30Days.map(date => ({
    name: date.slice(5),
    completions: habits.filter(h => h.completions.includes(date)).length,
  })), [last30Days, habits]);

  // ── Activity heatmap data ──
  const heatmapData = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completedAt) {
        const d = t.completedAt.split('T')[0];
        map[d] = (map[d] ?? 0) + 1;
      }
    });
    habits.forEach(h => {
      h.completions.forEach(d => {
        map[d] = (map[d] ?? 0) + 1;
      });
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [tasks, habits]);

  // ── Daily score ──
  const dailyScore = useMemo(() => {
    const todayHabitsDone = habits.filter(h => h.completions.includes(today)).length;
    const habitPct = habits.length > 0 ? (todayHabitsDone / habits.length) * 40 : 0;
    const todayDone = tasks.filter(t => t.completedAt?.startsWith(today)).length;
    const todayTotal = tasks.filter(t => t.dueDate === today).length;
    const taskPct = todayTotal > 0 ? (todayDone / todayTotal) * 35 : 0;
    const focusMin = pomodoroSessions.filter(s => s.startTime.startsWith(today) && s.completed).reduce((sum, s) => sum + s.duration, 0) / 60;
    const focusPct = Math.min(25, (focusMin / 120) * 25);
    return habitPct + taskPct + focusPct;
  }, [habits, tasks, pomodoroSessions, today]);

  // ── Habit streak horizontal bars ──
  const habitStreakData = useMemo(() => habits
    .filter(h => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 6)
    .map(h => ({ name: h.name, streak: h.streak, fill: h.color })),
  [habits]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title={t('tasks')} value={toPersianNum(stats.pendingTasks)} subtitle={`${toPersianNum(taskCompletionRate)}% ${t('completed')}`} icon={CheckSquare} trend={`${toPersianNum(stats.completedTasks)} ${t('done')}`} trendUp color="#2467ec" />
        <StatCard title={t('focus')} value={`${toPersianNum(Math.round(stats.focusTimeToday / 60 * 10) / 10)}h`} subtitle={t('today')} icon={Clock} color="#22c55e" />
        <StatCard title={t('streak')} value={toPersianNum(stats.currentStreak)} subtitle={t('days')} icon={Flame} color="#f59e0b" />
        <StatCard title={t('expenses')} value={formatCurrency(stats.expensesThisMonth)} subtitle={t('thisMonth')} icon={Wallet} color="#ef4444" />
      </div>

      {/* ── Today Tasks + Daily Score + Habits ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> {t('today')}
              </CardTitle>
              <span className="text-xs text-muted-foreground">{toPersianNum(todayTasks.length)} {t('tasks')}</span>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t('noData')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.slice(0, 5).map((task, index) => (
                    <motion.div key={task.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : task.priority === 'low' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="flex-1 truncate text-sm">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${task.status === 'done' ? 'bg-green-500/10 text-green-500' : task.status === 'inProgress' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        {t(task.status)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Score Gauge */}
        <motion.div variants={itemVariants}>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> {isRTL ? 'امتیاز امروز' : 'Daily Score'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center gap-3">
              <DailyScoreGauge score={dailyScore} />
              <div className="w-full space-y-1.5 text-xs">
                {[
                  { label: isRTL ? 'وظایف' : 'Tasks', pct: todayTasks.length > 0 ? Math.round((tasks.filter(t => t.completedAt?.startsWith(today)).length / todayTasks.length) * 100) : 0, color: '#2467ec' },
                  { label: isRTL ? 'عادت‌ها' : 'Habits', pct: habits.length > 0 ? Math.round((habits.filter(h => h.completions.includes(today)).length / habits.length) * 100) : 0, color: '#f59e0b' },
                  { label: isRTL ? 'تمرکز' : 'Focus', pct: Math.min(100, Math.round((stats.focusTimeToday / 7200) * 100)), color: '#22c55e' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-14 text-muted-foreground">{item.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="w-8 text-right">{toPersianNum(item.pct)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Life Balance Radar + Habit Streak Bars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Life Balance Radar */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {isRTL ? 'تعادل زندگی' : 'Life Balance'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={lifeBalanceData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} tickCount={4} />
                    <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${toPersianNum(v)}%`, '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habit Streak Horizontal Bars */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                {isRTL ? 'ریسمان عادت‌ها' : 'Habit Streaks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {habitStreakData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                  {t('noData')}
                </div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitStreakData} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [toPersianNum(v), isRTL ? 'روز' : 'days']} />
                      <Bar dataKey="streak" radius={[0, 4, 4, 0]}>
                        {habitStreakData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── 30-Day Habit Trend + Enhanced Donut + Focus Line ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-day habit area chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{isRTL ? 'روند عادت‌ها (۳۰ روز)' : 'Habit Trend (30 days)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={habitTrendData}>
                    <defs>
                      <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [toPersianNum(v), isRTL ? 'عادت' : 'habits']} />
                    <Area type="monotone" dataKey="completions" stroke="#f59e0b" strokeWidth={2} fill="url(#habitGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Expense Donut */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t('money')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-44 relative">
                {hasExpenses ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expenseCats.filter(c => c.value > 0)} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={3} dataKey="value">
                          {expenseCats.filter(c => c.value > 0).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center total */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{isRTL ? 'کل' : 'Total'}</p>
                        <p className="text-sm font-bold leading-tight">{formatCurrency(totalExpenses)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">{t('noData')}</div>
                )}
              </div>
              {/* Legend */}
              {hasExpenses && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {expenseCats.filter(c => c.value > 0).map(c => (
                    <div key={c.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Task bar + Focus line ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{isRTL ? 'وظایف تکمیل شده (۷ روز)' : 'Tasks Completed (7 days)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{isRTL ? 'زمان تمرکز (ساعت)' : 'Focus Time (hrs)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={focusTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="minutes" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Activity Heatmap ── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {isRTL ? 'نقشه فعالیت' : 'Activity Map'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap data={heatmapData} />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Transactions ── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('noData')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tr, i) => (
                  <motion.div key={tr.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tr.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tr.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tr.description}</p>
                        <p className="text-xs text-muted-foreground">{t(tr.category)}</p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${tr.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {tr.type === 'income' ? '+' : '-'}{formatCurrency(tr.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
