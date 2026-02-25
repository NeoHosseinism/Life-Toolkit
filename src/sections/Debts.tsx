import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, HandCoins, Sparkles, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { MaterialDebt, SpiritualObligation, SpiritualObligationType } from '@/types';

const SPIRITUAL_TYPES: { value: SpiritualObligationType; labelEn: string; labelFa: string }[] = [
  { value: 'qaza-namaz', labelEn: 'Missed Prayers', labelFa: 'قضا نماز' },
  { value: 'nazr',       labelEn: 'Vow (Nazr)',     labelFa: 'نذر' },
  { value: 'kaffarah',   labelEn: 'Kaffarah',       labelFa: 'کفاره' },
  { value: 'zakat',      labelEn: 'Zakat',          labelFa: 'زکات' },
  { value: 'khums',      labelEn: 'Khums',          labelFa: 'خمس' },
  { value: 'other',      labelEn: 'Other',          labelFa: 'سایر' },
];

type DebtFilter = 'all' | 'unpaid' | 'paid' | 'borrowed' | 'lent';

// ─── Debt Card ────────────────────────────────────────────────────────────────

function DebtCard({ debt, onTogglePaid, onDelete }: {
  debt: MaterialDebt;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t, isRTL, formatCurrency } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const isOverdue = !debt.isPaid && debt.dueDate && new Date(debt.dueDate) < new Date();
  const borderColor = debt.isPaid
    ? 'border-green-500/30'
    : isOverdue
      ? 'border-red-500/40'
      : 'border-border/50';
  const tagColor = debt.direction === 'lent'
    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';

  return (
    <motion.div
      layout
      variants={staggerItem}
      className={`rounded-xl border ${borderColor} bg-card/60 backdrop-blur-sm p-4 space-y-2 transition-all`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{debt.personName}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 ${tagColor}`}>
              {debt.direction === 'lent' ? (isRTL ? 'قرض داده' : 'Lent') : (isRTL ? 'قرض گرفته' : 'Borrowed')}
            </Badge>
            {debt.isPaid && (
              <Badge variant="outline" className="text-[10px] px-1.5 bg-green-500/10 text-green-600 dark:text-green-400">
                {isRTL ? 'پرداخت شده' : 'Paid'}
              </Badge>
            )}
            {isOverdue && (
              <Badge variant="outline" className="text-[10px] px-1.5 bg-red-500/10 text-red-600 dark:text-red-400">
                {isRTL ? 'تأخیری' : 'Overdue'}
              </Badge>
            )}
          </div>
          {debt.amount != null && (
            <p className="text-base font-bold mt-0.5">{formatCurrency(debt.amount)}</p>
          )}
          {debt.itemDescription && (
            <p className="text-sm text-muted-foreground">{debt.itemDescription}</p>
          )}
        </div>
        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-green-500"
            onClick={() => onTogglePaid(debt.id)}
            title={debt.isPaid ? (t('isPaid')) : (t('isUnpaid'))}
          >
            <Check className={`w-4 h-4 ${debt.isPaid ? 'text-green-500' : ''}`} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(debt.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1 text-xs text-muted-foreground border-t border-border/30">
              {debt.description && <p>{debt.description}</p>}
              <div className="flex gap-4 flex-wrap">
                <span>{isRTL ? 'تاریخ:' : 'Date:'} {debt.date}</span>
                {debt.dueDate && <span className={isOverdue ? 'text-red-500' : ''}>{isRTL ? 'سررسید:' : 'Due:'} {debt.dueDate}</span>}
                {debt.isPaid && debt.paidDate && <span className="text-green-600">{isRTL ? 'پرداخت:' : 'Paid:'} {debt.paidDate}</span>}
              </div>
              {debt.notes && <p className="italic">{debt.notes}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Spiritual Card ───────────────────────────────────────────────────────────

function SpiritualCard({ obl, onToggle, onDelete }: {
  obl: SpiritualObligation;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { isRTL } = useLanguage();
  const typeLabel = SPIRITUAL_TYPES.find(t => t.value === obl.type);

  return (
    <motion.div
      layout
      variants={staggerItem}
      className={`rounded-xl border ${obl.isFulfilled ? 'border-green-500/30 opacity-70' : 'border-purple-500/30'} bg-card/60 backdrop-blur-sm p-4 transition-all`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{obl.title}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              {isRTL ? typeLabel?.labelFa : typeLabel?.labelEn}
            </Badge>
            {obl.isFulfilled && (
              <Badge variant="outline" className="text-[10px] px-1.5 bg-green-500/10 text-green-600">
                {isRTL ? 'ادا شده' : 'Fulfilled'}
              </Badge>
            )}
          </div>
          {obl.quantity != null && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {obl.quantity} {obl.unit || (isRTL ? 'واحد' : 'units')}
            </p>
          )}
          {obl.description && <p className="text-xs text-muted-foreground mt-1">{obl.description}</p>}
        </div>
        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-green-500"
            onClick={() => onToggle(obl.id)}
          >
            <Check className={`w-4 h-4 ${obl.isFulfilled ? 'text-green-500' : ''}`} />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(obl.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function Debts() {
  const { debts = [], spiritualObligations = [], addDebt, updateDebt, deleteDebt, addSpiritualObligation, updateSpiritualObligation, deleteSpiritualObligation } = useApp();
  const { t, isRTL, formatCurrency } = useLanguage();

  const [filter, setFilter] = useState<DebtFilter>('all');
  const [showDebtDialog, setShowDebtDialog] = useState(false);
  const [showObligationDialog, setShowObligationDialog] = useState(false);

  // Debt form state
  const [debtForm, setDebtForm] = useState({
    personName: '', direction: 'lent' as 'lent' | 'borrowed',
    category: 'borrowed-money' as MaterialDebt['category'],
    amount: '', itemDescription: '', description: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '', notes: '',
  });

  // Obligation form state
  const [oblForm, setOblForm] = useState({
    type: 'qaza-namaz' as SpiritualObligationType,
    title: '', description: '', quantity: '', unit: '', notes: '',
  });

  // Summary calculations
  const unpaidDebts = debts.filter(d => !d.isPaid);
  const totalOwedToMe = unpaidDebts.filter(d => d.direction === 'lent' && d.amount).reduce((s, d) => s + (d.amount ?? 0), 0);
  const totalIOwe = unpaidDebts.filter(d => d.direction === 'borrowed' && d.amount).reduce((s, d) => s + (d.amount ?? 0), 0);
  const overdueCount = unpaidDebts.filter(d => d.dueDate && new Date(d.dueDate) < new Date()).length;
  const unfulfilledObligations = spiritualObligations.filter(o => !o.isFulfilled).length;

  const filteredDebts = debts.filter(d => {
    if (filter === 'paid') return d.isPaid;
    if (filter === 'unpaid') return !d.isPaid;
    if (filter === 'lent') return d.direction === 'lent';
    if (filter === 'borrowed') return d.direction === 'borrowed';
    return true;
  });

  const handleAddDebt = () => {
    if (!debtForm.personName.trim()) return;
    addDebt({
      direction: debtForm.direction,
      category: debtForm.category,
      amount: debtForm.amount ? Number(debtForm.amount) : undefined,
      itemDescription: debtForm.itemDescription || undefined,
      personName: debtForm.personName.trim(),
      description: debtForm.description || undefined,
      date: debtForm.date,
      dueDate: debtForm.dueDate || undefined,
      isPaid: false,
      notes: debtForm.notes || undefined,
    });
    setDebtForm({ personName: '', direction: 'lent', category: 'borrowed-money', amount: '', itemDescription: '', description: '', date: new Date().toISOString().split('T')[0], dueDate: '', notes: '' });
    setShowDebtDialog(false);
  };

  const handleAddObligation = () => {
    if (!oblForm.title.trim()) return;
    addSpiritualObligation({
      type: oblForm.type,
      title: oblForm.title.trim(),
      description: oblForm.description || undefined,
      quantity: oblForm.quantity ? Number(oblForm.quantity) : undefined,
      unit: oblForm.unit || undefined,
      isFulfilled: false,
      notes: oblForm.notes || undefined,
    });
    setOblForm({ type: 'qaza-namaz', title: '', description: '', quantity: '', unit: '', notes: '' });
    setShowObligationDialog(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: isRTL ? 'طلبکارم' : 'Owed to me', value: formatCurrency(totalOwedToMe), color: 'text-blue-500', icon: <HandCoins className="w-4 h-4" /> },
          { label: isRTL ? 'بدهکارم' : 'I owe', value: formatCurrency(totalIOwe), color: 'text-amber-500', icon: <HandCoins className="w-4 h-4 rotate-180" /> },
          { label: isRTL ? 'تأخیری' : 'Overdue', value: String(overdueCount), color: 'text-red-500', icon: <AlertCircle className="w-4 h-4" /> },
          { label: isRTL ? 'تکالیف باقی' : 'Obligations', value: String(unfulfilledObligations), color: 'text-purple-500', icon: <Sparkles className="w-4 h-4" /> },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-3 space-y-1">
            <div className={`flex items-center gap-1.5 ${card.color}`}>
              {card.icon}
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="material" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="material">
            <HandCoins className="w-4 h-4 mr-1.5" />
            {isRTL ? 'بدهی‌های مادی' : 'Material Debts'}
          </TabsTrigger>
          <TabsTrigger value="spiritual">
            <Sparkles className="w-4 h-4 mr-1.5" />
            {isRTL ? 'تکالیف معنوی' : 'Spiritual Obligations'}
          </TabsTrigger>
        </TabsList>

        {/* ── Material Debts Tab ── */}
        <TabsContent value="material" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'unpaid', 'paid', 'lent', 'borrowed'] as DebtFilter[]).map(f => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFilter(f)}
                >
                  {isRTL
                    ? { all: 'همه', unpaid: 'پرداخت‌نشده', paid: 'پرداخت‌شده', lent: 'قرض داده', borrowed: 'قرض گرفته' }[f]
                    : { all: 'All', unpaid: 'Unpaid', paid: 'Paid', lent: 'Lent', borrowed: 'Borrowed' }[f]
                  }
                </Button>
              ))}
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => setShowDebtDialog(true)}>
              <Plus className="w-4 h-4" />
              {isRTL ? 'افزودن بدهی' : 'Add Debt'}
            </Button>
          </div>

          {filteredDebts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <HandCoins className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{isRTL ? 'بدهی‌ای ثبت نشده' : 'No debts recorded'}</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2">
              {filteredDebts.map(debt => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onTogglePaid={(id) => updateDebt(id, {
                    isPaid: !debt.isPaid,
                    paidDate: !debt.isPaid ? new Date().toISOString().split('T')[0] : undefined,
                  })}
                  onDelete={deleteDebt}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ── Spiritual Obligations Tab ── */}
        <TabsContent value="spiritual" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {unfulfilledObligations} {isRTL ? 'مورد باقی‌مانده' : 'remaining'}
            </p>
            <Button size="sm" className="gap-1.5" onClick={() => setShowObligationDialog(true)}>
              <Plus className="w-4 h-4" />
              {isRTL ? 'افزودن تکلیف' : 'Add Obligation'}
            </Button>
          </div>

          {spiritualObligations.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{isRTL ? 'تکلیفی ثبت نشده' : 'No obligations recorded'}</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2">
              {/* Unfulfilled first */}
              {spiritualObligations.filter(o => !o.isFulfilled).map(obl => (
                <SpiritualCard
                  key={obl.id}
                  obl={obl}
                  onToggle={(id) => updateSpiritualObligation(id, {
                    isFulfilled: true,
                    fulfilledDate: new Date().toISOString().split('T')[0],
                  })}
                  onDelete={deleteSpiritualObligation}
                />
              ))}
              {spiritualObligations.filter(o => o.isFulfilled).length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground pt-2">{isRTL ? 'ادا شده' : 'Fulfilled'}</p>
                  {spiritualObligations.filter(o => o.isFulfilled).map(obl => (
                    <SpiritualCard
                      key={obl.id}
                      obl={obl}
                      onToggle={(id) => updateSpiritualObligation(id, { isFulfilled: false, fulfilledDate: undefined })}
                      onDelete={deleteSpiritualObligation}
                    />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Add Debt Dialog ── */}
      <Dialog open={showDebtDialog} onOpenChange={setShowDebtDialog}>
        <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'افزودن بدهی' : 'Add Debt'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'نوع' : 'Direction'}</Label>
                <Select value={debtForm.direction} onValueChange={(v) => setDebtForm(f => ({ ...f, direction: v as 'lent' | 'borrowed' }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lent">{isRTL ? 'قرض داده‌ام' : 'I lent'}</SelectItem>
                    <SelectItem value="borrowed">{isRTL ? 'قرض گرفته‌ام' : 'I borrowed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'دسته‌بندی' : 'Category'}</Label>
                <Select value={debtForm.category} onValueChange={(v) => setDebtForm(f => ({ ...f, category: v as MaterialDebt['category'] }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowed-money">{isRTL ? 'پول' : 'Money'}</SelectItem>
                    <SelectItem value="borrowed-item">{isRTL ? 'وسیله' : 'Item'}</SelectItem>
                    <SelectItem value="lent-money">{isRTL ? 'پول (داده)' : 'Money (given)'}</SelectItem>
                    <SelectItem value="lent-item">{isRTL ? 'وسیله (داده)' : 'Item (given)'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'نام شخص *' : 'Person Name *'}</Label>
              <Input
                className="h-8 text-sm"
                value={debtForm.personName}
                onChange={e => setDebtForm(f => ({ ...f, personName: e.target.value }))}
                placeholder={isRTL ? 'نام...' : 'Name...'}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'مبلغ' : 'Amount'}</Label>
                <Input className="h-8 text-sm" type="number" value={debtForm.amount} onChange={e => setDebtForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'تاریخ' : 'Date'}</Label>
                <Input className="h-8 text-sm" type="date" value={debtForm.date} onChange={e => setDebtForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'سررسید' : 'Due Date'}</Label>
              <Input className="h-8 text-sm" type="date" value={debtForm.dueDate} onChange={e => setDebtForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'توضیحات' : 'Description'}</Label>
              <Input className="h-8 text-sm" value={debtForm.description} onChange={e => setDebtForm(f => ({ ...f, description: e.target.value }))} placeholder={isRTL ? 'جزئیات...' : 'Details...'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDebtDialog(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddDebt} disabled={!debtForm.personName.trim()}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Obligation Dialog ── */}
      <Dialog open={showObligationDialog} onOpenChange={setShowObligationDialog}>
        <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'افزودن تکلیف معنوی' : 'Add Spiritual Obligation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'نوع *' : 'Type *'}</Label>
              <Select value={oblForm.type} onValueChange={(v) => setOblForm(f => ({ ...f, type: v as SpiritualObligationType }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPIRITUAL_TYPES.map(st => (
                    <SelectItem key={st.value} value={st.value}>{isRTL ? st.labelFa : st.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'عنوان *' : 'Title *'}</Label>
              <Input className="h-8 text-sm" value={oblForm.title} onChange={e => setOblForm(f => ({ ...f, title: e.target.value }))} placeholder={isRTL ? 'مثلاً: نماز قضای ماه رمضان' : 'e.g. Ramadan missed prayers'} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'تعداد' : 'Quantity'}</Label>
                <Input className="h-8 text-sm" type="number" value={oblForm.quantity} onChange={e => setOblForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'واحد' : 'Unit'}</Label>
                <Input className="h-8 text-sm" value={oblForm.unit} onChange={e => setOblForm(f => ({ ...f, unit: e.target.value }))} placeholder={isRTL ? 'رکعت / روز / ...' : 'rak\'ahs / days...'} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'توضیحات' : 'Description'}</Label>
              <Textarea className="text-sm resize-none" rows={2} value={oblForm.description} onChange={e => setOblForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowObligationDialog(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddObligation} disabled={!oblForm.title.trim()}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
