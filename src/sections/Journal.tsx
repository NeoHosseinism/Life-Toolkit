import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Sparkles, ChevronLeft, ChevronRight, Settings2,
  Save, Loader2, Eye, EyeOff, TrendingUp, Calendar,
  Smile, Zap, X, Plus,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { callOpenRouter, buildJournalMessages, OPENROUTER_MODELS } from '@/lib/openrouter';
import type { JournalEntry, JournalMood, JournalTone } from '@/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'selfmonitor-journal';
const SETTINGS_KEY = 'selfmonitor-journal-settings';

interface JSettings {
  openRouterKey: string;
  preferredModel: string;
  preferredTone: JournalTone;
  autoAnalyze: boolean;
}

const DEFAULT_SETTINGS: JSettings = {
  openRouterKey: '',
  preferredModel: 'google/gemini-flash-1.5',
  preferredTone: 'coach',
  autoAnalyze: false,
};

function loadEntries(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadSettings(): JSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch { return DEFAULT_SETTINGS; }
}

function saveSettings(s: JSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const todayStr = () => new Date().toISOString().split('T')[0];

const MOOD_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: 'Terrible', emoji: '😞', color: 'text-red-500' },
  2: { label: 'Bad',      emoji: '😕', color: 'text-orange-500' },
  3: { label: 'Okay',     emoji: '😐', color: 'text-yellow-500' },
  4: { label: 'Good',     emoji: '🙂', color: 'text-green-500' },
  5: { label: 'Great',    emoji: '😄', color: 'text-emerald-500' },
};

const ENERGY_LABELS: Record<number, { label: string; emoji: string }> = {
  1: { label: 'Drained',  emoji: '🪫' },
  2: { label: 'Low',      emoji: '🔋' },
  3: { label: 'Moderate', emoji: '⚡' },
  4: { label: 'High',     emoji: '🚀' },
  5: { label: 'Electric', emoji: '⚡🔥' },
};

// ─── Mood / Energy Picker ─────────────────────────────────────────────────────

function ScalePicker({
  value, onChange, labels, label,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: Record<number, { label: string; emoji: string }>;
  label: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all duration-150 ${
              value === v
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
            }`}
          >
            <span className="text-xl">{labels[v].emoji}</span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">{labels[v].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AI Insight Panel ─────────────────────────────────────────────────────────

function AIInsightPanel({
  insight, loading, onGenerate, hasKey,
}: {
  insight?: string;
  loading: boolean;
  onGenerate: () => void;
  hasKey: boolean;
}) {
  if (!hasKey) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-5 text-center space-y-2">
        <Sparkles className="w-8 h-8 mx-auto text-primary/40" />
        <p className="text-sm font-medium">AI Insights</p>
        <p className="text-xs text-muted-foreground">
          Add your <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenRouter API key</a> in Settings to unlock AI journal analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI Insight</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onGenerate} disabled={loading} className="h-7 text-xs">
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Thinking…</>
            : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />{insight ? 'Refresh' : 'Analyze'}</>
          }
        </Button>
      </div>
      {insight && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm leading-relaxed whitespace-pre-wrap"
        >
          {insight}
        </motion.p>
      )}
      {!insight && !loading && (
        <p className="text-xs text-muted-foreground">Click Analyze to get personalized insights from your journal entry.</p>
      )}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function JournalSettingsPanel({ settings, onSave, onClose }: {
  settings: JSettings;
  onSave: (s: JSettings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [showKey, setShowKey] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-5 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Settings2 className="w-4 h-4" />Journal Settings</h3>
        <Button size="sm" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OpenRouter API Key</label>
        <p className="text-[11px] text-muted-foreground mb-1.5">
          Get a free key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">openrouter.ai/keys</a>. Free models available.
        </p>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={draft.openRouterKey}
            onChange={(e) => setDraft({ ...draft, openRouterKey: e.target.value })}
            placeholder="sk-or-v1-…"
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button size="icon" variant="ghost" onClick={() => setShowKey((s) => !s)}>
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model</label>
        <select
          value={draft.preferredModel}
          onChange={(e) => setDraft({ ...draft, preferredModel: e.target.value })}
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
        >
          {OPENROUTER_MODELS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
          {(['coach', 'therapist', 'mentor', 'friend'] as JournalTone[]).map((tone) => (
            <button
              key={tone}
              onClick={() => setDraft({ ...draft, preferredTone: tone })}
              className={`py-2 px-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                draft.preferredTone === tone
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className={`w-10 h-5 rounded-full transition-colors relative ${draft.autoAnalyze ? 'bg-primary' : 'bg-muted'}`}
          onClick={() => setDraft({ ...draft, autoAnalyze: !draft.autoAnalyze })}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${draft.autoAnalyze ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm">Auto-analyze when saving</span>
      </label>

      <div className="flex gap-2">
        <Button onClick={() => { saveSettings(draft); onSave(draft); onClose(); }}>Save Settings</Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </motion.div>
  );
}

// ─── Entry History ────────────────────────────────────────────────────────────

function EntryHistory({ entries, onSelect }: {
  entries: JournalEntry[];
  onSelect: (entry: JournalEntry) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No journal entries yet. Write your first one!</p>
      </div>
    );
  }

  // Mood chart data
  const last14 = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  return (
    <div className="space-y-4">
      {/* Mood trend */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />Mood Trend (last 14 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-16">
            {last14.map((e) => (
              <div key={e.id} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${(e.mood / 5) * 100}%`,
                    backgroundColor: ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][e.mood] + 'aa',
                  }}
                />
                <span className="text-[8px] text-muted-foreground/60">{e.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entry list */}
      <div className="space-y-2">
        {[...entries].reverse().map((entry) => {
          const mood = MOOD_LABELS[entry.mood];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => onSelect(entry)}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{entry.date}</span>
                  <Badge variant="outline" className={`text-[10px] ${mood.color}`}>{mood.label}</Badge>
                </div>
                {entry.freeWrite && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{entry.freeWrite}</p>
                )}
              </div>
              {entry.aiInsight && (
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Journal component ───────────────────────────────────────────────────

export default function Journal() {
  const [entries, setEntries]           = useState<JournalEntry[]>(loadEntries);
  const [settings, setSettings]         = useState<JSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab]       = useState('write');

  // Today's entry
  const today = todayStr();
  const existingToday = entries.find((e) => e.date === today);

  const [mood, setMood]           = useState<JournalMood>(existingToday?.mood ?? 3);
  const [energy, setEnergy]       = useState<number>(existingToday?.energy ?? 3);
  const [freeWrite, setFreeWrite] = useState(existingToday?.freeWrite ?? '');
  const [gratitude, setGratitude] = useState<string[]>(existingToday?.gratitude ?? ['', '', '']);
  const [intention, setIntention] = useState(existingToday?.intention ?? '');
  const [aiInsight, setAiInsight] = useState(existingToday?.aiInsight ?? '');
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved]         = useState(false);

  // Load existing when switching to today
  useEffect(() => {
    if (existingToday) {
      setMood(existingToday.mood);
      setEnergy(existingToday.energy as 1|2|3|4|5);
      setFreeWrite(existingToday.freeWrite);
      setGratitude(existingToday.gratitude.length ? existingToday.gratitude : ['', '', '']);
      setIntention(existingToday.intention);
      setAiInsight(existingToday.aiInsight ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildEntry = useCallback((insight?: string): JournalEntry => ({
    id: existingToday?.id ?? uuidv4(),
    date: today,
    mood,
    energy: energy as 1|2|3|4|5,
    freeWrite,
    gratitude: gratitude.filter(Boolean),
    intention,
    aiInsight: insight ?? aiInsight,
    aiModel: settings.preferredModel,
    createdAt: existingToday?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [existingToday, today, mood, energy, freeWrite, gratitude, intention, aiInsight, settings.preferredModel]);

  const saveEntry = useCallback((entry: JournalEntry) => {
    const updated = existingToday
      ? entries.map((e) => e.id === entry.id ? entry : e)
      : [...entries, entry];
    setEntries(updated);
    saveEntries(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [entries, existingToday]);

  const handleSave = () => {
    const entry = buildEntry();
    saveEntry(entry);
    if (settings.autoAnalyze && settings.openRouterKey) {
      handleAnalyze(entry);
    }
  };

  const handleAnalyze = async (entryOverride?: JournalEntry) => {
    if (!settings.openRouterKey) return;
    setAiLoading(true);
    try {
      const recentContext = entries
        .filter((e) => e.date !== today)
        .slice(-3)
        .map((e) => `${e.date}: mood=${e.mood}, "${e.intention}"`)
        .join('\n');

      let streamedInsight = '';
      await callOpenRouter(settings.openRouterKey, {
        model: settings.preferredModel,
        messages: buildJournalMessages({
          mood, energy, freeWrite,
          gratitude: gratitude.filter(Boolean),
          intention,
          tone: settings.preferredTone,
          recentContext,
        }),
        onChunk: (chunk) => {
          streamedInsight += chunk;
          setAiInsight(streamedInsight);
        },
      });

      // Persist insight
      const entry = buildEntry(streamedInsight);
      saveEntry(entry);
    } catch (err) {
      console.error('[journal] OpenRouter error:', err);
      setAiInsight(`⚠️ Error: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const setGratitudeItem = (i: number, val: string) => {
    const copy = [...gratitude];
    copy[i] = val;
    setGratitude(copy);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />Daily Journal
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />{today}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings((s) => !s)}
          className={showSettings ? 'text-primary' : ''}
        >
          <Settings2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <JournalSettingsPanel
            settings={settings}
            onSave={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="write">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />Today
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />History
            {entries.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 bg-primary/10 text-primary rounded-full">{entries.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Write tab ── */}
        <TabsContent value="write" className="space-y-5 pt-2">
          {/* Mood + Energy */}
          <Card className="border-border/50">
            <CardContent className="pt-5 space-y-5">
              <ScalePicker value={mood} onChange={(v) => setMood(v as JournalMood)} labels={MOOD_LABELS} label="How are you feeling?" />
              <ScalePicker value={energy} onChange={(v) => setEnergy(v)} labels={ENERGY_LABELS} label="Energy level" />
            </CardContent>
          </Card>

          {/* Free write */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="w-3 h-3 inline mr-1.5" />Free Write
            </label>
            <textarea
              value={freeWrite}
              onChange={(e) => setFreeWrite(e.target.value)}
              rows={5}
              placeholder="What's on your mind? No rules, just write…"
              className="w-full mt-1.5 px-4 py-3 rounded-2xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
            />
          </div>

          {/* Gratitude */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ✨ Gratitude (up to 3)
            </label>
            <div className="space-y-2 mt-1.5">
              {gratitude.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                  <input
                    value={g}
                    onChange={(e) => setGratitudeItem(i, e.target.value)}
                    placeholder={['I'm grateful for…', 'Something good that happened…', 'A person I appreciate…'][i]}
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Intention */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              🎯 Tomorrow's Intention
            </label>
            <input
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="One thing I want to focus on tomorrow…"
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* AI Insight */}
          <AIInsightPanel
            insight={aiInsight}
            loading={aiLoading}
            onGenerate={() => handleAnalyze()}
            hasKey={!!settings.openRouterKey}
          />

          {/* Save button */}
          <Button
            onClick={handleSave}
            className="w-full"
            disabled={aiLoading}
          >
            {saved
              ? <><motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4 }}>✅</motion.span> Saved!</>
              : <><Save className="w-4 h-4 mr-1.5" />Save Entry</>
            }
          </Button>
        </TabsContent>

        {/* ── History tab ── */}
        <TabsContent value="history">
          <EntryHistory
            entries={entries}
            onSelect={(entry) => {
              setMood(entry.mood);
              setEnergy(entry.energy);
              setFreeWrite(entry.freeWrite);
              setGratitude(entry.gratitude.length >= 3 ? entry.gratitude : [...entry.gratitude, '', ''].slice(0, 3));
              setIntention(entry.intention);
              setAiInsight(entry.aiInsight ?? '');
              setActiveTab('write');
            }}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
