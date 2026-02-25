import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Cake,
  Calendar,
  Bell,
  Trash2,
  User,
  Users,
  Briefcase,
  Heart,
  Gift,
  PartyPopper,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { BirthdayRelation, CalendarType } from '@/types';

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

const relationIcons: Record<BirthdayRelation, React.ElementType> = {
  family: Heart,
  friend: Users,
  colleague: Briefcase,
  other: User,
};

const relationColors: Record<BirthdayRelation, string> = {
  family: 'text-pink-500 bg-pink-500/10 border-pink-500/30',
  friend: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  colleague: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  other: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
};

function getDaysUntilBirthday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bday = new Date(dateStr);
  const nextBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  return Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getAge(dateStr: string): number {
  const today = new Date();
  const bday = new Date(dateStr);
  let age = today.getFullYear() - bday.getFullYear();
  const m = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
    age--;
  }
  return age;
}

export default function Birthdays() {
  const {
    birthdays,
    addBirthday,
    updateBirthday,
    deleteBirthday,
  } = useApp();
  const { t, toPersianNum, isRTL, language, calendar } = useLanguage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterRelation, setFilterRelation] = useState<BirthdayRelation | 'all'>('all');

  // Form state
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [calType, setCalType] = useState<CalendarType>(calendar);
  const [relation, setRelation] = useState<BirthdayRelation>('friend');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState<number[]>([1, 7]);

  const resetForm = () => {
    setName('');
    setDate('');
    setCalType(calendar);
    setRelation('friend');
    setNotes('');
    setReminders([1, 7]);
  };

  const handleAdd = () => {
    if (!name.trim() || !date) return;
    addBirthday({
      name,
      date,
      calendarType: calType,
      relation,
      notes: notes || undefined,
      reminderDaysBefore: reminders,
    });
    resetForm();
    setIsAddOpen(false);
  };

  const toggleReminder = (days: number) => {
    setReminders(prev =>
      prev.includes(days) ? prev.filter(d => d !== days) : [...prev, days]
    );
  };

  const filteredBirthdays = useMemo(() => {
    const filtered = filterRelation === 'all'
      ? birthdays
      : birthdays.filter(b => b.relation === filterRelation);
    return [...filtered].sort((a, b) => getDaysUntilBirthday(a.date) - getDaysUntilBirthday(b.date));
  }, [birthdays, filterRelation]);

  const upcomingCount = birthdays.filter(b => getDaysUntilBirthday(b.date) <= 30).length;
  const todayBirthdays = birthdays.filter(b => getDaysUntilBirthday(b.date) === 0);
  const thisWeekBirthdays = birthdays.filter(b => {
    const days = getDaysUntilBirthday(b.date);
    return days > 0 && days <= 7;
  });

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
            <Cake className="w-6 h-6 text-primary" />
            {language === 'fa' ? 'تولدها' : 'Birthdays'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'fa'
              ? 'مدیریت و یادآوری تولدها'
              : 'Manage and remember birthdays'}
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              {language === 'fa' ? 'افزودن تولد' : 'Add Birthday'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'fa' ? 'افزودن تولد جدید' : 'Add New Birthday'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === 'fa' ? 'نام' : 'Name'} *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'fa' ? 'نام شخص...' : 'Person name...'}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{language === 'fa' ? 'تاریخ تولد' : 'Birth Date'} *</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{language === 'fa' ? 'نوع تقویم' : 'Calendar'}</Label>
                  <Select value={calType} onValueChange={(v) => setCalType(v as CalendarType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gregorian">{language === 'fa' ? 'میلادی' : 'Gregorian'}</SelectItem>
                      <SelectItem value="jalali">{language === 'fa' ? 'شمسی' : 'Jalali'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{language === 'fa' ? 'رابطه' : 'Relation'}</Label>
                <Select value={relation} onValueChange={(v) => setRelation(v as BirthdayRelation)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">{language === 'fa' ? 'خانواده' : 'Family'}</SelectItem>
                    <SelectItem value="friend">{language === 'fa' ? 'دوست' : 'Friend'}</SelectItem>
                    <SelectItem value="colleague">{language === 'fa' ? 'همکار' : 'Colleague'}</SelectItem>
                    <SelectItem value="other">{language === 'fa' ? 'سایر' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'fa' ? 'یادآوری' : 'Reminders'}</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {[1, 3, 7, 14, 30].map(days => (
                    <label key={days} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <Checkbox
                        checked={reminders.includes(days)}
                        onCheckedChange={() => toggleReminder(days)}
                      />
                      <span>
                        {toPersianNum(days)} {language === 'fa' ? 'روز قبل' : `day${days > 1 ? 's' : ''} before`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>{language === 'fa' ? 'یادداشت' : 'Notes'}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                {language === 'fa' ? 'افزودن' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'کل تولدها' : 'Total'}
            </div>
            <div className="text-lg font-bold">{toPersianNum(birthdays.length)}</div>
          </CardContent>
        </Card>
        <Card className="glass border-pink-500/20">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'امروز 🎂' : 'Today 🎂'}
            </div>
            <div className="text-lg font-bold text-pink-500">
              {toPersianNum(todayBirthdays.length)}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'این هفته' : 'This Week'}
            </div>
            <div className="text-lg font-bold text-blue-500">
              {toPersianNum(thisWeekBirthdays.length)}
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground mb-1">
              {language === 'fa' ? 'این ماه' : 'This Month'}
            </div>
            <div className="text-lg font-bold text-amber-500">
              {toPersianNum(upcomingCount)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Birthdays Banner */}
      <AnimatePresence>
        {todayBirthdays.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <h3 className="font-bold text-pink-500">
                      {language === 'fa' ? 'تولد مبارک!' : 'Happy Birthday!'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {todayBirthdays.map(b => b.name).join(language === 'fa' ? '، ' : ', ')}
                    </p>
                  </div>
                  <PartyPopper className="w-8 h-8 text-pink-500 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <Select value={filterRelation} onValueChange={(v) => setFilterRelation(v as typeof filterRelation)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
            <SelectItem value="family">{language === 'fa' ? 'خانواده' : 'Family'}</SelectItem>
            <SelectItem value="friend">{language === 'fa' ? 'دوست' : 'Friend'}</SelectItem>
            <SelectItem value="colleague">{language === 'fa' ? 'همکار' : 'Colleague'}</SelectItem>
            <SelectItem value="other">{language === 'fa' ? 'سایر' : 'Other'}</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {toPersianNum(filteredBirthdays.length)} {language === 'fa' ? 'نفر' : 'people'}
        </span>
      </motion.div>

      {/* Birthday List */}
      <AnimatePresence mode="popLayout">
        {filteredBirthdays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Cake className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{language === 'fa' ? 'تولدی ثبت نشده' : 'No birthdays recorded'}</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredBirthdays.map((birthday, i) => {
              const daysUntil = getDaysUntilBirthday(birthday.date);
              const age = getAge(birthday.date);
              const RelIcon = relationIcons[birthday.relation];
              const isToday = daysUntil === 0;

              return (
                <motion.div
                  key={birthday.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`glass transition-all ${isToday ? 'border-pink-500/40 ring-1 ring-pink-500/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${relationColors[birthday.relation]}`}>
                          <RelIcon className="w-5 h-5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{birthday.name}</span>
                            {isToday && <span className="text-lg">🎂</span>}
                          </div>
