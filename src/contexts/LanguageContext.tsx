import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Language, CalendarType, CurrencyType } from '@/types';

// Persian numerals mapping
const persianNumerals: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
};

interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'TaskFlow',
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    calendar: 'Calendar',
    health: 'Health',
    money: 'Money',
    habits: 'Habits',
    goals: 'Goals',
    pomodoro: 'Pomodoro',
    settings: 'Settings',
    learning: 'Learning',
    meditation: 'Meditation',
    addTask: 'Add Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'None',
    urgent: 'Urgent',
    important: 'Important',
    doFirst: 'Do First',
    schedule: 'Schedule',
    delegate: 'Delegate',
    eliminate: 'Eliminate',
    todo: 'To Do',
    inProgress: 'In Progress',
    review: 'Review',
    done: 'Done',
    projects: 'Projects',
    lists: 'Lists',
    tags: 'Tags',
    dueDate: 'Due Date',
    priority: 'Priority',
    status: 'Status',
    description: 'Description',
    subtasks: 'Subtasks',
    addSubtask: 'Add Subtask',
    exercise: 'Exercise',
    sleep: 'Sleep',
    duration: 'Duration',
    calories: 'Calories',
    steps: 'Steps',
    heartRate: 'Heart Rate',
    sleepQuality: 'Sleep Quality',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    necessary: 'Necessary',
    emergency: 'Emergency',
    semiNecessary: 'Semi-Necessary',
    donating: 'Donating',
    fun: 'Fun',
    courses: 'Courses',
    books: 'Books',
    skills: 'Skills',
    streak: 'Streak',
    longestStreak: 'Longest Streak',
    daily: 'Daily',
    weekly: 'Weekly',
    milestones: 'Milestones',
    deadline: 'Deadline',
    progress: 'Progress',
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    skip: 'Skip',
    language: 'Language',
    theme: 'Theme',
    calendarType: 'Calendar',
    currency: 'Currency',
    notifications: 'Notifications',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    jalali: 'Jalali (Persian)',
    gregorian: 'Gregorian',
    rial: 'Rial',
    toman: 'Toman',
    persian: 'Persian (Farsi)',
    english: 'English',
    exportData: 'Export Data',
    importData: 'Import Data',
    deleteAllData: 'Delete All Data',
    profile: 'Profile',
    preferences: 'Preferences',
    account: 'Account',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    changePassword: 'Change Password',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    welcome: 'Welcome',
    getStarted: 'Get Started',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    completed: 'Completed',
    pending: 'Pending',
    overdue: 'Overdue',
    all: 'All',
    active: 'Active',
    archived: 'Archived',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    completedAt: 'Completed At',
    minutes: 'Minutes',
    hours: 'Hours',
    days: 'Days',
    weeks: 'Weeks',
    months: 'Months',
    years: 'Years',
    ago: 'ago',
    fromNow: 'from now',
    justNow: 'Just now',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    areYouSure: 'Are you sure?',
    thisActionCannotBeUndone: 'This action cannot be undone.',
    deleteConfirmation: 'Are you sure you want to delete this?',
    saveChanges: 'Save Changes',
    discardChanges: 'Discard Changes',
    unsavedChanges: 'You have unsaved changes',
    sessionCompleted: 'Session Completed!',
    takeABreak: 'Take a break',
    timeToFocus: 'Time to focus',
    statistics: 'Statistics',
    overview: 'Overview',
    statsWeekly: 'Weekly',
    statsMonthly: 'Monthly',
    statsYearly: 'Yearly',
    statsTotal: 'Total',
    average: 'Average',
    maximum: 'Maximum',
    minimum: 'Minimum',
  },
  fa: {
    appName: 'تسک‌فلو',
    dashboard: 'داشبورد',
    tasks: 'وظایف',
    calendar: 'تقویم',
    health: 'سلامت',
    money: 'مالی',
    habits: 'عادت‌ها',
    goals: 'اهداف',
    pomodoro: 'پومودورو',
    settings: 'تنظیمات',
    learning: 'یادگیری',
    meditation: 'مدیتیشن',
    addTask: 'افزودن وظیفه',
    editTask: 'ویرایش وظیفه',
    deleteTask: 'حذف وظیفه',
    save: 'ذخیره',
    cancel: 'انصراف',
    confirm: 'تایید',
    delete: 'حذف',
    edit: 'ویرایش',
    close: 'بستن',
    search: 'جستجو',
    filter: 'فیلتر',
    sort: 'مرتب‌سازی',
    today: 'امروز',
    tomorrow: 'فردا',
    yesterday: 'دیروز',
    thisWeek: 'این هفته',
    thisMonth: 'این ماه',
    high: 'بالا',
    medium: 'متوسط',
    low: 'پایین',
    none: 'هیچ',
    urgent: 'فوری',
    important: 'مهم',
    doFirst: 'اول انجام بده',
    schedule: 'برنامه‌ریزی کن',
    delegate: 'واگذار کن',
    eliminate: 'حذف کن',
    todo: 'انجام نشده',
    inProgress: 'در حال انجام',
    review: 'بررسی',
    done: 'انجام شده',
    projects: 'پروژه‌ها',
    lists: 'لیست‌ها',
    tags: 'برچسب‌ها',
    dueDate: 'تاریخ سررسید',
    priority: 'اولویت',
    status: 'وضعیت',
    description: 'توضیحات',
    subtasks: 'زیروظایف',
    addSubtask: 'افزودن زیروظیفه',
    exercise: 'ورزش',
    sleep: 'خواب',
    duration: 'مدت',
    calories: 'کالری',
    steps: 'قدم',
    heartRate: 'ضربان قلب',
    sleepQuality: 'کیفیت خواب',
    excellent: 'عالی',
    good: 'خوب',
    fair: 'متوسط',
    poor: 'ضعیف',
    income: 'درآمد',
    expense: 'هزینه',
    balance: 'موجودی',
    necessary: 'ضروری',
    emergency: 'اضطراری',
    semiNecessary: 'نیمه‌ضروری',
    donating: 'کمک',
    fun: 'تفریح',
    courses: 'دوره‌ها',
    books: 'کتاب‌ها',
    skills: 'مهارت‌ها',
    streak: 'پیوستگی',
    longestStreak: 'بیشترین پیوستگی',
    daily: 'روزانه',
    weekly: 'هفتگی',
    milestones: 'نقاط عطف',
    deadline: 'مهلت',
    progress: 'پیشرفت',
    focus: 'تمرکز',
    shortBreak: 'استراحت کوتاه',
    longBreak: 'استراحت طولانی',
    start: 'شروع',
    pause: 'مکث',
    reset: 'ریست',
    skip: 'رد کردن',
    language: 'زبان',
    theme: 'تم',
    calendarType: 'تقویم',
    currency: 'ارز',
    notifications: 'اعلان‌ها',
    dark: 'تاریک',
    light: 'روشن',
    system: 'سیستم',
    jalali: 'جلالی (شمسی)',
    gregorian: 'میلادی',
    rial: 'ریال',
    toman: 'تومان',
    persian: 'فارسی',
    english: 'انگلیسی',
    exportData: 'خروجی داده',
    importData: 'ورودی داده',
    deleteAllData: 'حذف همه داده‌ها',
    profile: 'پروفایل',
    preferences: 'ترجیحات',
    account: 'حساب کاربری',
    name: 'نام',
    email: 'ایمیل',
    password: 'رمز عبور',
    changePassword: 'تغییر رمز عبور',
    logout: 'خروج',
    login: 'ورود',
    signup: 'ثبت‌نام',
    welcome: 'خوش آمدید',
    getStarted: 'شروع کنید',
    continue: 'ادامه',
    back: 'بازگشت',
    next: 'بعدی',
    finish: 'پایان',
    completed: 'انجام شده',
    pending: 'در انتظار',
    overdue: 'تأخیری',
    all: 'همه',
    active: 'فعال',
    archived: 'بایگانی',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ به‌روزرسانی',
    completedAt: 'تاریخ تکمیل',
    minutes: 'دقیقه',
    hours: 'ساعت',
    days: 'روز',
    weeks: 'هفته',
    months: 'ماه',
    years: 'سال',
    ago: 'پیش',
    fromNow: 'بعد',
    justNow: 'همین الان',
    loading: 'در حال بارگذاری...',
    noData: 'داده‌ای موجود نیست',
    error: 'خطا',
    success: 'موفقیت',
    warning: 'هشدار',
    info: 'اطلاعات',
    areYouSure: 'آیا مطمئن هستید؟',
    thisActionCannotBeUndone: 'این عمل قابل بازگشت نیست.',
    deleteConfirmation: 'آیا مطمئن هستید که می‌خواهید این را حذف کنید؟',
    saveChanges: 'ذخیره تغییرات',
    discardChanges: 'لغو تغییرات',
    unsavedChanges: 'شما تغییرات ذخیره‌نشده دارید',
    sessionCompleted: 'جلسه تکمیل شد!',
    takeABreak: 'استراحت کنید',
    timeToFocus: 'زمان تمرکز',
    statistics: 'آمار',
    overview: 'نمای کلی',
    statsWeekly: 'هفتگی',
    statsMonthly: 'ماهانه',
    statsYearly: 'سالانه',
    statsTotal: 'کل',
    average: 'میانگین',
    maximum: 'حداکثر',
    minimum: 'حداقل',
  },
};

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toPersianNum: (num: number | string) => string;
  calendar: CalendarType;
  setCalendar: (cal: CalendarType) => void;
  currency: CurrencyType;
  setCurrency: (cur: CurrencyType) => void;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [calendar, setCalendarState] = useState<CalendarType>('gregorian');
  const [currency, setCurrencyState] = useState<CurrencyType>('toman');
  
  const isRTL = language === 'fa';

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    const savedCal = localStorage.getItem('calendar') as CalendarType;
    const savedCur = localStorage.getItem('currency') as CurrencyType;
    
    if (savedLang) setLanguageState(savedLang);
    if (savedCal) setCalendarState(savedCal);
    if (savedCur) setCurrencyState(savedCur);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (isRTL) {
      document.body.classList.add('font-persian');
    } else {
      document.body.classList.remove('font-persian');
    }
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setCalendar = (cal: CalendarType) => {
    setCalendarState(cal);
    localStorage.setItem('calendar', cal);
  };

  const setCurrency = (cur: CurrencyType) => {
    setCurrencyState(cur);
    localStorage.setItem('currency', cur);
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  const toPersianNum = useCallback((num: number | string): string => {
    if (language !== 'fa') return String(num);
    return String(num).replace(/\d/g, (d) => persianNumerals[d] || d);
  }, [language]);

  const formatNumber = useCallback((num: number): string => {
    const formatted = new Intl.NumberFormat(language === 'fa' ? 'fa-IR' : 'en-US').format(num);
    return language === 'fa' ? toPersianNum(formatted) : formatted;
  }, [language, toPersianNum]);

  const formatCurrency = useCallback((amount: number): string => {
    const symbol = currency === 'rial' ? t('rial') : t('toman');
    const value = currency === 'toman' ? amount / 10 : amount;
    const formatted = formatNumber(Math.round(value));
    return isRTL ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
  }, [currency, formatNumber, t, isRTL]);

  return (
    <LanguageContext.Provider value={{
      language,
      isRTL,
      setLanguage,
      t,
      toPersianNum,
      calendar,
      setCalendar,
      currency,
      setCurrency,
      formatNumber,
      formatCurrency,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
