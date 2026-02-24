import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  CheckSquare,
  Clock,
  Wallet,
  Flame,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function Dashboard() {
  const { tasks, habits, transactions, pomodoroSessions, getDashboardStats } = useApp();
  const { t, toPersianNum, formatCurrency } = useLanguage();

  const stats = getDashboardStats();

  // Calculate task completion rate
  const taskCompletionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.dueDate === today || (!t.dueDate && t.status !== 'done'));

  // Get recent transactions
  const recentTransactions = transactions.slice(-5).reverse();

  // Get habits with streaks
  const habitsWithStreaks = habits.filter(h => h.streak > 0).slice(0, 5);

  // Chart data - Task completion by day
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const taskChartData = last7Days.map(date => {
    const dayTasks = tasks.filter(t => t.completedAt?.startsWith(date));
    return {
      name: date.slice(5),
      completed: dayTasks.length,
    };
  });

  // Expense categories data
  const expenseCategories = [
    { name: t('necessary'), value: 0, color: '#22c55e' },
    { name: t('emergency'), value: 0, color: '#ef4444' },
    { name: t('semiNecessary'), value: 0, color: '#f59e0b' },
    { name: t('donating'), value: 0, color: '#3b82f6' },
    { name: t('fun'), value: 0, color: '#8b5cf6' },
  ];

  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const cat = expenseCategories.find(c => c.name === t(transaction.category));
      if (cat) cat.value += transaction.amount;
    });

  const hasExpenses = expenseCategories.some(c => c.value > 0);

  // Focus time data
  const focusTimeData = last7Days.map(date => {
    const sessions = pomodoroSessions.filter(
      s => s.startTime.startsWith(date) && s.completed
    );
    const minutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      name: date.slice(5),
      minutes: Math.round(minutes / 60 * 10) / 10,
    };
  });

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color: string;
  }) => (
    <motion.div variants={itemVariants}>
      <Card className="card-hover overflow-hidden">
        <CardContent className="p-6">
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
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('tasks')}
          value={toPersianNum(stats.pendingTasks)}
          subtitle={`${toPersianNum(taskCompletionRate)}% ${t('completed')}`}
          icon={CheckSquare}
          trend={`${toPersianNum(stats.completedTasks)} ${t('done')}`}
          trendUp={true}
          color="#2467ec"
        />
        <StatCard
          title={t('focus')}
          value={`${toPersianNum(Math.round(stats.focusTimeToday / 60 * 10) / 10)}h`}
          subtitle={t('today')}
          icon={Clock}
          color="#22c55e"
        />
        <StatCard
          title={t('streak')}
          value={toPersianNum(stats.currentStreak)}
          subtitle={t('days')}
          icon={Flame}
          color="#f59e0b"
        />
        <StatCard
          title={t('expenses')}
          value={formatCurrency(stats.expensesThisMonth)}
          subtitle={t('thisMonth')}
          icon={Wallet}
          color="#ef4444"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t('today')}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {toPersianNum(todayTasks.length)} {t('tasks')}
              </span>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('noData')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.slice(0, 5).map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-500'
                            : task.priority === 'medium'
                            ? 'bg-yellow-500'
                            : task.priority === 'low'
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <span className="flex-1 truncate">{task.title}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'done'
                            ? 'bg-green-500/10 text-green-500'
                            : task.status === 'inProgress'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {t(task.status)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Habits Streak */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {t('habits')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {habitsWithStreaks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('noData')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {habitsWithStreaks.map((habit, index) => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: habit.color }}
                      >
                        <span className="text-white text-lg">
                          {habit.icon || '✓'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{habit.name}</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(habit.streak / Math.max(habit.longestStreak, 30)) * 100}
                            className="h-1.5"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-orange-500">
                          {toPersianNum(habit.streak)}
                        </span>
                        <p className="text-xs text-muted-foreground">{t('days')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Completion Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('tasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('money')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {hasExpenses ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategories.filter(c => c.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseCategories
                          .filter(c => c.value > 0)
                          .map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    {t('noData')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Focus Time Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('pomodoro')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={focusTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('noData')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(transaction.category)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
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
