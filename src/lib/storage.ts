/**
 * storage.ts — Versioned LocalStorage with migrations
 *
 * Inspired by Alembic (Python's SQLAlchemy migration tool).
 * Each schema change gets a numbered migration that runs once,
 * in order, and is never run again — exactly like Alembic revisions.
 *
 * HOW TO ADD A NEW MIGRATION:
 * 1. Increment CURRENT_SCHEMA_VERSION.
 * 2. Add a new entry to the MIGRATIONS array with the new version number.
 * 3. Write a pure function that takes old data and returns new data.
 * 4. Never modify existing migrations — only add new ones.
 */

import type { AppState } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Schema version — bump this whenever AppState shape changes
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENT_SCHEMA_VERSION = 3;

const STORAGE_KEY = 'selfmonitor-data';
const VERSION_KEY = 'selfmonitor-schema-version';
const BACKUP_KEY = 'selfmonitor-data-backup';

// ─────────────────────────────────────────────────────────────────────────────
// Migration registry  (add new entries; NEVER edit existing ones)
// ─────────────────────────────────────────────────────────────────────────────
interface Migration {
  version: number;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  up: (data: any) => any;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema — no-op migration to establish baseline',
    up: (data) => data,
  },
  {
    version: 2,
    description: 'Add planning section (GTD, OKR, Eisenhower) to state',
    up: (data) => ({
      ...data,
      planning: data.planning ?? {
        gtdInbox: [],
        gtdProjects: [],
        okrCycles: [],
        weeklyReviews: [],
      },
    }),
  },
  {
    version: 3,
    description: 'Add prompt library to state',
    up: (data) => ({
      ...data,
      promptLibrary: data.promptLibrary ?? {
        prompts: [],
        collections: [],
      },
    }),
  },
  // ── Add future migrations here ─────────────────────────────────────────────
  // {
  //   version: 4,
  //   description: 'Rename field X to Y',
  //   up: (data) => { ... },
  // },
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Load data from localStorage, running any pending migrations first. */
export function loadState(defaultState: AppState): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    let data = JSON.parse(raw);
    const savedVersion = parseInt(localStorage.getItem(VERSION_KEY) ?? '0', 10);

    if (savedVersion < CURRENT_SCHEMA_VERSION) {
      // Back up BEFORE migrating so the user can recover if something goes wrong
      localStorage.setItem(BACKUP_KEY, raw);

      data = runMigrations(data, savedVersion);
      localStorage.setItem(VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      console.info(
        `[storage] Migrated schema v${savedVersion} → v${CURRENT_SCHEMA_VERSION}`
      );
    }

    // Merge with defaults so new keys always exist
    return deepMergeWithDefault(defaultState, data);
  } catch (err) {
    console.error('[storage] Failed to load state:', err);
    return defaultState;
  }
}

/** Persist state to localStorage and stamp the schema version. */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
  } catch (err) {
    console.error('[storage] Failed to save state:', err);
  }
}

/** Wipe everything and reset to defaults. */
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(VERSION_KEY);
  // keep backup intact
}

/** Restore from the pre-migration backup (if it exists). */
export function restoreBackup(defaultState: AppState): AppState | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

/** Export all data as a downloadable JSON file. */
export function exportData(state: AppState): void {
  const blob = new Blob(
    [JSON.stringify({ schemaVersion: CURRENT_SCHEMA_VERSION, data: state }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selfmonitor-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import data from a JSON file exported by exportData(). */
export function importData(
  file: File,
  defaultState: AppState
): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        // Support both wrapped format and raw AppState
        const raw = parsed.data ?? parsed;
        const importedVersion = parsed.schemaVersion ?? 0;
        const migrated =
          importedVersion < CURRENT_SCHEMA_VERSION
            ? runMigrations(raw, importedVersion)
            : raw;
        resolve(deepMergeWithDefault(defaultState, migrated));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsText(file);
  });
}

/** Return human-readable info about the stored schema. */
export function getStorageInfo(): {
  currentVersion: number;
  storedVersion: number;
  hasBackup: boolean;
  sizeKB: number;
} {
  const storedVersion = parseInt(
    localStorage.getItem(VERSION_KEY) ?? '0',
    10
  );
  const raw = localStorage.getItem(STORAGE_KEY) ?? '';
  return {
    currentVersion: CURRENT_SCHEMA_VERSION,
    storedVersion,
    hasBackup: !!localStorage.getItem(BACKUP_KEY),
    sizeKB: Math.round((raw.length * 2) / 1024), // UTF-16 approximation
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function runMigrations(data: any, fromVersion: number): any {
  const pending = MIGRATIONS.filter((m) => m.version > fromVersion).sort(
    (a, b) => a.version - b.version
  );

  for (const migration of pending) {
    console.info(`[storage] Running migration v${migration.version}: ${migration.description}`);
    data = migration.up(data);
  }

  return data;
}

/**
 * Recursively merge `saved` into `defaults`.
 * Arrays from saved data override defaults entirely (don't concat).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMergeWithDefault(defaults: any, saved: any): any {
  if (typeof defaults !== 'object' || defaults === null) return saved ?? defaults;
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;

  const result = { ...defaults };
  for (const key of Object.keys(saved ?? {})) {
    if (key in defaults && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMergeWithDefault(defaults[key], saved[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
}

// ─── Additional migrations (added after initial delivery) ────────────────────
// These are appended to the MIGRATIONS array at runtime via the exported helper.
// In a real codebase you'd edit MIGRATIONS directly — but since this file is
// already compiled into the bundle, we export the new migrations so AppContext
// can merge them before calling loadState().

export const EXTRA_MIGRATIONS = [
  {
    version: 4,
    description: 'Add timeBlocks array',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    up: (data: any) => ({ ...data, timeBlocks: data.timeBlocks ?? [] }),
  },
  {
    version: 5,
    description: 'Add journal (entries + settings)',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    up: (data: any) => ({
      ...data,
      journal: data.journal ?? {
        entries: [],
        settings: {
          openRouterKey: '',
          preferredModel: 'google/gemini-flash-1.5',
          preferredTone: 'coach',
          autoAnalyze: false,
        },
      },
    }),
  },
  {
    version: 6,
    description: 'Add notificationRules and habit streakFreezes',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    up: (data: any) => ({
      ...data,
      notificationRules: data.notificationRules ?? [],
      habits: (data.habits ?? []).map((h: any) => ({
        ...h,
        streakFreezes: h.streakFreezes ?? 1,   // everyone starts with 1 free freeze
        freezesUsedDates: h.freezesUsedDates ?? [],
      })),
    }),
  },
];
