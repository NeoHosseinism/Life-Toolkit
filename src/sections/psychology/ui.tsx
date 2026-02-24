// ─── Shared UI primitives for the Psychology module ──────────────────────────
// GuideCard: expandable science explanation with onboarding steps
// ToolShell: standard wrapper for every tool with guide + content
// ScaleInput: 0-10 slider with emoji labels

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, BookOpen, FlaskConical,
  Lightbulb, CheckCircle2, Info, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ─── GuideCard ────────────────────────────────────────────────────────────────

interface GuideCardProps {
  toolId: string;
  title: string;
  tagline: string;           // one-line description
  whatIsIt: string;          // plain explanation
  scienceBehind: string;     // research / theory
  howToUse: string[];        // numbered steps
  expectedOutcome: string;
  timeToSeeResults?: string;
  icon?: string;
  isNew?: boolean;           // show "New" badge
}

export function GuideCard({
  title, tagline, whatIsIt, scienceBehind, howToUse,
  expectedOutcome, timeToSeeResults, icon, isNew,
}: GuideCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-start hover:bg-white/5 transition-colors"
      >
        {icon && <span className="text-2xl shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{title}</span>
            {isNew && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                NEW
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{tagline}</p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 space-y-4 border-t border-indigo-500/10">
              {/* What is it */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400">چیست؟</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{whatIsIt}</p>
              </div>

              {/* Science */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">پشتوانه علمی</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{scienceBehind}</p>
              </div>

              {/* How to use */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">چطور استفاده کنم؟</span>
                </div>
                <ol className="space-y-1.5">
                  {howToUse.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Outcome */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-semibold uppercase text-green-500">نتیجه مورد انتظار</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{expectedOutcome}</p>
                </div>
                {timeToSeeResults && (
                  <div className="sm:w-40 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-semibold uppercase text-blue-500">زمان نتیجه</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{timeToSeeResults}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ToolShell ────────────────────────────────────────────────────────────────

interface ToolShellProps {
  guide: GuideCardProps;
  children: React.ReactNode;
  completedItems?: number;
  totalItems?: number;
}

export function ToolShell({ guide, children, completedItems, totalItems }: ToolShellProps) {
  return (
    <div className="space-y-4">
      <GuideCard {...guide} />
      {completedItems !== undefined && totalItems !== undefined && totalItems > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(completedItems / totalItems) * 100}%` }}
            />
          </div>
          <span>{completedItems}/{totalItems}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── ScaleInput ───────────────────────────────────────────────────────────────

interface ScaleInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  color?: string;
}

export function ScaleInput({
  label, value, onChange,
  min = 0, max = 10,
  lowLabel = 'پایین', highLabel = 'بالا',
  color = '#6366f1',
}: ScaleInputProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  color?: string;
}

export function SectionHeader({ icon, title, subtitle, color = '#6366f1' }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: color + '15' }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon, message, action, onAction,
}: {
  icon: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12 space-y-3">
      <div className="text-5xl">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && onAction && (
        <Button size="sm" onClick={onAction} variant="outline">
          <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
          {action}
        </Button>
      )}
    </div>
  );
}

// ─── EntryCard ────────────────────────────────────────────────────────────────

export function EntryCard({
  title, date, children, onDelete, accentColor = '#6366f1',
}: {
  title: string;
  date: string;
  children?: React.ReactNode;
  onDelete?: () => void;
  accentColor?: string;
}) {
  return (
    <Card className="border-border/50 overflow-hidden">
      <div className="h-0.5 w-full" style={{ backgroundColor: accentColor }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-[10px] text-muted-foreground">{date}</p>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0 p-1"
            >
              ×
            </button>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
