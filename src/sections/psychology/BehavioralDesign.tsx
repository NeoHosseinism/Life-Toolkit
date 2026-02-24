import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolShell, SectionHeader, EmptyState, EntryCard } from './ui';
import type { HabitStack, TemptationBundle, EnvironmentDesign, PreCommitment, PsychologyState } from './types';

// ─── Habit Stacking ───────────────────────────────────────────────────────────
function HabitStackTool({ stacks, onAdd, onToggle }: { stacks: HabitStack[]; onAdd: (s: HabitStack) => void; onToggle: (id: string) => void }) {
  const [anchor, setAnchor] = useState('');
  const [newHabit, setNew]  = useState('');
  const [reward, setReward] = useState('');
  const EXAMPLES = [
    { anchor: 'بعد از ریختن قهوه‌ام', newHabit: '۵ دقیقه مدیتیشن می‌کنم' },
    { anchor: 'قبل از خوابیدن', newHabit: '۳ چیز ممنون هستم را می‌نویسم' },
    { anchor: 'وقتی کامپیوترم روشن می‌شود', newHabit: 'یک لیوان آب می‌خورم' },
  ];
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary">
        📐 فرمول: بعد از [عادت فعلی]، [عادت جدید] می‌کنم
      </div>
      <div className="space-y-2">
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => { setAnchor(ex.anchor); setNew(ex.newHabit); }}
            className="w-full text-start p-2.5 rounded-xl border border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground transition-all">
            ➕ «{ex.anchor}» → «{ex.newHabit}»
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">عادت لنگر (قبلی)</label>
        <input value={anchor} onChange={e => setAnchor(e.target.value)} placeholder="عادتی که الان داری…"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">عادت جدید (بعدی)</label>
        <input value={newHabit} onChange={e => setNew(e.target.value)} placeholder="عادت جدیدی که می‌خوای اضافه کنی…"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">پاداش (اختیاری)</label>
        <input value={reward} onChange={e => setReward(e.target.value)} placeholder="چه احساسی بعدش خواهی داشت؟"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <Button onClick={() => { if(!anchor||!newHabit) return; onAdd({ id: uuidv4(), anchor, newHabit, reward, active: true, successRate: 0, createdAt: new Date().toISOString() }); setAnchor(''); setNew(''); setReward(''); }} className="w-full" disabled={!anchor||!newHabit}>
        <Plus className="w-4 h-4 mr-1.5" />اضافه کردن زنجیره
      </Button>
      {stacks.length > 0 && (
        <div className="space-y-2">
          {stacks.map(s => (
            <div key={s.id} onClick={() => onToggle(s.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${s.active ? 'border-primary/20 bg-primary/5' : 'border-border/30 opacity-50'}`}>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${s.active ? 'border-primary bg-primary' : 'border-border'}`}>
                {s.active && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="text-muted-foreground">بعد از </span>
                <span className="font-medium">«{s.anchor}»</span>
                <span className="text-muted-foreground"> → </span>
                <span className="font-medium text-primary">«{s.newHabit}»</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Temptation Bundling ──────────────────────────────────────────────────────
function TemptationTool({ bundles, onAdd }: { bundles: TemptationBundle[]; onAdd: (b: TemptationBundle) => void }) {
  const [task, setTask]   = useState('');
  const [pleasure, setP]  = useState('');
  const EXAMPLES = [
    { task: 'دویدن روی تردمیل', pleasure: 'گوش دادن به پادکست محبوبم' },
    { task: 'پاسخ دادن به ایمیل‌های کاری', pleasure: 'خوردن قهوه محبوبم' },
    { task: 'آمار و ارقام خسته‌کننده', pleasure: 'گوش دادن به موسیقی' },
  ];
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700">
        🎁 فقط وقتی [کار ناخوشایند] می‌کنی، [لذت] را مجاز بدانی
      </div>
      <div className="space-y-2">
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => { setTask(ex.task); setP(ex.pleasure); }}
            className="w-full text-start p-2.5 rounded-xl border border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground transition-all">
            🔗 «{ex.task}» + «{ex.pleasure}»
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">کار سخت یا ناخوشایند</label>
        <input value={task} onChange={e => setTask(e.target.value)} placeholder="مثلاً: ورزش کردن"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">لذتی که فقط در حین آن کار مجاز است</label>
        <input value={pleasure} onChange={e => setP(e.target.value)} placeholder="مثلاً: گوش دادن به سریال"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <Button onClick={() => { if(!task||!pleasure) return; onAdd({ id: uuidv4(), task, pleasure, active: true, createdAt: new Date().toISOString() }); setTask(''); setP(''); }} disabled={!task||!pleasure} className="w-full">
        <Plus className="w-4 h-4 mr-1.5" />ایجاد بسته وسوسه‌انداز
      </Button>
      {bundles.length > 0 && (
        <div className="space-y-2">
          {bundles.map(b => (
            <EntryCard key={b.id} title={`${b.task} + ${b.pleasure}`} date={b.createdAt.split('T')[0]} accentColor="#10b981">
              <p className="text-xs text-muted-foreground mt-1">🔗 فقط وقتی «{b.task}»، «{b.pleasure}» مجاز است</p>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pre-Commitment ───────────────────────────────────────────────────────────
function PreCommitTool({ commitments, onAdd, onUpdate }: { commitments: PreCommitment[]; onAdd: (c: PreCommitment) => void; onUpdate: (id: string, status: PreCommitment['status']) => void }) {
  const [goal, setGoal]         = useState('');
  const [commitment, setComm]   = useState('');
  const [consequence, setCons]  = useState('');
  const [deadline, setDeadline] = useState('');
  const [witness, setWitness]   = useState('');

  const STATUS_META = {
    active:  { label: 'فعال',      color: 'text-primary',   bg: 'bg-primary/10' },
    kept:    { label: 'انجام شد',  color: 'text-green-500', bg: 'bg-green-500/10' },
    broken:  { label: 'نقض شد',   color: 'text-red-500',   bg: 'bg-red-500/10' },
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700">
        ⚓ پیش‌تعهد (Ulysses Contract): از قبل خودت را محدود کن تا آینده‌ات آسان‌تر باشد
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">هدف</label>
        <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="مثلاً: این هفته ورزش کنم"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">تعهد مشخص</label>
        <input value={commitment} onChange={e => setComm(e.target.value)} placeholder="دقیقاً چه چیزی انجام می‌دهم؟"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">پیامد شکست (واقعی باشد)</label>
        <input value={consequence} onChange={e => setCons(e.target.value)} placeholder="مثلاً: ۱۰۰ هزار تومان به خیریه می‌دهم"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">مهلت</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">شاهد (اختیاری)</label>
          <input value={witness} onChange={e => setWitness(e.target.value)} placeholder="نام شاهد"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
        </div>
      </div>
      <Button onClick={() => { if(!goal||!commitment||!consequence||!deadline) return; onAdd({ id: uuidv4(), goal, commitment, consequence, deadline, witnessName: witness, status: 'active', createdAt: new Date().toISOString() }); setGoal(''); setComm(''); setCons(''); setDeadline(''); setWitness(''); }} disabled={!goal||!commitment||!consequence||!deadline} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ثبت پیش‌تعهد
      </Button>
      {commitments.length > 0 && (
        <div className="space-y-2">
          {commitments.map(c => {
            const meta = STATUS_META[c.status];
            return (
              <Card key={c.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{c.goal}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">📅 {c.deadline} {c.witnessName && `· 👁️ ${c.witnessName}`}</p>
                      <p className="text-xs mt-1">🎯 {c.commitment}</p>
                      <p className="text-xs text-red-500">⚡ {c.consequence}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  </div>
                  {c.status === 'active' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 h-7 text-xs bg-green-500 hover:bg-green-600" onClick={() => onUpdate(c.id, 'kept')}>✅ انجام دادم</Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs border-red-500/30 text-red-500" onClick={() => onUpdate(c.id, 'broken')}>❌ نکردم</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function BehavioralDesign({ state, onUpdate }: { state: PsychologyState; onUpdate: (fn: (p: PsychologyState) => PsychologyState) => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon="🏗️" title="طراحی رفتار" subtitle="محیط، عادات و ساختار را طراحی کن نه اراده" color="#10b981" />
      <Tabs defaultValue="stacks">
        <TabsList className="flex-wrap h-auto p-1 gap-1 mb-4">
          <TabsTrigger value="stacks" className="text-xs sm:text-sm">🔗 زنجیره عادت</TabsTrigger>
          <TabsTrigger value="bundles" className="text-xs sm:text-sm">🎁 بسته‌سازی</TabsTrigger>
          <TabsTrigger value="commit" className="text-xs sm:text-sm">⚓ پیش‌تعهد</TabsTrigger>
        </TabsList>
        <TabsContent value="stacks">
          <ToolShell guide={{ toolId:'habit-stacks', icon:'🔗', title:'زنجیره‌سازی عادات (Habit Stacking)', tagline:'عادت جدید را به عادت قدیمی وصل کن', whatIsIt:'زنجیره‌سازی عادات یعنی یک رفتار جدید را دقیقاً بعد از یک رفتار موجود قرار دهی تا از مکانیزم ذهنی آن بهره‌مند شوی.', scienceBehind:'James Clear در کتاب Atomic Habits این روش را توضیح داده. نشانه‌های محیطی ۴۵٪ رفتار روزانه را کنترل می‌کنند. وقتی از نشانه موجود استفاده می‌کنی، ریسک فراموشی تقریباً صفر می‌شود.', howToUse:['یک عادت که هر روز داری انتخاب کن','یک عادت جدید کوچک (۲-۵ دقیقه) پیدا کن','بنویس: "بعد از [قدیمی]، [جدید] می‌کنم"','اولین هفته فقط یک زنجیره امتحان کن'], expectedOutcome:'شکل‌گیری عادات جدید بدون نیاز به اراده', timeToSeeResults:'۲-۳ هفته' }}>
            <HabitStackTool stacks={state.habitStacks}
              onAdd={s => onUpdate(p => ({ ...p, habitStacks: [...p.habitStacks, s] }))}
              onToggle={id => onUpdate(p => ({ ...p, habitStacks: p.habitStacks.map(s => s.id===id?{...s,active:!s.active}:s) }))} />
          </ToolShell>
        </TabsContent>
        <TabsContent value="bundles">
          <ToolShell guide={{ toolId:'temptation', icon:'🎁', title:'بسته‌سازی وسوسه (Temptation Bundling)', tagline:'کار سخت را با لذت جفت کن', whatIsIt:'بسته‌سازی وسوسه یعنی یک فعالیت لذتبخش را فقط اجازه داری همزمان با یک کار سخت انجام دهی. این یک پاداش فوری و قوی ایجاد می‌کند.', scienceBehind:'Katherine Milkman در پنسیلوانیا نشان داد این روش حضور در باشگاه ورزشی را ۵۱٪ افزایش داد.', howToUse:['یک کار که به تعویق می‌اندازی انتخاب کن','یک لذتی که دوستش داری پیدا کن','قانون بگذار: فقط حین آن کار، آن لذت مجاز است','این قانون را جدی بگیر'], expectedOutcome:'اشتیاق برای کارهایی که قبلاً از آن‌ها فرار می‌کردی', timeToSeeResults:'از همان هفته اول' }}>
            <TemptationTool bundles={state.temptationBundles}
              onAdd={b => onUpdate(p => ({ ...p, temptationBundles: [...p.temptationBundles, b] }))} />
          </ToolShell>
        </TabsContent>
        <TabsContent value="commit">
          <ToolShell guide={{ toolId:'precommit', icon:'⚓', title:'پیش‌تعهد (Ulysses Contract)', tagline:'آینده‌ات را از دست خودت محافظت کن', whatIsIt:'اولیس (Ulysses) در اسطوره یونانی دستور داد او را به دکل بچسبانند تا از صدای سیرن‌ها مقاومت کند. پیش‌تعهد یعنی از قبل محدودیتی بگذاری که آینده‌ات از وسوسه محافظت شود.', scienceBehind:'تحقیقات رفتاری نشان می‌دهد وقتی پیامد شکست واقعی باشد (نه فقط احساس شکست)، نرخ پایبندی ۲۸٪ بالاتر است.', howToUse:['هدفی که بارها شکست خوردی را انتخاب کن','یک تعهد مشخص و قابل تأیید بنویس','یک پیامد واقعی (مالی یا اجتماعی) تعریف کن','در صورت امکان یک شاهد معرفی کن'], expectedOutcome:'قدرت مقاومت در برابر وسوسه‌های لحظه‌ای', timeToSeeResults:'از همان روز اول' }}>
            <PreCommitTool commitments={state.preCommitments}
              onAdd={c => onUpdate(p => ({ ...p, preCommitments: [...p.preCommitments, c] }))}
              onUpdate={(id, status) => onUpdate(p => ({ ...p, preCommitments: p.preCommitments.map(c => c.id===id?{...c,status}:c) }))} />
          </ToolShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
