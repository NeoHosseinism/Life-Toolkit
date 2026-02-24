/**
 * notifications.ts — Local push notifications, zero server required.
 *
 * Strategy:
 * 1. Request browser Notification permission once.
 * 2. Register a Service Worker (provided by Vite PWA plugin) that can
 *    receive messages from the main thread.
 * 3. Schedule "alarm" timers using setInterval (1-minute tick) that fire
 *    Notifications when the current time matches a NotificationRule.
 * 4. When the SW is available we also post a keepalive message so the SW
 *    can re-schedule if the tab is backgrounded for a long time.
 *
 * All state lives in localStorage — no backend, no push subscription needed.
 */

import type { NotificationRule } from '@/types';

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// ─── Fire a notification ──────────────────────────────────────────────────────

function fire(rule: NotificationRule) {
  if (Notification.permission !== 'granted') return;

  const icons: Record<NotificationRule['type'], string> = {
    habit:      '🔥',
    pomodoro:   '🍅',
    task:       '✅',
    journal:    '📓',
    timeblock:  '🗓️',
  };

  const titles: Record<NotificationRule['type'], string> = {
    habit:     'Habit Reminder',
    pomodoro:  'Pomodoro Reminder',
    task:      'Task Due',
    journal:   'Daily Journal',
    timeblock: 'Time Block Starting',
  };

  const n = new Notification(`${icons[rule.type]} ${rule.label || titles[rule.type]}`, {
    body: rule.label || titles[rule.type],
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `selfmonitor-${rule.id}`,   // replaces previous notification with same rule
    renotify: true,
    silent: false,
  });

  // Auto-close after 8 seconds
  setTimeout(() => n.close(), 8000);
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

let tickInterval: ReturnType<typeof setInterval> | null = null;
let loadedRules: NotificationRule[] = [];

/** Call this once on app boot with your rules array. Re-call when rules change. */
export function startNotificationScheduler(rules: NotificationRule[]) {
  loadedRules = rules;

  if (tickInterval !== null) return; // already running

  tickInterval = setInterval(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const day = now.getDay(); // 0=Sun

    for (const rule of loadedRules) {
      if (!rule.enabled) continue;
      if (rule.hour !== h || rule.minute !== m) continue;
      if (rule.days.length > 0 && !rule.days.includes(day)) continue;
      fire(rule);
    }
  }, 60_000); // check every minute
}

/** Update rules without restarting the interval. */
export function updateSchedulerRules(rules: NotificationRule[]) {
  loadedRules = rules;
}

export function stopNotificationScheduler() {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// ─── Test helper ─────────────────────────────────────────────────────────────

export function sendTestNotification() {
  if (Notification.permission !== 'granted') {
    console.warn('[notifications] Permission not granted');
    return;
  }
  new Notification('🔔 Self Monitor', {
    body: 'Notifications are working!',
    icon: '/icons/icon-192.png',
  });
}
