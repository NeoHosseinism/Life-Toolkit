import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Trash2,
  Check, GripVertical, Calendar, Target,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { TimeBlock, TimeBlockCategory } from '@/types';
import { TIME_BLOCK_COLORS } from '@/types';

// ─── constants ────────────────────────────────────────────────────────────────

const HOUR_HEIGHT = 64; // px per hour
const SLOT_MINUTES = 15; // snapping grid
const SLOT_HEIGHT = HOUR_HEIGHT / (60 / SLOT_MINUTES); // 16px per 15min

const START_HOUR = 6;   // day starts at 6am
const END_HOUR   = 23;  // day ends at 11pm
const TOTAL_HOURS = END_HOUR - START_HOUR;

const CATEGORIES: TimeBlockCategory[] = [
  'deep-work', 'meetings', 'admin', 'learning',
  'health', 'personal', 'break', 'buffer',
];

const CATEGORY_ICONS: Record<TimeBlockCategory, string> = {
  'deep-work': '🧠',
  'meetings':  '🤝',
  'admin':     '📋',
  'learning':  '📚',
  'health':    '💪',
  'personal':  '🌟',
  'break':     '☕',
  'buffer':    '🔲',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'selfmonitor-timeblocks';

function loadBlocks(): TimeBlock[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

function saveBlocks(blocks: TimeBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function minutesToY(hour: number, minute: number): number {
  return ((hour - START_HOUR) * 60 + minute) * (SLOT_HEIGHT / SLOT_MINUTES);
}

function yToTime(y: number): { hour: number; minute: number } {
  const totalMinutes = Math.round((y / SLOT_HEIGHT) * SLOT_MINUTES);
  const snapped = Math.round(totalMinutes / SLOT_MINUTES) * SLOT_MINUTES;
  const hour = Math.floor(snapped / 60) + START_HOUR;
  const minute = snapped % 60;
  return {
    hour: Math.max(START_HOUR, Math.min(END_HOUR - 1, hour)),
    minute: Math.max(0, Math.min(59, minute)),
  };
}

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m} ${hour < 12 ? 'AM' : 'PM'}`;
}

// ─── BlockCard ────────────────────────────────────────────────────────────────

interface BlockCardProps {
  block: TimeBlock;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onResize: (id: string, newDuration: number) => void;
  onClick: (block: TimeBlock) => void;
}

function BlockCard({ block, onDelete, onToggle, onResize, onClick }: BlockCardProps) {
  const color = TIME_BLOCK_COLORS[block.category];
  const y = minutesToY(block.startHour, block.startMinute);
  const h = (block.durationMinutes / 60) * HOUR_HEIGHT;
  const tooShort = h < 40;

  const resizingRef = useRef(false);
  const startYRef = useRef(0);
  const startDurRef = useRef(0);

  const onResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    resizingRef.current = true;
    startYRef.current = e.clientY;
    startDurRef.current = block.durationMinutes;

    const onMove = (ev: PointerEvent) => {
      if (!resizingRef.current) return;
      const dy = ev.clientY - startYRef.current;
      const dMinutes = Math.round((dy / SLOT_HEIGHT) * SLOT_MINUTES);
      const newDur = Math.max(SLOT_MINUTES, Math.round((startDurRef.current + dMinutes) / SLOT_MINUTES) * SLOT_MINUTES);
      onResize(block.id, newDur);
    };

    const onUp = () => {
      resizingRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        top: y,
        left: 4,
        right: 4,
        height: Math.max(h, 24),
        backgroundColor: color + '22',
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        opacity: block.completed ? 0.5 : 1,
        cursor: 'pointer',
        zIndex: 10,
      }}
      className="overflow-hidden select-none group"
      onClick={() => onClick(block)}
    >
      <div className="px-2 py-1 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-1 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold leading-tight truncate" style={{ color }}>
              {CATEGORY_ICONS[block.category]} {block.title}
            </p>
            {!tooShort && (
              <p className="text-[10px] text-muted-foreground">
                {formatTime(block.startHour, block.startMinute)} · {block.durationMinutes}m
              </p>
            )}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(block.id); }}
              className="p-0.5 rounded hover:bg-black/10 transition-colors"
            >
              <Check className="w-3 h-3" style={{ color }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
              className="p-0.5 rounded hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          </div>
        </div>

        {/* Resize handle */}
        {h > 24 && (
          <div
            onPointerDown={onResizeStart}
            className="absolute bottom-0 inset-x-0 h-3 flex items-center justify-center cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-8 h-0.5 rounded-full bg-muted-foreground/40" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────

function BlockEditor({
  block, onSave, onClose,
}: {
  block: Partial<TimeBlock>;
  onSave: (b: TimeBlock) => void;
  onClose: () => void;
}) {
  const [title, setTitle]     = useState(block.title ?? '');
  const [cat, setCat]         = useState<TimeBlockCategory>(block.category ?? 'deep-work');
  const [startH, setStartH]   = useState(block.startHour ?? 9);
  const [startM, setStartM]   = useState(block.startMinute ?? 0);
  const [dur, setDur]         = useState(block.durationMinutes ?? 60);
  const [notes, setNotes]     = useState(block.notes ?? '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: block.id ?? uuidv4(),
      date: block.date ?? dateStr(new Date()),
      title: title.trim(),
      category: cat,
      startHour: startH,
      startMinute: startM,
      durationMinutes: dur,
      notes,
      completed: block.completed ?? false,
      createdAt: block.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{block.id ? 'Edit Block' : 'New Time Block'}</h3>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}><Plus className="w-4 h-4 rotate-45" /></Button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What will you work on?"
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        autoFocus
      />

      {/* Category */}
      <div className="grid grid-cols-4 gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-xl border text-[10px] font-medium transition-all"
            style={{
              borderColor: cat === c ? TIME_BLOCK_COLORS[c] : '',
              backgroundColor: cat === c ? TIME_BLOCK_COLORS[c] + '20' : '',
              color: cat === c ? TIME_BLOCK_COLORS[c] : '',
            }}
          >
            <span className="text-base">{CATEGORY_ICONS[c]}</span>
            <span className="capitalize truncate w-full text-center">{c.replace('-', ' ')}</span>
          </button>
        ))}
      </div>

      {/* Time + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-semibold">Start Time</label>
          <div className="flex gap-1 mt-1">
            <select value={startH} onChange={(e) => setStartH(+e.target.value)} className="flex-1 px-2 py-2 rounded-xl border border-border bg-background text-sm">
              {Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i).map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
              ))}
            </select>
            <select value={startM} onChange={(e) => setStartM(+e.target.value)} className="flex-1 px-2 py-2 rounded-xl border border-border bg-background text-sm">
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-semibold">Duration</label>
          <select value={dur} onChange={(e) => setDur(+e.target.value)} className="w-full mt-1 px-2 py-2 rounded-xl border border-border bg-background text-sm">
            {[15, 30, 45, 60, 90, 120, 150, 180, 240].map((d) => (
              <option key={d} value={d}>{d < 60 ? `${d}m` : `${d / 60}h${d % 60 ? ` ${d % 60}m` : ''}`}</option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)…"
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!title.trim()} className="flex-1">
          <Check className="w-4 h-4 mr-1.5" />Save
        </Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

// ─── Main TimeBlocking ────────────────────────────────────────────────────────

export default function TimeBlocking() {
  const [blocks, setBlocks]           = useState<TimeBlock[]>(loadBlocks);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingBlock, setEditingBlock] = useState<Partial<TimeBlock> | null>(null);
  const [newBlockY, setNewBlockY]     = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const today = dateStr(new Date());
  const dateKey = dateStr(selectedDate);
  const dayBlocks = blocks.filter((b) => b.date === dateKey)
    .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));

  const persist = (updated: TimeBlock[]) => {
    setBlocks(updated);
    saveBlocks(updated);
  };

  const saveBlock = (block: TimeBlock) => {
    const exists = blocks.find((b) => b.id === block.id);
    persist(exists
      ? blocks.map((b) => b.id === block.id ? block : b)
      : [...blocks, block]
    );
    setEditingBlock(null);
  };

  const deleteBlock = (id: string) => persist(blocks.filter((b) => b.id !== id));

  const toggleBlock = (id: string) =>
    persist(blocks.map((b) => b.id === id ? { ...b, completed: !b.completed } : b));

  const resizeBlock = (id: string, newDuration: number) =>
    persist(blocks.map((b) => b.id === id ? { ...b, durationMinutes: newDuration } : b));

  // Click on grid to create new block
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-block]')) return;
    const rect = gridRef.current!.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const { hour, minute } = yToTime(y);
    setEditingBlock({ date: dateKey, startHour: hour, startMinute: minute, durationMinutes: 60 });
  }, [dateKey]);

  // Stats
  const totalPlanned = dayBlocks.reduce((s, b) => s + b.durationMinutes, 0);
  const totalCompleted = dayBlocks.filter((b) => b.completed).reduce((s, b) => s + b.durationMinutes, 0);
  const deepWork = dayBlocks.filter((b) => b.category === 'deep-work').reduce((s, b) => s + b.durationMinutes, 0);

  const isToday = dateKey === today;

  // Current time line position
  const now = new Date();
  const nowY = isToday ? minutesToY(now.getHours(), now.getMinutes()) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />Time Blocking
          </h2>
          <p className="text-sm text-muted-foreground">Click on the grid to add a block</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={isToday ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDate(new Date())}
            className="min-w-[100px]"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            {isToday ? 'Today' : selectedDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Planned', value: `${Math.floor(totalPlanned / 60)}h ${totalPlanned % 60}m`, color: 'text-primary' },
          { label: 'Completed', value: `${Math.floor(totalCompleted / 60)}h ${totalCompleted % 60}m`, color: 'text-green-500' },
          { label: 'Deep Work', value: `${Math.floor(deepWork / 60)}h ${deepWork % 60}m`, color: 'text-indigo-500' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editingBlock && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <BlockEditor
              block={editingBlock}
              onSave={saveBlock}
              onClose={() => setEditingBlock(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex gap-0 rounded-2xl border border-border/50 bg-card overflow-hidden">
        {/* Hour labels */}
        <div className="w-14 shrink-0 border-r border-border/40">
          <div style={{ height: HOUR_HEIGHT * TOTAL_HOURS }}>
            {Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i).map((h) => (
              <div
                key={h}
                className="flex items-start justify-end pr-2"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground/60 -mt-1.5">
                  {h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Time grid */}
        <div
          ref={gridRef}
          className="flex-1 relative cursor-cell"
          style={{ height: HOUR_HEIGHT * TOTAL_HOURS }}
          onClick={handleGridClick}
        >
          {/* Hour lines */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 border-t border-border/30"
              style={{ top: i * HOUR_HEIGHT }}
            />
          ))}

          {/* Half-hour lines */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <div
              key={`h${i}`}
              className="absolute inset-x-0 border-t border-border/10 border-dashed"
              style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          ))}

          {/* Current time line */}
          {nowY !== null && (
            <div
              className="absolute inset-x-0 pointer-events-none z-20"
              style={{ top: nowY }}
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 -ml-1" />
                <div className="flex-1 h-px bg-red-500" />
              </div>
            </div>
          )}

          {/* Blocks */}
          {dayBlocks.map((block) => (
            <div key={block.id} data-block="true">
              <BlockCard
                block={block}
                onDelete={deleteBlock}
                onToggle={toggleBlock}
                onResize={resizeBlock}
                onClick={(b) => setEditingBlock(b)}
              />
            </div>
          ))}

          {/* Empty state */}
          {dayBlocks.length === 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ top: HOUR_HEIGHT * 2 }}
            >
              <Clock className="w-10 h-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground/40">Click anywhere to add a time block</p>
            </div>
          )}
        </div>
      </div>

      {/* Add block button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setEditingBlock({ date: dateKey, startHour: 9, startMinute: 0, durationMinutes: 60 })}
      >
        <Plus className="w-4 h-4 mr-1.5" />Add Time Block
      </Button>
    </div>
  );
}
