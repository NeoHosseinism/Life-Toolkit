import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Cake, Gift, Calendar } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { Birthday, BirthdayRelation } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysUntilBirthday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // dateStr is either MM-DD or YYYY-MM-DD
  const parts = dateStr.split('-');
  let month: number, day: number;
  if (parts.length === 3) {
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else {
    month = parseInt(parts[0], 10) - 1;
    day = parseInt(parts[1], 10);
  }
  const next = new Date(today.getFullYear(), month, day);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

function getAge(dateStr: string): number | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  if (!year) return null;
  return new Date().getFullYear() - year;
}

const RELATION_COLORS: Record<BirthdayRelation, string> = {
  family:    'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  friend:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  colleague: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  other:     'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const REMINDER_OPTIONS = [1, 3, 7, 14];

// ─── Birthday Card ────────────────────────────────────────────────────────────

function BirthdayCard({ birthday, onDelete, onEdit }: {
  birthday: Birthday;
  onDelete: (id: string) => void;
  onEdit: (b: Birthday) => void;
}) {
  const { isRTL } = useLanguage();
  const daysUntil = getDaysUntilBirthday(birthday.date);
  const age = birthday.hasYear ? getAge(birthday.date) : null;
  const isToday = daysUntil === 0;
  const isSoon = daysUntil <= 7 && daysUntil > 0;

  return (
    <motion.div
      layout
      variants={staggerItem}
      className={`rounded-xl border ${isToday ? 'border-yellow-400/60 bg-yellow-50/50 dark:bg-yellow-900/10' : isSoon ? 'border-orange-400/40' : 'border-border/50'} bg-card/60 backdrop-blur-sm p-4 transition-all`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
          ${isToday ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gradient-to-br from-primary/20 to-primary/40 text-primary'}`}>
          {isToday ? '🎂' : initials(birthday.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{birthday.name}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 ${RELATION_COLORS[birthday.relation]}`}>
              {isRTL
                ? { family: 'خانواده', friend: 'دوست', colleague: 'همکار', other: 'سایر' }[birthday.relation]
                : { family: 'Family', friend: 'Friend', colleague: 'Colleague', other: 'Other' }[birthday.relation]
              }
            </Badge>
            {isToday && (
              <Badge className="text-[10px] px-1.5 bg-yellow-500 text-white border-0">
                {isRTL ? '🎉 امروز' : '🎉 Today!'}
              </Badge>
            )}
            {isSoon && !isToday && (
              <Badge variant="outline" className="text-[10px] px-1.5 bg-orange-500/10 text-orange-600">
                {daysUntil} {isRTL ? 'روز دیگر' : 'days'}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {birthday.date}
              {age !== null && ` · ${age} ${isRTL ? 'ساله' : 'yrs'}`}
            </p>
            {!isToday && !isSoon && (
              <span className="text-xs text-muted-foreground">
                {daysUntil} {isRTL ? 'روز تا تولد' : 'days away'}
              </span>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(birthday)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(birthday.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

type SortOrder = 'upcoming' | 'alphabetical';

const emptyForm = {
  name: '',
  date: '',
  hasYear: false,
  calendarType: 'gregorian' as 'gregorian' | 'jalali',
  relation: 'friend' as BirthdayRelation,
  notes: '',
  reminderDaysBefore: [1, 7] as number[],
};

export default function Birthdays() {
  const { birthdays = [], addBirthday, updateBirthday, deleteBirthday } = useApp();
  const { isRTL } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('upcoming');
  const [form, setForm] = useState(emptyForm);

  const sorted = useMemo(() => {
    return [...birthdays].sort((a, b) => {
      if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
      return getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date);
    });
  }, [birthdays, sortOrder]);

  const upcoming7 = birthdays.filter(b => getDaysUntilBirthday(b.date) <= 7);
  const today = birthdays.filter(b => getDaysUntilBirthday(b.date) === 0);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowDialog(true); };
  const openEdit = (b: Birthday) => {
    setForm({
      name: b.name, date: b.date, hasYear: b.hasYear,
      calendarType: b.calendarType, relation: b.relation,
      notes: b.notes ?? '',
      reminderDaysBefore: b.reminderDaysBefore,
    });
    setEditId(b.id);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.date) return;
    const data = {
      name: form.name.trim(),
      date: form.date,
      hasYear: form.hasYear,
      calendarType: form.calendarType,
      relation: form.relation,
      notes: form.notes || undefined,
      reminderDaysBefore: form.reminderDaysBefore,
    };
    if (editId) {
      updateBirthday(editId, data);
    } else {
      addBirthday(data);
    }
    setShowDialog(false);
  };

  const toggleReminder = (day: number) => {
    setForm(f => ({
      ...f,
      reminderDaysBefore: f.reminderDaysBefore.includes(day)
        ? f.reminderDaysBefore.filter(d => d !== day)
        : [...f.reminderDaysBefore, day],
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Today's birthdays banner */}
      {today.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-yellow-400/60 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 flex items-center gap-3"
        >
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-sm">
              {isRTL ? 'تولد امروز:' : "Today's Birthday:"}
            </p>
            <p className="text-sm text-muted-foreground">{today.map(b => b.name).join(', ')}</p>
          </div>
        </motion.div>
      )}

      {/* Upcoming within 7 days */}
      {upcoming7.filter(b => getDaysUntilBirthday(b.date) > 0).length > 0 && (
        <div className="rounded-xl border border-orange-400/30 bg-card/60 backdrop-blur-sm p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            {isRTL ? 'تولدهای این هفته' : 'Upcoming this week'}
          </p>
          <div className="space-y-1">
            {upcoming7.filter(b => getDaysUntilBirthday(b.date) > 0).map(b => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span>{b.name}</span>
                <span className="text-muted-foreground text-xs">{getDaysUntilBirthday(b.date)} {isRTL ? 'روز' : 'days'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(['upcoming', 'alphabetical'] as SortOrder[]).map(s => (
            <Button key={s} variant={sortOrder === s ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setSortOrder(s)}>
              {s === 'upcoming' ? (isRTL ? 'نزدیک‌ترین' : 'Upcoming') : (isRTL ? 'الفبایی' : 'A-Z')}
            </Button>
          ))}
        </div>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          {isRTL ? 'افزودن تولد' : 'Add Birthday'}
        </Button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Cake className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{isRTL ? 'تولدی ثبت نشده' : 'No birthdays yet'}</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-2">
          {sorted.map(b => (
            <BirthdayCard key={b.id} birthday={b} onDelete={deleteBirthday} onEdit={openEdit} />
          ))}
        </motion.div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{editId ? (isRTL ? 'ویرایش تولد' : 'Edit Birthday') : (isRTL ? 'افزودن تولد' : 'Add Birthday')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'نام *' : 'Name *'}</Label>
              <Input className="h-8 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isRTL ? 'نام...' : 'Name...'} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'تاریخ *' : 'Date *'}</Label>
                <Input
                  className="h-8 text-sm" type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value, hasYear: true }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'رابطه' : 'Relation'}</Label>
                <Select value={form.relation} onValueChange={(v) => setForm(f => ({ ...f, relation: v as BirthdayRelation }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">{isRTL ? 'خانواده' : 'Family'}</SelectItem>
                    <SelectItem value="friend">{isRTL ? 'دوست' : 'Friend'}</SelectItem>
                    <SelectItem value="colleague">{isRTL ? 'همکار' : 'Colleague'}</SelectItem>
                    <SelectItem value="other">{isRTL ? 'سایر' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="hasYear"
                checked={form.hasYear}
                onCheckedChange={(c) => setForm(f => ({ ...f, hasYear: !!c }))}
              />
              <Label htmlFor="hasYear" className="text-xs cursor-pointer">
                {isRTL ? 'سال تولد مشخص است (محاسبه سن)' : 'Birth year known (calculate age)'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{isRTL ? 'یادآوری قبل از تولد' : 'Remind me before'}</Label>
              <div className="flex gap-2 flex-wrap">
                {REMINDER_OPTIONS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleReminder(day)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      form.reminderDaysBefore.includes(day)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {day} {isRTL ? 'روز' : 'day'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isRTL ? 'یادداشت' : 'Notes'}</Label>
              <Input className="h-8 text-sm" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder={isRTL ? 'یادداشت...' : 'Notes...'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{isRTL ? 'انصراف' : 'Cancel'}</Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.date}>{isRTL ? 'ذخیره' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
