import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  FolderOpen,
  BarChart3,
  ClipboardList,
  Plus,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import type {
  GTDItem,
  GTDProject,
  OKRCycle,
  Objective,
  KeyResult,
  WeeklyReview,
} from '@/types';

// ─── helpers ──────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().split('T')[0];

const energyColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-600',
  medium: 'bg-yellow-500/10 text-yellow-600',
  high: 'bg-red-500/10 text-red-600',
};

const krStatusColors: Record<string, string> = {
  onTrack:  'text-green-600',
  atRisk:   'text-yellow-600',
  offTrack: 'text-red-600',
  completed:'text-primary',
};

// ─── GTD Inbox ────────────────────────────────────────────────────────────────

function GTDInbox({ items, onChange }: { items: GTDItem[]; onChange: (i: GTDItem[]) => void }) {
  const [input, setInput] = useState('');

  const capture = () => {
    if (!input.trim()) return;
    onChange([...items, {
      id: uuidv4(), title: input.trim(), energy: 'medium',
      isNextAction: false, isSomeday: false, isWaiting: false,
      isProcessed: false, createdAt: now(), updatedAt: now(),
    }]);
    setInput('');
  };

  const markProcessed = (id: string) =>
    onChange(items.map((i) => i.id === id ? { ...i, isNextAction: true, isProcessed: true, updatedAt: now() } : i));

  const markSomeday = (id: string) =>
    onChange(items.map((i) => i.id === id ? { ...i, isSomeday: true, isProcessed: true, updatedAt: now() } : i));

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const inbox = items.filter((i) => !i.isProcessed);

  return (
    <div className="space-y-4">
      {/* Capture */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && capture()}
          placeholder="Capture anything on your mind…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button onClick={capture}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>

      {inbox.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Inbox zero! 🎉</p>
        </div>
      )}

      <div className="space-y-2">
        {inbox.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 group"
          >
            <span className="flex-1 text-sm">{item.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${energyColors[item.energy]}`}>
              {item.energy}
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 hover:text-green-700" onClick={() => markProcessed(item.id)}>
                <Zap className="w-3.5 h-3.5 mr-1" />Next
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground" onClick={() => markSomeday(item.id)}>
                <Clock className="w-3.5 h-3.5 mr-1" />Someday
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => remove(item.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Actions */}
      {items.filter((i) => i.isNextAction).length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-muted-foreground mt-6 mb-2">Next Actions</h3>
          {items.filter((i) => i.isNextAction).map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span className="flex-1 text-sm">{item.title}</span>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => remove(item.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── OKR Board ────────────────────────────────────────────────────────────────

function OKRBoard({ cycles, onChange }: { cycles: OKRCycle[]; onChange: (c: OKRCycle[]) => void }) {
  const [newCycleLabel, setNewCycleLabel] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const addCycle = () => {
    if (!newCycleLabel.trim()) return;
    const cycle: OKRCycle = {
      id: uuidv4(),
      label: newCycleLabel.trim(),
      startDate: todayStr(),
      endDate: '',
      objectives: [],
    };
    onChange([...cycles, cycle]);
    setNewCycleLabel('');
  };

  const addObjective = (cycleId: string) => {
    const obj: Objective = {
      id: uuidv4(),
      title: 'New Objective',
      keyResults: [],
      quarter: cycles.find((c) => c.id === cycleId)?.label ?? '',
      status: 'active',
      createdAt: now(),
    };
    onChange(cycles.map((c) =>
      c.id === cycleId ? { ...c, objectives: [...c.objectives, obj] } : c
    ));
  };

  const addKR = (cycleId: string, objId: string) => {
    const kr: KeyResult = {
      id: uuidv4(), title: 'Key Result', target: 100,
      current: 0, unit: '%', confidence: 3, status: 'onTrack',
    };
    onChange(cycles.map((c) => ({
      ...c,
      objectives: c.objectives.map((o) =>
        o.id === objId && c.id === cycleId
          ? { ...o, keyResults: [...o.keyResults, kr] }
          : o
      ),
    })));
  };

  const updateKRProgress = (cycleId: string, objId: string, krId: string, current: number) => {
    onChange(cycles.map((c) => ({
      ...c,
      objectives: c.objectives.map((o) => ({
        ...o,
        keyResults: o.keyResults.map((kr) =>
          kr.id === krId && o.id === objId && c.id === cycleId
            ? { ...kr, current, status: current >= kr.target ? 'completed' : current >= kr.target * 0.7 ? 'onTrack' : 'atRisk' }
            : kr
        ),
      })),
    })));
  };

  if (cycles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <input value={newCycleLabel} onChange={(e) => setNewCycleLabel(e.target.value)} placeholder="e.g. Q2 2025" className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Button onClick={addCycle}><Plus className="w-4 h-4 mr-1" />New Cycle</Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No OKR cycles yet. Start by adding a quarter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={newCycleLabel} onChange={(e) => setNewCycleLabel(e.target.value)} placeholder="e.g. Q3 2025" className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <Button onClick={addCycle}><Plus className="w-4 h-4 mr-1" />New Cycle</Button>
      </div>

      {cycles.map((cycle) => {
        const isOpen = expanded === cycle.id;
        const totalKRs = cycle.objectives.flatMap((o) => o.keyResults).length;
        const doneKRs  = cycle.objectives.flatMap((o) => o.keyResults).filter((kr) => kr.status === 'completed').length;
        const progress  = totalKRs > 0 ? Math.round((doneKRs / totalKRs) * 100) : 0;

        return (
          <Card key={cycle.id} className="border-border/50">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(isOpen ? null : cycle.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{cycle.label}</CardTitle>
                  <Badge variant="outline" className="text-xs">{cycle.objectives.length} objectives</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">{progress}%</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              <Progress value={progress} className="h-1.5 mt-2" />
            </CardHeader>

            {isOpen && (
              <CardContent className="space-y-4 pt-2">
                {cycle.objectives.map((obj) => {
                  const objProgress = obj.keyResults.length
                    ? Math.round(obj.keyResults.reduce((s, kr) => s + Math.min(100, (kr.current / kr.target) * 100), 0) / obj.keyResults.length)
                    : 0;
                  return (
                    <div key={obj.id} className="bg-muted/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{obj.title}</p>
                          <Progress value={objProgress} className="h-1 mt-1 w-32" />
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => addKR(cycle.id, obj.id)}>
                          <Plus className="w-3 h-3 mr-1" />Key Result
                        </Button>
                      </div>
                      {obj.keyResults.map((kr) => (
                        <div key={kr.id} className="flex items-center gap-3 pl-2">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">{kr.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={(kr.current / kr.target) * 100} className="h-1 flex-1" />
                              <span className={`text-xs font-medium shrink-0 ${krStatusColors[kr.status]}`}>
                                {kr.current}/{kr.target} {kr.unit}
                              </span>
                            </div>
                          </div>
                          <input
                            type="range" min={0} max={kr.target}
                            value={kr.current}
                            onChange={(e) => updateKRProgress(cycle.id, obj.id, kr.id, Number(e.target.value))}
                            className="w-20 accent-primary"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
                <Button size="sm" variant="outline" onClick={() => addObjective(cycle.id)}>
                  <Plus className="w-4 h-4 mr-1" />Add Objective
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Eisenhower Matrix ────────────────────────────────────────────────────────

interface EItem { id: string; title: string; quadrant: 'doFirst' | 'schedule' | 'delegate' | 'eliminate' }

function EisenhowerMatrix() {
  const [items, setItems] = useState<EItem[]>([]);
  const [input, setInput] = useState('');
  const [targetQ, setTargetQ] = useState<EItem['quadrant']>('doFirst');

  const add = () => {
    if (!input.trim()) return;
    setItems([...items, { id: uuidv4(), title: input.trim(), quadrant: targetQ }]);
    setInput('');
  };

  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  const quadrants: { id: EItem['quadrant']; label: string; sub: string; color: string; border: string }[] = [
    { id: 'doFirst',    label: 'Do First',  sub: 'Urgent + Important',    color: 'bg-red-500/10',    border: 'border-red-500/30' },
    { id: 'schedule',   label: 'Schedule',  sub: 'Not Urgent + Important', color: 'bg-green-500/10',  border: 'border-green-500/30' },
    { id: 'delegate',   label: 'Delegate',  sub: 'Urgent + Not Important', color: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { id: 'eliminate',  label: 'Eliminate', sub: 'Neither',               color: 'bg-gray-500/10',   border: 'border-gray-500/30' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a task…" className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <select value={targetQ} onChange={(e) => setTargetQ(e.target.value as EItem['quadrant'])} className="px-3 py-2 rounded-xl border border-border bg-card text-sm">
          {quadrants.map((q) => <option key={q.id} value={q.id}>{q.label}</option>)}
        </select>
        <Button onClick={add}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quadrants.map((q) => (
          <div key={q.id} className={`rounded-2xl border p-4 min-h-[160px] ${q.color} ${q.border}`}>
            <div className="mb-3">
              <p className="font-semibold text-sm">{q.label}</p>
              <p className="text-[11px] text-muted-foreground">{q.sub}</p>
            </div>
            <div className="space-y-1.5">
              {items.filter((i) => i.quadrant === q.id).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm bg-background/60 rounded-lg px-3 py-1.5">
                  <span className="flex-1">{item.title}</span>
                  <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly Review ────────────────────────────────────────────────────────────

function WeeklyReviewSection({
  reviews, onChange,
}: {
  reviews: WeeklyReview[];
  onChange: (r: WeeklyReview[]) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const startReview = () => {
    const r: WeeklyReview = {
      id: uuidv4(), weekStartDate: todayStr(),
      inboxCleared: false, projectsReviewed: false,
      nextActionsReviewed: false, somedayReviewed: false, calendarReviewed: false,
      wins: '', challenges: '', focus: '', createdAt: now(),
    };
    onChange([...reviews, r]);
    setActive(r.id);
  };

  const update = (id: string, patch: Partial<WeeklyReview>) =>
    onChange(reviews.map((r) => r.id === id ? { ...r, ...patch } : r));

  const complete = (id: string) =>
    update(id, { completedAt: now() });

  const checkboxes: { key: keyof WeeklyReview; label: string }[] = [
    { key: 'inboxCleared',          label: 'Inbox processed to zero' },
    { key: 'projectsReviewed',      label: 'All projects reviewed' },
    { key: 'nextActionsReviewed',   label: 'Next actions lists reviewed' },
    { key: 'somedayReviewed',       label: 'Someday/Maybe list reviewed' },
    { key: 'calendarReviewed',      label: 'Calendar reviewed (past + future)' },
  ];

  const current = reviews.find((r) => r.id === active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Weekly Reviews</h3>
          <p className="text-xs text-muted-foreground mt-0.5">GTD weekly review ritual</p>
        </div>
        <Button onClick={startReview} size="sm">
          <RefreshCw className="w-4 h-4 mr-1.5" />Start This Week's Review
        </Button>
      </div>

      {current && !current.completedAt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-5 space-y-4">
            <h4 className="font-medium text-sm">Week of {current.weekStartDate}</h4>

            {/* Checklists */}
            <div className="space-y-2">
              {checkboxes.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      current[key] ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                    }`}
                    onClick={() => update(current.id, { [key]: !current[key] })}
                  >
                    {current[key] && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            {/* Reflections */}
            {(['wins', 'challenges', 'focus'] as const).map((field) => (
              <div key={field}>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {field === 'wins' ? '🏆 Wins this week' : field === 'challenges' ? '⚠️ Challenges' : '🎯 Top focus next week'}
                </label>
                <textarea
                  value={current[field]}
                  onChange={(e) => update(current.id, { [field]: e.target.value })}
                  rows={2}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}

            <Button onClick={() => complete(current.id)} className="w-full">
              <Check className="w-4 h-4 mr-1.5" />Complete Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {reviews.filter((r) => r.completedAt).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Past Reviews</h4>
          {reviews.filter((r) => r.completedAt).reverse().map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50">
              <Star className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm flex-1">Week of {r.weekStartDate}</span>
              <span className="text-xs text-muted-foreground">Completed {r.completedAt?.split('T')[0]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Planning component ──────────────────────────────────────────────────

export default function Planning() {
  const { t } = useLanguage();

  // Local state (in a real app, hook into AppContext)
  const [gtdItems, setGtdItems]     = useState<GTDItem[]>([]);
  const [okrCycles, setOkrCycles]   = useState<OKRCycle[]>([]);
  const [reviews, setReviews]       = useState<WeeklyReview[]>([]);

  const inboxCount = gtdItems.filter((i) => !i.isProcessed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Planning Hub</h2>
        <p className="text-muted-foreground text-sm mt-1">
          GTD · OKR · Eisenhower Matrix · Weekly Review
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Inbox', value: inboxCount, icon: Inbox, color: 'text-yellow-500' },
          { label: 'Next Actions', value: gtdItems.filter((i) => i.isNextAction).length, icon: Zap, color: 'text-green-500' },
          { label: 'OKR Cycles', value: okrCycles.length, icon: BarChart3, color: 'text-blue-500' },
          { label: 'Reviews', value: reviews.filter((r) => r.completedAt).length, icon: ClipboardList, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gtd">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 mb-4">
          <TabsTrigger value="gtd" className="text-xs sm:text-sm">
            <Inbox className="w-3.5 h-3.5 mr-1.5" />GTD Inbox
            {inboxCount > 0 && (
              <span className="ml-1.5 bg-yellow-500/20 text-yellow-600 text-[10px] px-1.5 rounded-full">{inboxCount}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="okr" className="text-xs sm:text-sm">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />OKR Board
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs sm:text-sm">
            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />Eisenhower
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs sm:text-sm">
            <ClipboardList className="w-3.5 h-3.5 mr-1.5" />Weekly Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gtd">
          <GTDInbox items={gtdItems} onChange={setGtdItems} />
        </TabsContent>
        <TabsContent value="okr">
          <OKRBoard cycles={okrCycles} onChange={setOkrCycles} />
        </TabsContent>
        <TabsContent value="matrix">
          <EisenhowerMatrix />
        </TabsContent>
        <TabsContent value="review">
          <WeeklyReviewSection reviews={reviews} onChange={setReviews} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
