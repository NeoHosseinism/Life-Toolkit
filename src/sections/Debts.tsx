import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  HandCoins,
  BookHeart,
  Check,
  X,
  AlertTriangle,
  Clock,
  User,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { MaterialDebt, SpiritualObligation, SpiritualObligationType, MaterialDebtCategory } from '@/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const spiritualTypes: { id: SpiritualObligationType; labelEn: string; labelFa: string; icon: string }[] = [
  { id: 'qaza-namaz', labelEn: 'Missed Prayers', labelFa: 'نماز قضا', icon: '🕌' },
  { id: 'nazr', labelEn: 'Vow (Nazr)', labelFa: 'نذر', icon: '🤲' },
  { id: 'kaffarah', labelEn: 'Kaffarah', labelFa: 'کفاره', icon: '⚖️' },
  { id: 'zakat', labelEn: 'Zakat', labelFa: 'زکات', icon: '💰' },
  { id: 'khums', labelEn: 'Khums', labelFa: 'خمس', icon: '📊' },
  { id: 'other', labelEn: 'Other', labelFa: 'سایر', icon: '📝' },
];

const materialCategories: { id: MaterialDebtCategory; labelEn: string; labelFa: string }[] = [
  { id: 'borrowed-money', labelEn: 'Borrowed Money', labelFa: 'پول قرض گرفته' },
  { id: 'lent-money', labelEn: 'Lent Money', labelFa: 'پول قرض داده' },
  { id: 'borrowed-item', labelEn: 'Borrowed Item', labelFa: 'وسیله قرض گرفته' },
  { id: 'lent-item', labelEn: 'Lent Item', labelFa: 'وسیله قرض داده' },
];

export default function Debts() {
  const {
    materialDebts,
    spiritualObligations,
    addMaterialDebt,
    updateMaterialDebt,
    deleteMaterialDebt,
    addSpiritualObligation,
    updateSpiritualObligation,
    deleteSpiritualObligation,
  } = useApp();
  const { t, toPersianNum, formatCurrency, isRTL, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('material');
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isAddObligationOpen, setIsAddObligationOpen] = useState(false);
  const [debtFilter, setDebtFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [obligationFilter, setObligationFilter] = useState<'all' | 'pending' | 'fulfilled'>('all');

  // Material debt form state
  const [debtType, setDebtType] = useState<'borrowed' | 'lent'>('borrowed');
  const [debtCategory, setDebtCategory] = useState<MaterialDebtCategory>('borrowed-money');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtItemDesc, setDebtItemDesc] = useState('');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtDescription, setDebtDescription] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtNotes, setDebtNotes] = useState('');

  // Spiritual obligation form state
  const [obligationType, setObligationType] = useState<SpiritualObligationType>('qaza-namaz');
  const [obligationTitle, setObligationTitle] = useState('');
  const [obligationDescription, setObligationDescription] = useState('');
  const [obligationQuantity, setObligationQuantity] = useState('');
  const [obligationUnit, setObligationUnit] = useState('');
  const [obligationNotes, setObligationNotes] = useState('');

  const resetDebtForm = () => {
    setDebtType('borrowed');
    setDebtCategory('borrowed-money');
    setDebtAmount('');
    setDebtItemDesc('');
    setDebtPerson('');
    setDebtDescription('');
    setDebtDueDate('');
    setDebtNotes('');
  };

  const resetObligationForm = () => {
    setObligationType('qaza-namaz');
    setObligationTitle('');
    setObligationDescription('');
    setObligationQuantity('');
    setObligationUnit('');
    setObligationNotes('');
  };

  const handleAddDebt = () => {
    if (!debtPerson.trim()) return;
    addMaterialDebt({
      type: debtType,
      category: debtCategory,
      amount: debtAmount ? parseFloat(debtAmount) : undefined,
      itemDescription: debtItemDesc || undefined,
      personName: debtPerson,
      description: debtDescription || undefined,
      date: new Date().toISOString().split('T')[0],
      dueDate: debtDueDate || undefined,
      isPaid: false,
      notes: debtNotes || undefined,
    });
    resetDebtForm();
    setIsAddDebtOpen(false);
  };

  const handleAddObligation = () => {
    if (!obligationTitle.trim()) return;
    addSpiritualObligation({
      type: obligationType,
      title: obligationTitle,
      description: obligationDescription || undefined,
      quantity: obligationQuantity ? parseInt(obligationQuantity) : undefined,
      quantityDone: 0,
      unit: obligationUnit || undefined,
      isFulfilled: false,
      notes: obligationNotes || undefined,
    });
    resetObligationForm();
    setIsAddObligationOpen(false);
  };

  const filteredDebts = materialDebts.filter(d => {
    if (debtFilter === 'paid') return d.isPaid;
    if (debtFilter === 'unpaid') return !d.isPaid;
    return true;
  });

  const filteredObligations = spiritualObligations.filter(o => {
    if (obligationFilter === 'fulfilled') return o.isFulfilled;
    if (obligationFilter === 'pending') return !o.isFulfilled;
    return true;
  });

  // Summary stats
  const totalOwed = materialDebts
    .filter(d => d.type === 'borrowed' && !d.isPaid)
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const totalLent = materialDebts
    .filter(d => d.type === 'lent' && !d.isPaid)
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const overdueDebts = materialDebts.filter(
    d => !d.isPaid && d.dueDate && new Date(d.dueDate) < new Date()
  ).length;
  const pendingObligations = spiritualObligations.filter(o => !o.isFulfilled).length;

  const isOverdue = (debt: MaterialDebt) =>
    !debt.isPaid && debt.dueDate && new Date(debt.dueDate) < new Date();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HandCoins className="w-6 h-6 text-primary" />
            {language === 'fa' ? 'دین‌ها و بدهکاری‌ها' : 'Debts & Obligations'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'fa'
              ? 'مدیریت بدهی‌های مادی و تکالیف معنوی'
              : 'Manage material debts and spiritual obligations'}
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'بدهکاری من' : 'I Owe'}
            </div>
            <div className="text-lg font-bold text-red-500">
              {formatCurrency(totalOwed)}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'طلب من' : 'Owed to Me'}
            </div>
            <div className="text-lg font-bold text-green-500">
              {formatCurrency(totalLent)}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'سررسید گذشته' : 'Overdue'}
            </div>
            <div className="text-lg font-bold text-amber-500">
              {toPersianNum(overdueDebts)}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'تکالیف باقی‌مانده' : 'Pending Obligations'}
            </div>
            <div className="text-lg font-bold text-blue-500">
              {toPersianNum(pendingObligations)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="material" className="flex items-center gap-2">
              <HandCoins className="w-4 h-4" />
              {language === 'fa' ? 'بدهی‌های مادی' : 'Material Debts'}
            </TabsTrigger>
            <TabsTrigger value="spiritual" className="flex items-center gap-2">
              <BookHeart className="w-4 h-4" />
              {language === 'fa' ? 'تکالیف معنوی' : 'Spiritual Obligations'}
            </TabsTrigger>
          </TabsList>

          {/* Material Debts Tab */}
          <TabsContent value="material" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Select value={debtFilter} onValueChange={(v) => setDebtFilter(v as typeof debtFilter)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                    <SelectItem value="unpaid">{language === 'fa' ? 'پرداخت نشده' : 'Unpaid'}</SelectItem>
                    <SelectItem value="paid">{language === 'fa' ? 'پرداخت شده' : 'Paid'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddDebtOpen} onOpenChange={setIsAddDebtOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    {language === 'fa' ? 'افزودن بدهی' : 'Add Debt'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {language === 'fa' ? 'افزودن بدهی جدید' : 'Add New Debt'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>{language === 'fa' ? 'نوع' : 'Type'}</Label>
                        <Select value={debtType} onValueChange={(v) => setDebtType(v as 'borrowed' | 'lent')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="borrowed">{language === 'fa' ? 'قرض گرفتم' : 'I Borrowed'}</SelectItem>
                            <SelectItem value="lent">{language === 'fa' ? 'قرض دادم' : 'I Lent'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'دسته‌بندی' : 'Category'}</Label>
                        <Select value={debtCategory} onValueChange={(v) => setDebtCategory(v as MaterialDebtCategory)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {materialCategories.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {language === 'fa' ? c.labelFa : c.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'نام شخص' : 'Person Name'} *</Label>
                      <Input
                        value={debtPerson}
                        onChange={(e) => setDebtPerson(e.target.value)}
                        placeholder={language === 'fa' ? 'نام شخص...' : 'Person name...'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>{language === 'fa' ? 'مبلغ' : 'Amount'}</Label>
                        <Input
                          type="number"
                          value={debtAmount}
                          onChange={(e) => setDebtAmount(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'سررسید' : 'Due Date'}</Label>
                        <Input
                          type="date"
                          value={debtDueDate}
                          onChange={(e) => setDebtDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'شرح کالا' : 'Item Description'}</Label>
                      <Input
                        value={debtItemDesc}
                        onChange={(e) => setDebtItemDesc(e.target.value)}
                        placeholder={language === 'fa' ? 'توضیح کالا...' : 'Item description...'}
                      />
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'توضیحات' : 'Description'}</Label>
                      <Textarea
                        value={debtDescription}
                        onChange={(e) => setDebtDescription(e.target.value)}
                        placeholder={language === 'fa' ? 'توضیحات...' : 'Description...'}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'یادداشت' : 'Notes'}</Label>
                      <Textarea
                        value={debtNotes}
                        onChange={(e) => setDebtNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleAddDebt} className="w-full">
                      {language === 'fa' ? 'افزودن' : 'Add'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Debt List */}
            <AnimatePresence mode="popLayout">
              {filteredDebts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <HandCoins className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{language === 'fa' ? 'بدهی‌ای ثبت نشده' : 'No debts recorded'}</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {filteredDebts.map((debt, i) => (
                    <motion.div
                      key={debt.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className={`glass transition-all ${isOverdue(debt) ? 'border-red-500/30' : debt.isPaid ? 'border-green-500/30 opacity-70' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="font-medium truncate">{debt.personName}</span>
                                <Badge variant={debt.type === 'borrowed' ? 'destructive' : 'default'} className="text-[10px] shrink-0">
                                  {debt.type === 'borrowed'
                                    ? (language === 'fa' ? 'بدهکارم' : 'I Owe')
                                    : (language === 'fa' ? 'طلبکارم' : 'Owed to Me')}
                                </Badge>
                                {debt.isPaid && (
                                  <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30 shrink-0">
                                    <Check className="w-3 h-3 mr-0.5" />
                                    {language === 'fa' ? 'تسویه شده' : 'Paid'}
                                  </Badge>
                                )}
                                {isOverdue(debt) && (
                                  <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30 shrink-0">
                                    <AlertTriangle className="w-3 h-3 mr-0.5" />
                                    {language === 'fa' ? 'سررسید گذشته' : 'Overdue'}
                                  </Badge>
                                )}
                              </div>
                              {debt.amount && (
                                <div className="text-lg font-bold">
                                  {formatCurrency(debt.amount)}
                                </div>
                              )}
                              {debt.itemDescription && (
                                <p className="text-sm text-muted-foreground">{debt.itemDescription}</p>
                              )}
                              {debt.description && (
                                <p className="text-xs text-muted-foreground mt-1">{debt.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span>{debt.date}</span>
                                {debt.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {language === 'fa' ? 'سررسید:' : 'Due:'} {debt.dueDate}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!debt.isPaid && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-500 hover:text-green-600"
                                  onClick={() => updateMaterialDebt(debt.id, {
                                    isPaid: true,
                                    paidDate: new Date().toISOString().split('T')[0],
                                  })}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteMaterialDebt(debt.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Spiritual Obligations Tab */}
          <TabsContent value="spiritual" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Select value={obligationFilter} onValueChange={(v) => setObligationFilter(v as typeof obligationFilter)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                    <SelectItem value="pending">{language === 'fa' ? 'باقی‌مانده' : 'Pending'}</SelectItem>
                    <SelectItem value="fulfilled">{language === 'fa' ? 'انجام شده' : 'Fulfilled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddObligationOpen} onOpenChange={setIsAddObligationOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    {language === 'fa' ? 'افزودن تکلیف' : 'Add Obligation'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {language === 'fa' ? 'افزودن تکلیف معنوی' : 'Add Spiritual Obligation'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{language === 'fa' ? 'نوع' : 'Type'}</Label>
                      <Select value={obligationType} onValueChange={(v) => setObligationType(v as SpiritualObligationType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {spiritualTypes.map(st => (
                            <SelectItem key={st.id} value={st.id}>
                              <span className="flex items-center gap-2">
                                <span>{st.icon}</span>
                                <span>{language === 'fa' ? st.labelFa : st.labelEn}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'عنوان' : 'Title'} *</Label>
                      <Input
                        value={obligationTitle}
                        onChange={(e) => setObligationTitle(e.target.value)}
                        placeholder={language === 'fa' ? 'مثلاً: ۱۵ رکعت نماز قضا' : 'e.g., 15 missed prayers'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>{language === 'fa' ? 'تعداد' : 'Quantity'}</Label>
                        <Input
                          type="number"
                          value={obligationQuantity}
                          onChange={(e) => setObligationQuantity(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'واحد' : 'Unit'}</Label>
                        <Input
                          value={obligationUnit}
                          onChange={(e) => setObligationUnit(e.target.value)}
                          placeholder={language === 'fa' ? 'رکعت، روز، ...' : 'prayers, days, ...'}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'توضیحات' : 'Description'}</Label>
                      <Textarea
                        value={obligationDescription}
                        onChange={(e) => setObligationDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>{language === 'fa' ? 'یادداشت' : 'Notes'}</Label>
                      <Textarea
                        value={obligationNotes}
                        onChange={(e) => setObligationNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button onClick={handleAddObligation} className="w-full">
                      {language === 'fa' ? 'افزودن' : 'Add'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Obligation List */}
            <AnimatePresence mode="popLayout">
              {filteredObligations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <BookHeart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{language === 'fa' ? 'تکلیفی ثبت نشده' : 'No obligations recorded'}</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {filteredObligations.map((obligation, i) => {
                    const typeInfo = spiritualTypes.find(st => st.id === obligation.type);
                    const progress = obligation.quantity && obligation.quantityDone
                      ? Math.round((obligation.quantityDone / obligation.quantity) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={obligation.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Card className={`glass transition-all ${obligation.isFulfilled ? 'border-green-500/30 opacity-70' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{typeInfo?.icon ?? '📝'}</span>
                                  <span className="font-medium truncate">{obligation.title}</span>
                                  <Badge variant="outline" className="text-[10px] shrink-0">
                                    {language === 'fa' ? typeInfo?.labelFa : typeInfo?.labelEn}
                                  </Badge>
                                  {obligation.isFulfilled && (
                                    <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30 shrink-0">
                                      <Check className="w-3 h-3 mr-0.5" />
                                      {language === 'fa' ? 'انجام شده' : 'Fulfilled'}
                                    </Badge>
                                  )}
                                </div>
                                {obligation.description && (
                                  <p className="text-sm text-muted-foreground">{obligation.description}</p>
                                )}
                                {obligation.quantity && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                      <span>
                                        {toPersianNum(obligation.quantityDone ?? 0)} / {toPersianNum(obligation.quantity)} {obligation.unit ?? ''}
                                      </span>
                                      <span>{toPersianNum(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                {!obligation.isFulfilled && obligation.quantity && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-primary"
                                    onClick={() => {
                                      const newDone = (obligation.quantityDone ?? 0) + 1;
                                      const isFulfilled = newDone >= (obligation.quantity ?? Infinity);
                                      updateSpiritualObligation(obligation.id, {
                                        quantityDone: newDone,
                                        isFulfilled,
                                        fulfilledDate: isFulfilled ? new Date().toISOString().split('T')[0] : undefined,
                                      });
                                    }}
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </Button>
                                )}
                                {!obligation.isFulfilled && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-green-500 hover:text-green-600"
                                    onClick={() => updateSpiritualObligation(obligation.id, {
                                      isFulfilled: true,
                                      fulfilledDate: new Date().toISOString().split('T')[0],
                                    })}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => deleteSpiritualObligation(obligation.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
