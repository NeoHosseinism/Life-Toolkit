import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addMonths,
  subDays,
  isSameDay,
  isSameMonth,
  getDay,
  getDate,
  getMonth,
  getYear,
} from 'date-fns';

// Jalali date-fns functions (simplified implementation)
// In a real app, you'd use date-fns-jalali

const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const gregorianMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const jalaliDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const gregorianDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Simple Gregorian to Jalali conversion
export function toJalali(date: Date): { year: number; month: number; day: number } {
  let gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy = gy <= 1600 ? gy - 621 : gy - 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  
  return { year: jy, month: jm, day: jd };
}

// Simple Jalali to Gregorian conversion
export function toGregorian(jy: number, jm: number, jd: number): Date {
  let gy = jy <= 979 ? 0 : 979;
  const baseYear = jy <= 979 ? 621 : 1600;
  let days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  const leap = !(days % 4) && (days % 100 !== 0 || days % 400 === 0);
  days %= 1461;
  gy += Math.floor(days / 365) * 4;
  days = (days % 365) + (leap ? 1 : 0);
  const gm = days > 336 ? 12 : days > 305 ? 11 : days > 274 ? 10 : days > 244 ? 9 : days > 213 ? 8 : days > 182 ? 7 : days > 152 ? 6 : days > 121 ? 5 : days > 91 ? 4 : days > 60 ? 3 : days > 31 ? 2 : 1;
  const gd = days - (gm > 2 ? 306 : 337) + (gm > 6 ? 30 : 31) * (gm - 1) + (gm === 12 && !leap ? -1 : 0);
  
  return new Date(baseYear + gy - (jy <= 979 ? 0 : 979), gm - 1, gd);
}

export function formatDate(
  date: Date | string,
  formatStr: string,
  calendar: 'jalali' | 'gregorian' = 'gregorian',
  _language?: 'fa' | 'en'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (calendar === 'jalali') {
    const j = toJalali(d);
    const dayName = jalaliDays[d.getDay()];
    const monthName = jalaliMonths[j.month - 1];
    
    return formatStr
      .replace('yyyy', String(j.year))
      .replace('MM', String(j.month).padStart(2, '0'))
      .replace('dd', String(j.day).padStart(2, '0'))
      .replace('MMMM', monthName)
      .replace('EEEE', dayName);
  }
  
  return format(d, formatStr);
}

export function getMonthName(month: number, calendar: 'jalali' | 'gregorian' = 'gregorian'): string {
  if (calendar === 'jalali') {
    return jalaliMonths[month - 1];
  }
  return gregorianMonths[month];
}

export function getDayName(day: number, calendar: 'jalali' | 'gregorian' = 'gregorian'): string {
  if (calendar === 'jalali') {
    return jalaliDays[day];
  }
  return gregorianDays[day];
}

export function getCalendarDays(
  year: number,
  month: number,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): Date[] {
  if (calendar === 'jalali') {
    // For Jalali, we need to convert to Gregorian range first
    const startJalali = toGregorian(year, month, 1);
    const nextMonth = month + 1;
    const nextYear = nextMonth > 12 ? year + 1 : year;
    const nextMonthAdjusted = nextMonth > 12 ? 1 : nextMonth;
    const endJalali = toGregorian(nextYear, nextMonthAdjusted, 1);
    endJalali.setDate(endJalali.getDate() - 1);

    // Jalali week starts on Saturday (getDay()=6).
    // Offset formula: (getDay() + 1) % 7
    //   Saturday(6) → 0  (no padding)
    //   Sunday(0)   → 1
    //   Monday(1)   → 2
    //   Tuesday(2)  → 3
    //   Wednesday(3)→ 4
    //   Thursday(4) → 5
    //   Friday(5)   → 6
    const startDay = (startJalali.getDay() + 1) % 7;
    const adjustedStart = subDays(startJalali, startDay);

    const daysInRange = eachDayOfInterval({ start: adjustedStart, end: endJalali }).length;
    return eachDayOfInterval({ start: adjustedStart, end: addDays(endJalali, 42 - daysInRange) });
  }
  
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  const startWeek = startOfWeek(start);
  const endWeek = endOfWeek(end);
  
  return eachDayOfInterval({ start: startWeek, end: endWeek });
}

export function addCalendarMonths(
  date: Date,
  amount: number,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): Date {
  if (calendar === 'jalali') {
    const j = toJalali(date);
    const newMonth = j.month + amount;
    const newYear = j.year + Math.floor((newMonth - 1) / 12);
    const finalMonth = ((newMonth - 1) % 12) + 1;
    return toGregorian(newYear, finalMonth, Math.min(j.day, 29));
  }
  return addMonths(date, amount);
}

export function subCalendarMonths(
  date: Date,
  amount: number,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): Date {
  return addCalendarMonths(date, -amount, calendar);
}

export function isSameCalendarDay(
  date1: Date,
  date2: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): boolean {
  if (calendar === 'jalali') {
    const j1 = toJalali(date1);
    const j2 = toJalali(date2);
    return j1.year === j2.year && j1.month === j2.month && j1.day === j2.day;
  }
  return isSameDay(date1, date2);
}

export function isSameCalendarMonth(
  date1: Date,
  date2: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): boolean {
  if (calendar === 'jalali') {
    const j1 = toJalali(date1);
    const j2 = toJalali(date2);
    return j1.year === j2.year && j1.month === j2.month;
  }
  return isSameMonth(date1, date2);
}

export function isCalendarToday(
  date: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): boolean {
  return isSameCalendarDay(date, new Date(), calendar);
}

export function getCalendarYear(
  date: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): number {
  if (calendar === 'jalali') {
    return toJalali(date).year;
  }
  return getYear(date);
}

export function getCalendarMonth(
  date: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): number {
  if (calendar === 'jalali') {
    return toJalali(date).month;
  }
  return getMonth(date) + 1;
}

export function getCalendarDate(
  date: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): number {
  if (calendar === 'jalali') {
    return toJalali(date).day;
  }
  return getDate(date);
}

export function getCalendarDayOfWeek(
  date: Date,
  calendar: 'jalali' | 'gregorian' = 'gregorian'
): number {
  if (calendar === 'jalali') {
    // Jalali week starts on Saturday (0)
    return (date.getDay() + 1) % 7;
  }
  return getDay(date);
}

export function toPersianNumber(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function formatRelativeTime(
  date: Date | string,
  language: 'fa' | 'en' = 'en'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (language === 'fa') {
    if (diffSecs < 60) return 'همین الان';
    if (diffMins < 60) return `${toPersianNumber(diffMins)} دقیقه پیش`;
    if (diffHours < 24) return `${toPersianNumber(diffHours)} ساعت پیش`;
    if (diffDays < 7) return `${toPersianNumber(diffDays)} روز پیش`;
    return formatDate(d, 'yyyy/MM/dd', 'jalali');
  }

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return format(d, 'yyyy/MM/dd');
}
