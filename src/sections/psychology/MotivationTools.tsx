import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolShell, SectionHeader, EmptyState, EntryCard, ScaleInput } from './ui';
import type { SDTNeedAssessment, ImplementationIntention, EnergyTask, PsychologyState } from './types';

// ─── SDT Assessment ───────────────────────────────────────────────────────────
function SDTTool({ assessments, onSave }: { assessments: SDTNeedAssessment[]; onSave: (a: SDTNeedAssessment) => void }) {
  const [autonomy, setA] = useState(5);
  const [competence, setC] = useState(5);
  const [relatedness, setR] = useState(5);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const weakest = autonomy <= competence && autonomy <= relatedness ? 'autonomy' : competence <= relatedness ? 'competence' : 'relatedness';
  const NEED_INFO = {
    autonomy:    { label: 'خودمختاری', emoji: '🦋', color: '#6366f1', tip: 'بیشتر انتخاب کن — از سر "می‌خوام" نه "باید"' },
    competence:  { label: 'شایستگی',   emoji: '💪', color: '#10b981', tip: 'یک مهارت کوچک تمرین کن؛ پیشرفت تدریجی اعتماد می‌سازد' },
    relatedness: { label: 'ارتباط',    emoji: '❤️', color: '#ec4899', tip: 'با یک نفر که برات مهمه تماس بگیر' },
  };
  const last7 = assessments.slice(-7);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {(['autonomy','competence','relatedness'] as const).map(n => {
          const info = NEED_INFO[n];
          const val = n==='autonomy'?autonomy:n==='competence'?competence:relatedness;
          return (
            <div key={n} className="text-center p-3 rounded-2xl border border-border/50 bg-card">
              <div className="text-2xl mb-1">{info.emoji}</div>
              <div className="text-2xl font-black" style={{ color: info.color }}>{val}</div>
              <div className="text-[10px] text-muted-foreground">{info.label}</div>
              {weakest === n && <div className="text-[9px] mt-1 text-amber-500 font-medium">⚠️ نیاز به توجه</div>}
            </div>
          );
        })}
      </div>
      <ScaleInput label="🦋 خودمختاری" value={autonomy} onChange={setA} color="#6366f1" lowLabel="تحمیلی" highLabel="آزاد" />
      <ScaleInput label="💪 شایستگی" value={competence} onChange={setC} color="#10b981" lowLabel="بی‌کفایت" highLabel="ماهر" />
      <ScaleInput label="❤️ ارتباط" value={relatedness} onChange={setR} color="#ec4899" lowLabel="تنها" highLabel="متصل" />
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700">
        💡 {NEED_INFO[weakest].tip}
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="یادداشت…" rows={2}
        className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      <Button onClick={() => { onSave({ id: uuidv4(), date: new Date().toISOString().split('T')[0], autonomy, competence, relatedness, notes }); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />{saved ? '✅ ذخیره شد!' : 'ذخیره ارزیابی'}
      </Button>
      {last7.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-semibold">روند ۷ روز اخیر</p>
          {(['autonomy','competence','relatedness'] as const).map(n => {
            const info = NEED_INFO[n]; const vals = last7.map(a => a[n]);
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="text-sm w-4">{info.emoji}</span>
                <div className="flex-1 flex items-end gap-0.5 h-8">
                  {vals.map((v,i) => <div key={i} className="flex-1 rounded-t-sm" style={{ height:`${v*10}%`, backgroundColor: info.color+'80' }} />)}
                </div>
                <span className="text-xs text-muted-foreground w-4">{vals.at(-1)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Implementation Intentions ────────────────────────────────────────────────
function IntentionForm({ onSave }: { onSave: (i: ImplementationIntention) => void }) {
  const [goal, setGoal] = useState('');
  const [when, setWhen] = useState('');
  const [then, setThen] = useState('');
  const [loc, setLoc]   = useState('');
  const EXAMPLES = [
    { when: 'ساعت ۷ صبح شد و کنار قهوه‌ام نشستم', then: 'کتابم را باز می‌کنم و ۱۵ دقیقه می‌خوانم' },
    { when: 'از سر کار برگشتم و کیفم را زمین گذاشتم', then: 'لباس ورزشی می‌پوشم' },
    { when: 'احساس اضطراب کردم', then: 'سه نفس عمیق می‌کشم' },
  ];
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground">هدف کلی</label>
        <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="مثلاً: هر روز مطالعه کنم"
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/10 space-y-2">
        <p className="text-xs font-semibold text-indigo-500">فرمول: «وقتی [شرط]، [عمل] می‌کنم»</p>
        <div>
          <label className="text-xs text-muted-foreground">وقتی…</label>
          <input value={when} onChange={e => setWhen(e.target.value)} placeholder="یک موقعیت، زمان یا رویداد خاص"
            className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">…این کار را می‌کنم:</label>
          <input value={then} onChange={e => setThen(e.target.value)} placeholder="یک رفتار خاص و مشخص"
            className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">مثال‌های الهام‌بخش</p>
        {EXAMPLES.map((ex,i) => (
          <button key={i} onClick={() => { setWhen(ex.when); setThen(ex.then); }}
            className="w-full text-start p-2.5 rounded-xl border border-dashed border-border hover:border-primary/40 text-xs text-muted-foreground hover:text-foreground transition-all">
            🔷 وقتی «{ex.when}»، «{ex.then}»
          </button>
        ))}
      </div>
      <Button onClick={() => { onSave({ id: uuidv4(), goalDescription: goal, whenCondition: when, thenAction: then, location: loc, active: true, successCount: 0, createdAt: new Date().toISOString() }); setGoal(''); setWhen(''); setThen(''); setLoc(''); }}
        disabled={!when || !then} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ذخیره تعهد اجرایی
      </Button>
    </div>
  );
}

// ─── Energy Matrix ────────────────────────────────────────────────────────────
const QUADRANT_META = {
  'high-high': { label: 'زمان طلایی', desc: 'عمیق‌ترین کارهایت', color: '#6366f1', emoji: '🌟' },
  'high-low':  { label: 'وظیفه',      desc: 'انجام بده، تمام کن', color: '#f59e0b', emoji: '⚡' },
  'low-high':  { label: 'تفریح مفید', desc: 'بعد از ناهار',       color: '#10b981', emoji: '☕' },
  'low-low':   { label: 'تله انرژی',  desc: 'به حداقل برسان',     color: '#94a3b8', emoji: '🗑️' },
};

function EnergyMatrix({ tasks, onAdd, onToggle }: { tasks: EnergyTask[]; onAdd: (t: EnergyTask) => void; onToggle: (id: string) => void }) {
  const [title, setTitle] = useState('');
  const [energy, setEnergy] = useState<'high'|'low'>('high');
  const [interest, setInt]  = useState<'high'|'low'>('high');
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const quadrants = {
    'high-high': todayTasks.filter(t => t.energyRequired==='high' && t.interestLevel==='high'),
    'high-low':  todayTasks.filter(t => t.energyRequired==='high' && t.interestLevel==='low'),
    'low-high':  todayTasks.filter(t => t.energyRequired==='low'  && t.interestLevel==='high'),
    'low-low':   todayTasks.filter(t => t.energyRequired==='low'  && t.interestLevel==='low'),
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="نام کار…"
          className="flex-1 min-w-[120px] px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <select value={energy} onChange={e => setEnergy(e.target.value as 'high'|'low')} className="px-2 py-2 rounded-xl border border-border bg-card text-sm">
          <option value="high">انرژی زیاد</option><option value="low">انرژی کم</option>
        </select>
        <select value={interest} onChange={e => setInt(e.target.value as 'high'|'low')} className="px-2 py-2 rounded-xl border border-border bg-card text-sm">
          <option value="high">علاقه زیاد</option><option value="low">علاقه کم</option>
        </select>
        <Button onClick={() => { if (!title.trim()) return; onAdd({ id: uuidv4(), title, energyRequired: energy, interestLevel: interest, completed: false, date: today, createdAt: new Date().toISOString() }); setTitle(''); }} size="icon"><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(quadrants) as (keyof typeof quadrants)[]).map(key => {
          const meta = QUADRANT_META[key]; const items = quadrants[key];
          return (
            <div key={key} className="rounded-2xl border p-3 space-y-2" style={{ borderColor: meta.color+'40', backgroundColor: meta.color+'08' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: meta.color }}>{meta.emoji} {meta.label}</p>
                <p className="text-[10px] text-muted-foreground">{meta.desc}</p>
              </div>
              {items.length===0 ? <p className="text-[10px] text-muted-foreground italic">خالی</p> : (
                <div className="space-y-1">
                  {items.map(task => (
                    <div key={task.id} onClick={() => onToggle(task.id)}
                      className={`flex items-center gap-2 text-xs p-1.5 rounded-lg cursor-pointer transition-all ${task.completed?'opacity-50 line-through':'hover:bg-white/5'}`}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: task.completed?meta.color:'transparent', borderColor: meta.color }}>
                        {task.completed && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {task.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">بهترین زمان برای 🌟: معمولاً ۲-۳ ساعت بعد از بیدار شدن</p>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function MotivationTools({ state, onUpdate }: { state: PsychologyState; onUpdate: (fn: (p: PsychologyState) => PsychologyState) => void }) {
  const [showII, setShowII] = useState(false);
  return (
    <div className="space-y-8">
      <SectionHeader icon="🚀" title="انگیزه‌شناسی" subtitle="انگیزه‌ات را بفهم و با طراحی، نه اراده، عمل کن" color="#f59e0b" />
      <Tabs defaultValue="sdt">
        <TabsList className="flex-wrap h-auto p-1 gap-1 mb-4">
          <TabsTrigger value="sdt" className="text-xs sm:text-sm">🧬 نیازهای بنیادین</TabsTrigger>
          <TabsTrigger value="intentions" className="text-xs sm:text-sm">🎯 تعهد اجرایی</TabsTrigger>
          <TabsTrigger value="energy" className="text-xs sm:text-sm">⚡ ماتریس انرژی</TabsTrigger>
        </TabsList>
        <TabsContent value="sdt">
          <ToolShell guide={{ toolId:'sdt', icon:'🧬', title:'نیازهای روانشناختی بنیادین (SDT)', tagline:'چرا بعضی وقت‌ها بی‌انگیزه‌ای؟ جواب اینجاست', whatIsIt:'نظریه خودتعیینی (Deci & Ryan) می‌گوید انسان سه نیاز روانشناختی بنیادین دارد: خودمختاری (احساس انتخاب)، شایستگی (احساس مؤثر بودن)، و ارتباط (احساس تعلق). وقتی یکی از اینها کم باشد، انگیزه‌ات سقوط می‌کند.', scienceBehind:'بیش از ۱۰۰۰ مطالعه در ۳۰ سال گذشته SDT را تأیید کرده. تیم‌هایی که نیازهای SDT پوشش داده می‌شود ۵۵٪ بازدهی بیشتر دارند.', howToUse:['هر روز یا هر هفته سه نیاز را از ۰ تا ۱۰ ارزیابی کن','کمترین نمره را پیدا کن — آنجا مشکل است','پیشنهاد ارائه‌شده را اجرا کن','روند را در طول زمان دنبال کن'], expectedOutcome:'شناسایی دقیق منبع بی‌انگیزگی و راه‌حل هدفمند', timeToSeeResults:'۱-۲ هفته' }}>
            <SDTTool assessments={state.sdtAssessments} onSave={a => onUpdate(p => ({ ...p, sdtAssessments: [...p.sdtAssessments, a] }))} />
          </ToolShell>
        </TabsContent>
        <TabsContent value="intentions">
          <ToolShell guide={{ toolId:'intentions', icon:'🎯', title:'تعهدات اجرایی (Implementation Intentions)', tagline:'از «می‌خوام» به «دقیقاً کِی و کجا» برو', whatIsIt:'تعهد اجرایی یعنی از قبل مشخص کنی که «وقتی X اتفاق افتاد، Y می‌کنم». این برنامه‌ریزی «اگر-پس» ذهن را برای عمل خودکار آماده می‌کند.', scienceBehind:'Peter Gollwitzer نشان داد تعهدات اجرایی نرخ تحقق اهداف را ۲ تا ۳ برابر افزایش می‌دهد.', howToUse:['یک هدف که شکست خورده را انتخاب کن','یک موقعیت خاص که طبیعتاً رخ می‌دهد انتخاب کن','رفتار دقیقی که انجام می‌دهی بنویس','مثال‌های آماده را ببین'], expectedOutcome:'عمل خودکار بدون نیاز به اراده', timeToSeeResults:'از همان هفته اول' }}>
            {!showII ? (
              <div className="space-y-3">
                <Button onClick={() => setShowII(true)} className="w-full"><Plus className="w-4 h-4 mr-1.5" />تعهد اجرایی جدید</Button>
                {state.implementationIntentions.length === 0 ? <EmptyState icon="🎯" message="هنوز هیچ تعهد اجرایی ثبت نشده." onAction={() => setShowII(true)} action="شروع کن" /> : (
                  <div className="space-y-2">{state.implementationIntentions.map(ii => (
                    <EntryCard key={ii.id} title={ii.goalDescription} date={ii.createdAt.split('T')[0]} accentColor="#6366f1">
                      <p className="text-xs text-muted-foreground mt-1">🔷 وقتی «{ii.whenCondition}»، «{ii.thenAction}»</p>
                      {ii.successCount > 0 && <p className="text-xs text-green-500 mt-1">✅ {ii.successCount} بار موفق</p>}
                    </EntryCard>
                  ))}</div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setShowII(false)}>← برگشت</Button>
                <IntentionForm onSave={ii => { onUpdate(p => ({ ...p, implementationIntentions: [...p.implementationIntentions, ii] })); setShowII(false); }} />
              </div>
            )}
          </ToolShell>
        </TabsContent>
        <TabsContent value="energy">
          <ToolShell guide={{ toolId:'energy-matrix', icon:'⚡', title:'ماتریس انرژی × علاقه', tagline:'کار درست، در زمان درست، با انرژی درست', whatIsIt:'به جای اینکه بر اساس اهمیت برنامه بریزی، بر اساس انرژی‌ات برنامه بریز. هر کار دو بُعد دارد: انرژی نیاز و علاقه.', scienceBehind:'تحقیقات Yerkes-Dodson نشان می‌دهد عملکرد بهینه در «ناحیه ایده‌آل» برانگیختگی است. تطبیق کار با انرژی بازدهی را تا ۴۰٪ بالا می‌برد.', howToUse:['هر کار را به ماتریس اضافه کن','کارهای "زمان طلایی" را در peak energy صبح انجام بده','کارهای "تفریح مفید" را بعد از ناهار بگذار','"تله انرژی" را به حداقل برسان'], expectedOutcome:'بازدهی بیشتر با خستگی کمتر', timeToSeeResults:'از همان روز اول' }}>
            <EnergyMatrix tasks={state.energyTasks}
              onAdd={t => onUpdate(p => ({ ...p, energyTasks: [...p.energyTasks, t] }))}
              onToggle={id => onUpdate(p => ({ ...p, energyTasks: p.energyTasks.map(t => t.id===id?{...t,completed:!t.completed}:t) }))} />
          </ToolShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
