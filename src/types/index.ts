// ─── existing types (unchanged) ───────────────────────────────────────────────

export type Language = 'fa' | 'en';
export type CalendarType = 'jalali' | 'gregorian';
export type CurrencyType = 'rial' | 'toman';
export type ThemeType = 'light' | 'dark' | 'system';

export type TaskPriority = 'high' | 'medium' | 'low' | 'none';
export type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done';
export type EisenhowerQuadrant = 'doFirst' | 'schedule' | 'delegate' | 'eliminate';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  quadrant?: EisenhowerQuadrant;
  projectId?: string;
  listId?: string;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  subtasks: Subtask[];
  assignees?: string[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  projectId?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type CalendarView = 'day' | 'threeDay' | 'week' | 'month' | 'year' | 'list';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  taskId?: string;
}

export interface Exercise {
  id: string;
  type: string;
  duration: number;
  calories?: number;
  date: string;
  notes?: string;
}

export interface Sleep {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score?: number;
}

export type ExpenseCategory = 'necessary' | 'emergency' | 'semi-necessary' | 'donating' | 'fun';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: ExpenseCategory | string;
  description: string;
  date: string;
  tags?: string[];
}

export interface Course {
  id: string;
  title: string;
  platform?: string;
  instructor?: string;
  progress: number;
  status: 'notStarted' | 'inProgress' | 'completed';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  progress: number;
  status: 'notStarted' | 'reading' | 'completed';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
}

export interface Habit {
  id: string;
  name: string;
  icon?: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays?: number[];
  streak: number;
  longestStreak: number;
  completions: string[];
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  progress: number;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface MeditationSession {
  id: string;
  date: string;
  duration: number;
  type: string;
  notes?: string;
}

export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'focus' | 'shortBreak' | 'longBreak';
  completed: boolean;
  taskId?: string;
}

export interface UserSettings {
  language: Language;
  calendar: CalendarType;
  currency: CurrencyType;
  theme: ThemeType;
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    habitReminders: boolean;
    pomodoroComplete: boolean;
    dailySummary: boolean;
  };
  pomodoro: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  };
  openRouterKey?: string;
  aiModel?: string;
}

// ─── NEW: Planning types ───────────────────────────────────────────────────────

/** GTD (Getting Things Done) */
export type GTDContext =
  | '@home' | '@work' | '@errands' | '@calls' | '@computer' | '@waiting' | string;

export interface GTDItem {
  id: string;
  title: string;
  notes?: string;
  context?: GTDContext;
  projectId?: string;
  energy: 'low' | 'medium' | 'high';
  timeEstimate?: number; // minutes
  dueDate?: string;
  isNextAction: boolean;
  isSomeday: boolean;
  isWaiting: boolean;
  waitingFor?: string;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GTDProject {
  id: string;
  title: string;
  outcome: string; // desired outcome / definition of done
  nextActions: string[]; // GTDItem ids
  status: 'active' | 'completed' | 'someday' | 'onhold';
  createdAt: string;
}

/** OKR (Objectives & Key Results) */
export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string; // e.g. "%", "sessions", "books"
  confidence: 0 | 1 | 2 | 3 | 4 | 5; // 0–5
  status: 'onTrack' | 'atRisk' | 'offTrack' | 'completed';
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  keyResults: KeyResult[];
  quarter: string; // e.g. "2025-Q2"
  owner?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface OKRCycle {
  id: string;
  label: string; // e.g. "Q2 2025"
  startDate: string;
  endDate: string;
  objectives: Objective[];
}

/** Weekly Review (GTD ritual) */
export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  inboxCleared: boolean;
  projectsReviewed: boolean;
  nextActionsReviewed: boolean;
  somedayReviewed: boolean;
  calendarReviewed: boolean;
  wins: string;
  challenges: string;
  focus: string; // top priority for next week
  completedAt?: string;
  createdAt: string;
}

export interface PlanningState {
  gtdInbox: GTDItem[];
  gtdProjects: GTDProject[];
  okrCycles: OKRCycle[];
  weeklyReviews: WeeklyReview[];
}

// ─── NEW: Prompt Library types ─────────────────────────────────────────────────

export type AIModel =
  | 'claude-opus' | 'claude-sonnet' | 'claude-haiku'
  | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  | 'gemini-pro' | 'gemini-flash'
  | 'mistral-large' | 'llama-3'
  | 'custom';

export type PromptCategory =
  | 'coding' | 'writing' | 'analysis' | 'brainstorming'
  | 'summarization' | 'translation' | 'roleplay' | 'research'
  | 'productivity' | 'creativity' | 'other';

export interface PromptVersion {
  version: number;           // 1, 2, 3 …
  content: string;           // the actual prompt text
  notes?: string;            // change notes (like a git commit message)
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  exampleOutput?: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  description?: string;
  category: PromptCategory;
  tags: string[];
  collectionId?: string;
  versions: PromptVersion[];  // ordered oldest → newest; last = current
  isFavorite: boolean;
  isArchived: boolean;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface PromptLibraryState {
  prompts: Prompt[];
  collections: PromptCollection[];
}

// ─── AppState (extended) ──────────────────────────────────────────────────────

export interface AppState {
  tasks: Task[];
  projects: Project[];
  lists: TaskList[];
  tags: Tag[];
  events: CalendarEvent[];
  exercises: Exercise[];
  sleep: Sleep[];
  transactions: Transaction[];
  courses: Course[];
  books: Book[];
  skills: Skill[];
  habits: Habit[];
  goals: Goal[];
  meditations: MeditationSession[];
  pomodoroSessions: PomodoroSession[];
  settings: UserSettings;
  // Planning & Prompt Library
  planning: PlanningState;
  promptLibrary: PromptLibraryState;
  // v4+
  timeBlocks: TimeBlock[];
  journal: { entries: JournalEntry[]; settings: JournalSettings };
  notificationRules: NotificationRule[];
  // v7+
  debts: MaterialDebt[];
  spiritualObligations: SpiritualObligation[];
  // v8+
  birthdays: Birthday[];
  // v9+
  fontSettings: FontSettings;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  todayTasks: number;
  currentStreak: number;
  focusTimeToday: number;
  sleepLastNight?: number;
  expensesThisMonth: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface NavItem {
  id: string;
  label: string;
  labelFa: string;
  icon: string;
  path: string;
}

// ─── Streak Freeze ────────────────────────────────────────────────────────────
// Added to Habit: streakFreezes, freezesUsedThisWeek
// We extend via declaration so existing code still compiles

// ─── Time Blocking ────────────────────────────────────────────────────────────

export type TimeBlockCategory =
  | 'deep-work' | 'meetings' | 'admin' | 'learning' | 'health'
  | 'personal' | 'break' | 'buffer';

export const TIME_BLOCK_COLORS: Record<TimeBlockCategory, string> = {
  'deep-work': '#6366f1',
  'meetings':  '#f59e0b',
  'admin':     '#94a3b8',
  'learning':  '#10b981',
  'health':    '#ef4444',
  'personal':  '#ec4899',
  'break':     '#84cc16',
  'buffer':    '#64748b',
};

export interface TimeBlock {
  id: string;
  date: string;           // YYYY-MM-DD
  startHour: number;      // 0–23
  startMinute: number;    // 0 | 15 | 30 | 45
  durationMinutes: number; // multiple of 15
  title: string;
  category: TimeBlockCategory;
  taskId?: string;        // optional link to a Task
  notes?: string;
  completed: boolean;
  createdAt: string;
}

// ─── Journal / Reflections ────────────────────────────────────────────────────

export type JournalMood = 1 | 2 | 3 | 4 | 5;
export type JournalTone = 'coach' | 'therapist' | 'mentor' | 'friend';

export interface JournalEntry {
  id: string;
  date: string;           // YYYY-MM-DD
  mood: JournalMood;
  energy: 1 | 2 | 3 | 4 | 5;
  freeWrite: string;
  gratitude: string[];    // 1-3 items
  intention: string;      // for tomorrow
  aiInsight?: string;     // response from OpenRouter
  aiModel?: string;       // model used
  createdAt: string;
  updatedAt: string;
}

export interface JournalSettings {
  openRouterKey: string;
  preferredModel: string;
  preferredTone: JournalTone;
  autoAnalyze: boolean;
}

// ─── Notifications (local, no server needed) ──────────────────────────────────

export interface NotificationRule {
  id: string;
  label: string;
  type: 'habit' | 'pomodoro' | 'task' | 'journal' | 'timeblock';
  entityId?: string;      // habit/task id if specific
  hour: number;
  minute: number;
  days: number[];         // 0=Sun … 6=Sat; empty = every day
  enabled: boolean;
  createdAt: string;
}

// ─── Debt / Obligation types ──────────────────────────────────────────────────

export type DebtType = 'material' | 'spiritual';
export type MaterialDebtCategory = 'borrowed-money' | 'lent-money' | 'borrowed-item' | 'lent-item';
export type SpiritualObligationType = 'qaza-namaz' | 'nazr' | 'kaffarah' | 'zakat' | 'khums' | 'other';

export interface MaterialDebt {
  id: string;
  direction: 'borrowed' | 'lent'; // borrowed = someone owes ME, lent = I owe someone
  category: MaterialDebtCategory;
  amount?: number;
  itemDescription?: string;
  personName: string;
  description?: string;
  date: string;
  dueDate?: string;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

export interface SpiritualObligation {
  id: string;
  type: SpiritualObligationType;
  title: string;
  description?: string;
  quantity?: number;
  unit?: string;
  isFulfilled: boolean;
  fulfilledDate?: string;
  notes?: string;
  createdAt: string;
}

// ─── Birthday types ───────────────────────────────────────────────────────────

export type BirthdayRelation = 'family' | 'friend' | 'colleague' | 'other';

export interface Birthday {
  id: string;
  name: string;
  date: string; // MM-DD (or YYYY-MM-DD if year provided)
  hasYear: boolean;
  calendarType: 'jalali' | 'gregorian';
  relation: BirthdayRelation;
  notes?: string;
  reminderDaysBefore: number[]; // e.g. [1, 3, 7]
  createdAt: string;
}

// ─── Font settings ────────────────────────────────────────────────────────────

export type PersianFont = 'vazirmatn' | 'iran-sans' | 'sahel' | 'shabnam' | 'estedad';
export type EnglishFont = 'inter' | 'geist' | 'plus-jakarta-sans';

export interface FontSettings {
  persianFont: PersianFont;
  englishFont: EnglishFont;
  usePersianNumerals: boolean;
}

// ─── Extended AppState fields ─────────────────────────────────────────────────

// These will be picked up by the migration in storage.ts
declare module './index' {}

// Augment AppState with new keys (done via migration v4+)
// timeBlocks: TimeBlock[]
// journal: { entries: JournalEntry[]; settings: JournalSettings }
// notificationRules: NotificationRule[]
// debts: MaterialDebt[]
// spiritualObligations: SpiritualObligation[]
// birthdays: Birthday[]
// fontSettings: FontSettings
