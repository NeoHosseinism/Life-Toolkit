import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, BellOff, Plus, Trash2, Check, Clock, AlertCircle,
  Smartphone, Shield, Settings, RefreshCw,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  requestNotificationPermission,
  getNotificationPermission,
  sendTestNotification,
  updateSchedulerRules,
} from '@/lib/notifications';
import type { NotificationRule } from '@/types';

// ─── storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'selfmonitor-notification-rules';

function loadRules(): NotificationRule[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function saveRules(rules: NotificationRule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  updateSchedulerRules(rules);
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_INFO: Record<NotificationRule['type'], { label: string; emoji: string; color: string }> = {
  habit:     { label: 'Habit',      emoji: '🔥', color: 'bg-orange-500/10 text-orange-600' },
  pomodoro:  { label: 'Pomodoro',   emoji: '🍅', color: 'bg-red-500/10 text-red-600' },
  task:      { label: 'Task',       emoji: '✅', color: 'bg-green-500/10 text-green-600' },
  journal:   { label: 'Journal',    emoji: '📓', color: 'bg-blue-500/10 text-blue-600' },
  timeblock: { label: 'Time Block', emoji: '🗓️', color: 'bg-purple-500/10 text-purple-600' },
};

function formatTime(h: number, m: number): string {
  const hh = h % 12 || 12;
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

// ─── Rule Editor ──────────────────────────────────────────────────────────────

function RuleEditor({
  rule,
  onSave,
  onClose,
}: {
  rule?: Partial<NotificationRule>;
  onSave: (r: NotificationRule) => void;
  onClose: () => void;
}) {
  const [label, setLabel]   = useState(rule?.label ?? '');
  const [type, setType]     = useState<NotificationRule['type']>(rule?.type ?? 'habit');
  const [hour, setHour]     = useState(rule?.hour ?? 9);
  const [minute, setMinute] = useState(rule?.minute ?? 0);
  const [days, setDays]     = useState<number[]>(rule?.days ?? []);

  const toggleDay = (d: number) =>
    setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort());

  const handleSave = () => {
    onSave({
      id: rule?.id ?? uuidv4(),
      label: label.trim() || TYPE_INFO[type].label,
      type,
      hour,
      minute,
      days,
      enabled: rule?.enabled ?? true,
      createdAt: rule?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{rule?.id ? 'Edit Reminder' : 'New Reminder'}</h3>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <Plus className="w-4 h-4 rotate-45" />
        </Button>
      </div>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Reminder label…"
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Type */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</label>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {(Object.keys(TYPE_INFO) as NotificationRule['type'][]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                type === t ? TYPE_INFO[t].color + ' border-current' : 'border-border hover:border-primary/40'
              }`}
            >
              {TYPE_INFO[t].emoji} {TYPE_INFO[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Time</label>
        <div className="flex gap-2 mt-1.5">
          <select value={hour} onChange={(e) => setHour(+e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm">
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
            ))}
          </select>
          <select value={minute} onChange={(e) => setMinute(+e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm">
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Days */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Days <span className="normal-case font-normal">(empty = every day)</span>
        </label>
        <div className="flex gap-1.5 mt-1.5">
          {DAY_LABELS.map((d, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                days.includes(i)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {d[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          <Check className="w-4 h-4 mr-1.5" />Save Reminder
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Main Notifications ───────────────────────────────────────────────────────

export default function NotificationsManager() {
  const [rules, setRules]       = useState<NotificationRule[]>(loadRules);
  const [permission, setPerm]   = useState(getNotificationPermission());
  const [editing, setEditing]   = useState<string | null>(null);
  const [adding, setAdding]     = useState(false);

  // Pre-populate with sensible defaults if empty
  useEffect(() => {
    if (rules.length === 0) {
      const defaults: NotificationRule[] = [
        { id: uuidv4(), label: 'Morning Journal', type: 'journal',  hour: 8,  minute: 0,  days: [1,2,3,4,5], enabled: true, createdAt: new Date().toISOString() },
        { id: uuidv4(), label: 'Evening Habits',  type: 'habit',    hour: 21, minute: 0,  days: [],          enabled: true, createdAt: new Date().toISOString() },
        { id: uuidv4(), label: 'Pomodoro Break',  type: 'pomodoro', hour: 12, minute: 30, days: [1,2,3,4,5], enabled: false, createdAt: new Date().toISOString() },
      ];
      setRules(defaults);
      saveRules(defaults);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (updated: NotificationRule[]) => {
    setRules(updated);
    saveRules(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPerm(granted ? 'granted' : 'denied');
  };

  const saveRule = (rule: NotificationRule) => {
    const exists = rules.find((r) => r.id === rule.id);
    persist(exists ? rules.map((r) => r.id === rule.id ? rule : r) : [...rules, rule]);
    setEditing(null);
    setAdding(false);
  };

  const deleteRule = (id: string) => persist(rules.filter((r) => r.id !== id));

  const toggleRule = (id: string) =>
    persist(rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />Reminders
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Local browser notifications — no server, no account needed
        </p>
      </div>

      {/* Permission banner */}
      {permission !== 'granted' && (
        <Card className={`border-2 ${permission === 'denied' ? 'border-red-500/30 bg-red-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
          <CardContent className="p-4 flex items-start gap-3">
            {permission === 'denied'
              ? <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              : <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            }
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {permission === 'denied' ? 'Notifications Blocked' : 'Notifications Not Enabled'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {permission === 'denied'
                  ? 'Notifications were blocked. Re-enable them in your browser site settings (the lock icon in the address bar).'
                  : 'Click below to enable browser notifications. You\'ll see a permission prompt.'
                }
              </p>
            </div>
            {permission !== 'denied' && (
              <Button size="sm" onClick={handleRequestPermission}>
                <Bell className="w-3.5 h-3.5 mr-1.5" />Enable
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permission granted banner */}
      {permission === 'granted' && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications enabled · {enabledCount} active reminder{enabledCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={sendTestNotification}>
              <Smartphone className="w-3.5 h-3.5 mr-1" />Test
            </Button>
          </div>
        </div>
      )}

      {/* How it works */}
      <Card className="border-border/50">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How it works</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Reminders fire while the app tab is open (browser limitation without a server)</p>
            <p>• Install the app as a PWA (Add to Home Screen) for the best experience — the Service Worker keeps reminders alive when the tab is backgrounded</p>
            <p>• Notifications check once per minute — they'll fire within 1 min of the scheduled time</p>
          </div>
        </CardContent>
      </Card>

      {/* Add editor */}
      {adding && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <RuleEditor onSave={saveRule} onClose={() => setAdding(false)} />
        </motion.div>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Your Reminders</h3>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" />Add Reminder
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <BellOff className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No reminders yet.</p>
          </div>
        ) : (
          rules.map((rule) => {
            const info = TYPE_INFO[rule.type];
            const isEditingThis = editing === rule.id;
            return (
              <div key={rule.id}>
                {isEditingThis ? (
                  <RuleEditor
                    rule={rule}
                    onSave={saveRule}
                    onClose={() => setEditing(null)}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      rule.enabled
                        ? 'border-border/50 bg-card'
                        : 'border-border/30 bg-muted/30 opacity-60'
                    }`}
                  >
                    <span className="text-xl shrink-0">{info.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{rule.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${info.color}`}>
                          {info.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTime(rule.hour, rule.minute)}
                        {' · '}
                        {rule.days.length === 0
                          ? 'Every day'
                          : rule.days.map((d) => DAY_LABELS[d]).join(', ')
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(rule.id)}>
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
