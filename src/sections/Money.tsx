import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Filter,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { ExpenseCategory } from '@/types';

const expenseCategories: { id: string; label: string; color: string }[] = [
  { id: 'necessary', label: 'necessary', color: '#22c55e' },
  { id: 'emergency', label: 'emergency', color: '#ef4444' },
  { id: 'semi-necessary', label: 'semiNecessary', color: '#f59e0b' },
  { id: 'donating', label: 'donating', color: '#3b82f6' },
  { id: 'fun', label: 'fun', color: '#8b5cf6' },
];

export default function Money() {
  const { transactions, addTransaction, deleteTransaction } = useApp();
  const { t, formatCurrency, currency, setCurrency } = useLanguage();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('necessary');
  const [description, setDescription] = useState('');

  const handleAddTransaction = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && description.trim()) {
      addTransaction({
        amount: currency === 'toman' ? numAmount * 10 : numAmount,
        type: transactionType,
        category,
        description,
        date: new Date().toISOString(),
      });
      setAmount('');
      setDescription('');
      setIsAddDialogOpen(false);
    }
  };

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Current month stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Expense breakdown by category
  const categoryData = expenseCategories.map(cat => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: t(cat.label),
      value: amount,
      color: cat.color,
    };
  }).filter(c => c.value > 0);

  // Recent transactions
  const filteredTransactions = transactions
    .filter(t => filterCategory === 'all' || t.category === filterCategory)
    .slice(-20)
    .reverse();

  // Monthly chart data (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date.toISOString().slice(0, 7);
  });

  const monthlyChartData = months.map(month => ({
    name: month.slice(5),
    income: transactions
      .filter(t => t.type === 'income' && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0),
    expense: transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0),
  }));

  return (
    <div className="space-y-6">
      {/* Currency Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={currency === 'rial' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrency('rial')}
          >
            {t('rial')}
          </Button>
          <Button
            variant={currency === 'toman' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrency('toman')}
          >
            {t('toman')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('balance')}</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('total')}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('income')}</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(monthlyIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('thisMonth')}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('expense')}</p>
                  <p className="text-2xl font-bold text-red-500">
                    {formatCurrency(monthlyExpenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('thisMonth')}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            {t('expenses')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            {t('statistics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{t('recentActivity')}</h3>
              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ExpenseCategory | 'all')}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {t(cat.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-shine">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('add')} {t('transaction')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant={transactionType === 'income' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTransactionType('income')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {t('income')}
                    </Button>
                    <Button
                      variant={transactionType === 'expense' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTransactionType('expense')}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      {t('expense')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('amount')}</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  {transactionType === 'expense' && (
                    <div className="space-y-2">
                      <Label>{t('category')}</Label>
                      <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {t(cat.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t('description')}</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('description')}
                    />
                  </div>
                  <Button onClick={handleAddTransaction} className="w-full">
                    {t('save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                          {new Date(transaction.date).toLocaleDateString()}
                          {transaction.type === 'expense' && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {t(transaction.category)}
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('noData')}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('category')} {t('breakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
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
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((cat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('monthly')} {t('overview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
