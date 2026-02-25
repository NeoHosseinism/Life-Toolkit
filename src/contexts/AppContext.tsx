import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadState, saveState, clearState, exportData as exportDataUtil, importData as importDataUtil, EXTRA_MIGRATIONS, CURRENT_SCHEMA_VERSION } from '@/lib/storage';
import type {
  AppState,
  Task,
  Project,
  TaskList,
  Tag,
  CalendarEvent,
  Exercise,
  Sleep,
  Transaction,
  Course,
  Book,
  Skill,
  Habit,
  Goal,
  MeditationSession,
  PomodoroSession,
  UserSettings,
  TaskStatus,
  TaskPriority,
  EisenhowerQuadrant,
  MaterialDebt,
  SpiritualObligation,
  Birthday,
  FontSettings,
} from '@/types';

const defaultSettings: UserSettings = {
  language: 'en',
  calendar: 'gregorian',
  currency: 'toman',
  theme: 'system',
  notifications: {
    enabled: true,
    taskReminders: true,
    habitReminders: true,
    pomodoroComplete: true,
    dailySummary: false,
  },
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  },
};

const defaultFontSettings: FontSettings = {
  persianFont: 'vazirmatn',
  englishFont: 'inter',
  usePersianNumerals: false,
};

const defaultState: AppState = {
  tasks: [],
  projects: [],
  lists: [],
  tags: [],
  events: [],
  exercises: [],
  sleep: [],
  transactions: [],
  courses: [],
  books: [],
  skills: [],
  habits: [],
  goals: [],
  meditations: [],
  pomodoroSessions: [],
  settings: defaultSettings,
  planning: { gtdInbox: [], gtdProjects: [], okrCycles: [], weeklyReviews: [] },
  promptLibrary: { prompts: [], collections: [] },
  timeBlocks: [],
  journal: {
    entries: [],
    settings: {
      openRouterKey: '',
      preferredModel: 'google/gemini-flash-1.5',
      preferredTone: 'coach' as const,
      autoAnalyze: false,
    },
  },
  notificationRules: [],
  debts: [],
  spiritualObligations: [],
  birthdays: [],
  fontSettings: defaultFontSettings,
};

interface AppContextType extends AppState {
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  setTaskPriority: (id: string, priority: TaskPriority) => void;
  setTaskQuadrant: (id: string, quadrant: EisenhowerQuadrant) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  
  // Project operations
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // List operations
  addList: (list: Omit<TaskList, 'id' | 'createdAt'>) => void;
  updateList: (id: string, updates: Partial<TaskList>) => void;
  deleteList: (id: string) => void;
  
  // Tag operations
  addTag: (tag: Omit<Tag, 'id'>) => void;
  deleteTag: (id: string) => void;
  
  // Event operations
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Exercise operations
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (id: string) => void;
  
  // Sleep operations
  addSleep: (sleep: Omit<Sleep, 'id'>) => void;
  deleteSleep: (id: string) => void;
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Course operations
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  // Book operations
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  
  // Skill operations
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  
  // Habit operations
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: string) => void;
  
  // Goal operations
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  
  // Meditation operations
  addMeditation: (meditation: Omit<MeditationSession, 'id'>) => void;
  deleteMeditation: (id: string) => void;
  
  // Pomodoro operations
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => void;
  
  // Material Debt operations
  addMaterialDebt: (debt: Omit<MaterialDebt, 'id' | 'createdAt'>) => void;
  updateMaterialDebt: (id: string, updates: Partial<MaterialDebt>) => void;
  deleteMaterialDebt: (id: string) => void;
  
  // Spiritual Obligation operations
  addSpiritualObligation: (obligation: Omit<SpiritualObligation, 'id' | 'createdAt'>) => void;
  updateSpiritualObligation: (id: string, updates: Partial<SpiritualObligation>) => void;
  deleteSpiritualObligation: (id: string) => void;
  
  // Birthday operations
  addBirthday: (birthday: Omit<Birthday, 'id' | 'createdAt'>) => void;
  updateBirthday: (id: string, updates: Partial<Birthday>) => void;
  deleteBirthday: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Data management
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
  
  // Debt operations
  addDebt: (debt: Omit<MaterialDebt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, updates: Partial<MaterialDebt>) => void;
  deleteDebt: (id: string) => void;

  // Spiritual obligation operations
  addSpiritualObligation: (obl: Omit<SpiritualObligation, 'id' | 'createdAt'>) => void;
  updateSpiritualObligation: (id: string, updates: Partial<SpiritualObligation>) => void;
  deleteSpiritualObligation: (id: string) => void;

  // Birthday operations
  addBirthday: (birthday: Omit<Birthday, 'id' | 'createdAt'>) => void;
  updateBirthday: (id: string, updates: Partial<Birthday>) => void;
  deleteBirthday: (id: string) => void;

  // Font settings
  updateFontSettings: (settings: Partial<FontSettings>) => void;

  // Stats
  getDashboardStats: () => {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    todayTasks: number;
    currentStreak: number;
    focusTimeToday: number;
    expensesThisMonth: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data (with automatic schema migrations)
  useEffect(() => {
    try {
      setState(loadState(defaultState));
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    setIsLoaded(true);
  }, []);

  // Persist on every change
  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  // Task operations
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === 'done' ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  }, []);

  const setTaskPriority = useCallback((id: string, priority: TaskPriority) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t
      ),
    }));
  }, []);

  const setTaskQuadrant = useCallback((id: string, quadrant: EisenhowerQuadrant) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, quadrant, updatedAt: new Date().toISOString() } : t
      ),
    }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
  }, []);

  // Project operations
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.map(t =>
        t.projectId === id ? { ...t, projectId: undefined } : t
      ),
    }));
  }, []);

  // List operations
  const addList = useCallback((list: Omit<TaskList, 'id' | 'createdAt'>) => {
    const newList: TaskList = {
      ...list,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, lists: [...prev.lists, newList] }));
  }, []);

  const updateList = useCallback((id: string, updates: Partial<TaskList>) => {
    setState(prev => ({
      ...prev,
      lists: prev.lists.map(l => (l.id === id ? { ...l, ...updates } : l)),
    }));
  }, []);

  const deleteList = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      lists: prev.lists.filter(l => l.id !== id),
      tasks: prev.tasks.map(t =>
        t.listId === id ? { ...t, listId: undefined } : t
      ),
    }));
  }, []);

  // Tag operations
  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: uuidv4() };
    setState(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
  }, []);

  const deleteTag = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== id),
      tasks: prev.tasks.map(t => ({
        ...t,
        tags: t.tags.filter(tagId => tagId !== id),
      })),
    }));
  }, []);

  // Event operations
  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: uuidv4() };
    setState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id),
    }));
  }, []);

  // Exercise operations
  const addExercise = useCallback((exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = { ...exercise, id: uuidv4() };
    setState(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
  }, []);

  const deleteExercise = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== id),
    }));
  }, []);

  // Sleep operations
  const addSleep = useCallback((sleep: Omit<Sleep, 'id'>) => {
    const newSleep: Sleep = { ...sleep, id: uuidv4() };
    setState(prev => ({ ...prev, sleep: [...prev.sleep, newSleep] }));
  }, []);

  const deleteSleep = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      sleep: prev.sleep.filter(s => s.id !== id),
    }));
  }, []);

  // Transaction operations
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: uuidv4() };
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  // Course operations
  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...course, id: uuidv4() };
    setState(prev => ({ ...prev, courses: [...prev.courses, newCourse] }));
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id),
    }));
  }, []);

  // Book operations
  const addBook = useCallback((book: Omit<Book, 'id'>) => {
    const newBook: Book = { ...book, id: uuidv4() };
    setState(prev => ({ ...prev, books: [...prev.books, newBook] }));
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setState(prev => ({
      ...prev,
      books: prev.books.map(b => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const deleteBook = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      books: prev.books.filter(b => b.id !== id),
    }));
  }, []);

  // Skill operations
  const addSkill = useCallback((skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = { ...skill, id: uuidv4() };
    setState(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  }, []);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id),
    }));
  }, []);

  // Habit operations
  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => (h.id === id ? { ...h, ...updates } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
    }));
  }, []);

  const toggleHabit = useCallback((id: string, date: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => {
        if (h.id !== id) return h;
        const completions = h.completions.includes(date)
          ? h.completions.filter(d => d !== date)
          : [...h.completions, date];
        const streak = calculateStreak(completions);
        return {
          ...h,
          completions,
          streak,
          longestStreak: Math.max(streak, h.longestStreak),
        };
      }),
    }));
  }, []);

  // Goal operations
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => (g.id === id ? { ...g, ...updates } : g)),
    }));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id),
    }));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map(m =>
          m.id === milestoneId
            ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
            : m
        );
        const completedCount = milestones.filter(m => m.completed).length;
        const progress = Math.round((completedCount / milestones.length) * 100);
        return { ...g, milestones, progress };
      }),
    }));
  }, []);

  // Meditation operations
  const addMeditation = useCallback((meditation: Omit<MeditationSession, 'id'>) => {
    const newMeditation: MeditationSession = { ...meditation, id: uuidv4() };
    setState(prev => ({
      ...prev,
      meditations: [...prev.meditations, newMeditation],
    }));
  }, []);

  const deleteMeditation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      meditations: prev.meditations.filter(m => m.id !== id),
    }));
  }, []);

  // Pomodoro operations
  const addPomodoroSession = useCallback((session: Omit<PomodoroSession, 'id'>) => {
    const newSession: PomodoroSession = { ...session, id: uuidv4() };
    setState(prev => ({
      ...prev,
      pomodoroSessions: [...prev.pomodoroSessions, newSession],
    }));
  }, []);

  // Material Debt operations
  const addMaterialDebt = useCallback((debt: Omit<MaterialDebt, 'id' | 'createdAt'>) => {
    const newDebt: MaterialDebt = {
      ...debt,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, materialDebts: [...prev.materialDebts, newDebt] }));
  }, []);

  const updateMaterialDebt = useCallback((id: string, updates: Partial<MaterialDebt>) => {
    setState(prev => ({
      ...prev,
      materialDebts: prev.materialDebts.map(d => (d.id === id ? { ...d, ...updates } : d)),
    }));
  }, []);

  const deleteMaterialDebt = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      materialDebts: prev.materialDebts.filter(d => d.id !== id),
    }));
  }, []);

  // Spiritual Obligation operations
  const addSpiritualObligation = useCallback((obligation: Omit<SpiritualObligation, 'id' | 'createdAt'>) => {
    const newObligation: SpiritualObligation = {
      ...obligation,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, spiritualObligations: [...prev.spiritualObligations, newObligation] }));
  }, []);

  const updateSpiritualObligation = useCallback((id: string, updates: Partial<SpiritualObligation>) => {
    setState(prev => ({
      ...prev,
      spiritualObligations: prev.spiritualObligations.map(o => (o.id === id ? { ...o, ...updates } : o)),
    }));
  }, []);

  const deleteSpiritualObligation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      spiritualObligations: prev.spiritualObligations.filter(o => o.id !== id),
    }));
  }, []);

  // Birthday operations
  const addBirthday = useCallback((birthday: Omit<Birthday, 'id' | 'createdAt'>) => {
    const newBirthday: Birthday = {
      ...birthday,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, birthdays: [...prev.birthdays, newBirthday] }));
  }, []);

  const updateBirthday = useCallback((id: string, updates: Partial<Birthday>) => {
    setState(prev => ({
      ...prev,
      birthdays: prev.birthdays.map(b => (b.id === id ? { ...b, ...updates } : b)),
    }));
  }, []);

  const deleteBirthday = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      birthdays: prev.birthdays.filter(b => b.id !== id),
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  // Data management
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      setState({ ...defaultState, ...data });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, []);

  const resetData = useCallback(() => {
    setState(defaultState);
    clearState();
  }, []);

  // Debt operations
  const addDebt = useCallback((debt: Omit<MaterialDebt, 'id' | 'createdAt'>) => {
    const newDebt: MaterialDebt = { ...debt, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, debts: [...(prev.debts ?? []), newDebt] }));
  }, []);

  const updateDebt = useCallback((id: string, updates: Partial<MaterialDebt>) => {
    setState(prev => ({
      ...prev,
      debts: (prev.debts ?? []).map(d => d.id === id ? { ...d, ...updates } : d),
    }));
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setState(prev => ({ ...prev, debts: (prev.debts ?? []).filter(d => d.id !== id) }));
  }, []);

  // Spiritual obligation operations
  const addSpiritualObligation = useCallback((obl: Omit<SpiritualObligation, 'id' | 'createdAt'>) => {
    const newObl: SpiritualObligation = { ...obl, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, spiritualObligations: [...(prev.spiritualObligations ?? []), newObl] }));
  }, []);

  const updateSpiritualObligation = useCallback((id: string, updates: Partial<SpiritualObligation>) => {
    setState(prev => ({
      ...prev,
      spiritualObligations: (prev.spiritualObligations ?? []).map(o => o.id === id ? { ...o, ...updates } : o),
    }));
  }, []);

  const deleteSpiritualObligation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      spiritualObligations: (prev.spiritualObligations ?? []).filter(o => o.id !== id),
    }));
  }, []);

  // Birthday operations
  const addBirthday = useCallback((birthday: Omit<Birthday, 'id' | 'createdAt'>) => {
    const newBirthday: Birthday = { ...birthday, id: uuidv4(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, birthdays: [...(prev.birthdays ?? []), newBirthday] }));
  }, []);

  const updateBirthday = useCallback((id: string, updates: Partial<Birthday>) => {
    setState(prev => ({
      ...prev,
      birthdays: (prev.birthdays ?? []).map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  }, []);

  const deleteBirthday = useCallback((id: string) => {
    setState(prev => ({ ...prev, birthdays: (prev.birthdays ?? []).filter(b => b.id !== id) }));
  }, []);

  // Font settings
  const updateFontSettings = useCallback((settings: Partial<FontSettings>) => {
    setState(prev => ({
      ...prev,
      fontSettings: { ...(prev.fontSettings ?? { persianFont: 'vazirmatn', englishFont: 'inter', usePersianNumerals: false }), ...settings },
    }));
  }, []);

  // Stats
  const getDashboardStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = state.tasks.filter(t => t.dueDate === today);
    
    const focusTimeToday = state.pomodoroSessions
      .filter(s => s.startTime.startsWith(today) && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
    
    const currentMonth = today.slice(0, 7);
    const expensesThisMonth = state.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const maxStreak = Math.max(...state.habits.map(h => h.streak), 0);
    
    return {
      totalTasks: state.tasks.length,
      completedTasks: state.tasks.filter(t => t.status === 'done').length,
      pendingTasks: state.tasks.filter(t => t.status !== 'done').length,
      todayTasks: todayTasks.length,
      currentStreak: maxStreak,
      focusTimeToday,
      expensesThisMonth,
    };
  }, [state]);

  if (!isLoaded) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        setTaskPriority,
        setTaskQuadrant,
        toggleSubtask,
        addProject,
        updateProject,
        deleteProject,
        addList,
        updateList,
        deleteList,
        addTag,
        deleteTag,
        addEvent,
        updateEvent,
        deleteEvent,
        addExercise,
        deleteExercise,
        addSleep,
        deleteSleep,
        addTransaction,
        deleteTransaction,
        addCourse,
        updateCourse,
        deleteCourse,
        addBook,
        updateBook,
        deleteBook,
        addSkill,
        updateSkill,
        deleteSkill,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        addMeditation,
        deleteMeditation,
        addPomodoroSession,
        addMaterialDebt,
        updateMaterialDebt,
        deleteMaterialDebt,
        addSpiritualObligation,
        updateSpiritualObligation,
        deleteSpiritualObligation,
        addBirthday,
        updateBirthday,
        deleteBirthday,
        updateSettings,
        exportData,
        importData,
        resetData,
        getDashboardStats,
        addDebt,
        updateDebt,
        deleteDebt,
        addSpiritualObligation,
        updateSpiritualObligation,
        deleteSpiritualObligation,
        addBirthday,
        updateBirthday,
        deleteBirthday,
        updateFontSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function calculateStreak(completions: string[]): number {
  if (completions.length === 0) return 0;
  
  const sorted = [...completions].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  
  return streak;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
