import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  formatDate,
  getCalendarDays,
  addCalendarMonths,
  subCalendarMonths,
  isSameCalendarMonth,
  isCalendarToday,
  getCalendarYear,
  getCalendarMonth,
  getCalendarDate,
} from '@/lib/calendar';
import type { CalendarView } from '@/types';

export default function CalendarView() {
  const { events, tasks, addEvent } = useApp();
  const { t, toPersianNum, calendar, isRTL } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');

  const year = getCalendarYear(currentDate, calendar);
  const month = getCalendarMonth(currentDate, calendar);

  const navigatePrevious = () => {
    setCurrentDate(prev => subCalendarMonths(prev, 1, calendar));
  };

  const navigateNext = () => {
    setCurrentDate(prev => addCalendarMonths(prev, 1, calendar));
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = getCalendarDays(year, month, calendar);

  const weekDays = calendar === 'jalali'
    ? ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.startDate.startsWith(dateStr));
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim() && selectedDate) {
      addEvent({
        title: newEventTitle,
        startDate: selectedDate.toISOString(),
        endDate: selectedDate.toISOString(),
        allDay: true,
      });
      setNewEventTitle('');
      setIsAddDialogOpen(false);
    }
  };

  const MonthView = () => (
    <div className="space-y-4">
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {calendar === 'jalali' ? day : day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameCalendarMonth(date, currentDate, calendar);
          const isToday = isCalendarToday(date, calendar);
          const dayEvents = getEventsForDate(date);
          const dayTasks = getTasksForDate(date);
          const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => {
                setSelectedDate(date);
                setIsAddDialogOpen(true);
              }}
              className={`
                min-h-[80px] sm:min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all
                ${isCurrentMonth ? 'bg-card' : 'bg-muted/50 text-muted-foreground'}
                ${isToday ? 'border-primary ring-1 ring-primary' : 'border-border'}
                hover:border-primary/50 hover:shadow-sm
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-primary text-primary-foreground' : ''}
                  `}
                >
                  {toPersianNum(getCalendarDate(date, calendar))}
                </span>
                {hasItems && (
                  <div className="flex gap-1">
                    {dayEvents.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    {dayTasks.length > 0 && (
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event, i) => (
                  <div
                    key={i}
                    className="text-xs truncate bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded"
                  >
                    {event.title}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map((task, i) => (
                  <div
                    key={i}
                    className="text-xs truncate bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded"
                  >
                    {task.title}
                  </div>
                ))}
                {dayEvents.length + dayTasks.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{toPersianNum(dayEvents.length + dayTasks.length - 2)} {t('more')}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const ListView = () => {
    const allItems = [
      ...events.map(e => ({ ...e, type: 'event' as const })),
      ...tasks.filter(t => t.dueDate).map(t => ({ ...t, type: 'task' as const, startDate: t.dueDate! })),
    ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return (
      <div className="space-y-2">
        {allItems.map((item, index) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.type === 'event'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-orange-500/10 text-orange-500'
                  }`}
                >
                  {item.type === 'event' ? <CalendarIcon className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.startDate, 'yyyy/MM/dd', calendar, isRTL ? 'fa' : 'en')}
                  </p>
                </div>
                <Badge variant={item.type === 'event' ? 'default' : 'secondary'}>
                  {t(item.type)}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {allItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('noData')}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={navigateToday}>
              {t('today')}
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-xl font-bold">
            {calendar === 'jalali'
              ? `${toPersianNum(year)} ${['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][month - 1]}`
              : `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month - 1]} ${year}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as CalendarView)}>
            <TabsList>
              <TabsTrigger value="month">{t('month')}</TabsTrigger>
              <TabsTrigger value="list">{t('list')}</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-shine">
                <Plus className="w-4 h-4 mr-2" />
                {t('add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addEvent')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder={t('title')}
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
                />
                {selectedDate && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedDate, 'yyyy/MM/dd', calendar, isRTL ? 'fa' : 'en')}
                  </p>
                )}
                <Button onClick={handleAddEvent} className="w-full">
                  {t('save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'list' && <ListView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
