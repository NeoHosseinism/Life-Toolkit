import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolShell, SectionHeader, EmptyState, EntryCard, ScaleInput } from './ui';
import type { EmotionEntry, EmotionFamily, PsychologyState } from './types';

// ─── Plutchik Emotion Wheel data ──────────────────────────────────────────────

const EMOTION_FAMILIES: Record<EmotionFamily, { emoji: string; color: string; specific: string[] }> = {
  joy:          { emoji: '😊', color: '#f59e0b', specific: ['شادی','سرخوشی','آرامش','رضایت','قدردانی','شور','سرزندگی','عشق','غرور'] },
  trust:        { emoji: '🤝', color: '#10b981', specific: ['اعتماد','پذیرش','تأیید','تحسین','احترام','محبت'] },
  fear:         { emoji: '😰', color: '#3b82f6', specific: ['ترس','اضطراب','نگرانی','وحشت','تردید','ناامنی'] },
  surprise:     { emoji: '😲', color: '#8b5cf6', specific: ['تعجب','حیرت','سردرگمی','شگفتی'] },
  sadness:      { emoji: '😢', color: '#6366f1', specific: ['غم','ناامیدی','تنهایی','افسردگی','دلتنگی','بی‌تفاوتی','پشیمانی'] },
  disgust:      { emoji: '🤢', color: '#64748b', specific: ['انزجار','نفرت','تحقیر','بیزاری'] },
  anger:        { emoji: '😠', color: '#ef4444', specific: ['عصبانیت','خشم','کینه','ناامیدی','رنجش','حسادت'] },
  anticipation: { emoji: '🤩', color: '#f97316', specific: ['انتظار','هیجان','امید','کنجکاوی','آمادگی'] },
};

const REGULATION_TECHNIQUES = [
  { name: 'تنفس جعبه‌ای', bestFor: ['fear','anger'], time: 3, steps: ['۴ ثانیه نفس بکش','۴ ثانیه نگه‌دار','۴ ثانیه بیرون بده','۴ ثانیه صبر کن','تکرار کن'] },
  { name: 'بدن‌آگاهی ۵-۴-۳-۲-۱', bestFor: ['fear','anger','sadness'], time: 5, steps: ['۵ چیزی که می‌بینی','۴ چیزی که لمس می‌کنی','۳ صدا که می‌شنوی','۲ چیزی که بو می‌کنی','۱ طعمی که حس می‌کنی'] },
  { name: 'نوشتن اکسپرسیو', bestFor: ['sadness','anger','disgust'], time: 15, steps: ['یک کاغذ بردار','هر چه در ذهن داری بنویس','هیچ قانونی نیست، هیچ‌کس نمی‌خواند','۱۵ دقیقه بنویس'] },
  { name: 'حرکت سریع', bestFor: ['anger','sadness'], time: 10, steps: ['از جا بلند شو','۱۰ دقیقه پیاده‌روی کن','یا ۵ دقیقه بدو','یا ۲۰ تا اسکات'] },
  { name: 'خودگفتاری آرامش‌بخش', bestFor: ['fear','sadness'], time: 3, steps: ['دستت را روی قلبت بگذار','بگو: این احساس موقتی است','بگو: من از پس این برمی‌آیم','نفس عمیق بکش'] },
];

// ─── Emotion Entry Form ───────────────────────────────────────────────────────

function EmotionForm({ onSave }: { onSave: (e: EmotionEntry) => void }) {
  const [family, setFamily] = useState<EmotionFamily>('joy');
  const [specific, setSpecific] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [trigger, setTrigger] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');

  const familyData = EMOTION_FAMILIES[family];
  const now = new Date();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">خانواده احساس</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(EMOTION_FAMILIES) as EmotionFamily[]).map(f => {
            const fd = EMOTION_FAMILIES[f];
            return (
              <button key={f} onClick={() => { setFamily(f); setSpecific(''); }}
                className="p-2 rounded-xl border text-center transition-all text-xs"
                style={{ borderColor: family===f?fd.color:'', backgroundColor: family===f?fd.color+'15':'' }}>
                <span className="text-xl block">{fd.emoji}</span>
                <span className="block mt-0.5" style={{ color: family===f?fd.color:'' }}>{f === 'joy' ? 'شادی' : f === 'trust' ? 'اعتماد' : f === 'fear' ? 'ترس' : f === 'surprise' ? 'تعجب' : f === 'sadness' ? 'غم' : f === 'disgust' ? 'انزجار' : f === 'anger' ? 'خشم' : 'انتظار'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">احساس دقیق‌تر</p>
        <div className="flex flex-wrap gap-2">
          {familyData.specific.map(s => (
            <button key={s} onClick={() => setSpecific(s)}
              className="px-3 py-1.5 rounded-xl text-xs border transition-all"
              style={{ borderColor: specific===s?familyData.color:'', backgroundColor: specific===s?familyData.color+'15':'' }}>
              {s}
            </button>
          ))}
        </div>
        <input value={specific} onChange={e => setSpecific(e.target.value)} placeholder="یا خودت بنویس…"
          className="w-full mt-2 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <ScaleInput label="شدت" value={intensity} onChange={setIntensity}
        color={familyData.color} lowLabel="خفیف" highLabel="شدید" />

      <div>
        <label className="text-xs font-semibold text-muted-foreground">محرک (چه اتفاقی افتاد؟)</label>
        <input value={trigger} onChange={e => setTrigger(e.target.value)}
          placeholder="موقعیت، رویداد یا فکری که این احساس را ایجاد کرد"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground">این احساس را کجای بدنت حس می‌کنی؟</label>
        <input value={body} onChange={e => setBody(e.target.value)}
          placeholder="مثلاً: فشار در سینه، گرفتگی گلو، سنگینی شانه‌ها"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <Button onClick={() => {
        onSave({ id: uuidv4(), date: now.toISOString().split('T')[0], time: now.toTimeString().slice(0,5),
          primaryEmotion: family, specificEmotion: specific || familyData.specific[0],
          intensity, trigger, bodyLocation: body, notes, });
        setSpecific(''); setIntensity(50); setTrigger(''); setBody(''); setNotes('');
      }} disabled={!specific} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ثبت احساس
      </Button>
    </div>
  );
}

// ─── Regulation Tool ──────────────────────────────────────────────────────────

function RegulationTool({ currentEmotion }: { currentEmotion?: EmotionFamily }) {
  const [selected, setSelected] = useState<typeof REGULATION_TECHNIQUES[0] | null>(null);
  const [step, setStep] = useState(0);

  const relevant = currentEmotion
    ? REGULATION_TECHNIQUES.filter(t => t.bestFor.includes(currentEmotion))
    : REGULATION_TECHNIQUES;

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => { setSelected(null); setStep(0); }}>← برگشت</Button>
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-lg">{selected.name}</h3>
            <p className="text-xs text-muted-foreground">⏱ {selected.time} دقیقه</p>
            <div className="space-y-3">
              {selected.steps.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${step === i ? 'bg-primary/10 border border-primary/20' : 'opacity-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step === i ? 'bg-primary text-white' : 'bg-muted'}`}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  <p className="text-sm">{s}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && <Button variant="outline" onClick={() => setStep(s => s-1)}>قبلی</Button>}
              {step < selected.steps.length - 1
                ? <Button onClick={() => setStep(s => s+1)} className="flex-1">بعدی</Button>
                : <Button onClick={() => { setSelected(null); setStep(0); }} className="flex-1 bg-green-500 hover:bg-green-600">✅ تمام شد!</Button>
              }
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">یک تکنیک را انتخاب کن:</p>
      {relevant.map(tech => (
        <button key={tech.name} onClick={() => { setSelected(tech); setStep(0); }}
          className="w-full p-4 rounded-2xl border border-border hover:border-primary/40 bg-card text-start transition-all group">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{tech.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">⏱ {tech.time} دقیقه · {tech.steps.length} مرحله</p>
            </div>
            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">←</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Trigger Pattern Analysis ─────────────────────────────────────────────────

function TriggerAnalysis({ entries }: { entries: EmotionEntry[] }) {
  if (entries.length < 3) {
    return <div className="text-center py-8 text-muted-foreground text-sm">حداقل ۳ احساس ثبت کن تا الگوها نمایش داده شوند.</div>;
  }

  const triggerMap: Record<string, number> = {};
  entries.forEach(e => {
    if (e.trigger) {
      const words = e.trigger.split(/\s+/).slice(0, 3).join(' ');
      triggerMap[words] = (triggerMap[words] ?? 0) + 1;
    }
  });

  const topTriggers = Object.entries(triggerMap).sort((a,b) => b[1]-a[1]).slice(0, 5);
  const emotionFreq: Partial<Record<EmotionFamily, number>> = {};
  entries.forEach(e => { emotionFreq[e.primaryEmotion] = (emotionFreq[e.primaryEmotion] ?? 0) + 1; });
  const topEmotion = Object.entries(emotionFreq).sort((a,b) => b[1]-a[1])[0];
  const avgIntensity = entries.reduce((s,e) => s + e.intensity, 0) / entries.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50"><CardContent className="p-3 text-center">
          <p className="text-xl font-bold text-primary">{entries.length}</p>
          <p className="text-[10px] text-muted-foreground">ثبت احساس</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3 text-center">
          <p className="text-xl">{topEmotion ? EMOTION_FAMILIES[topEmotion[0] as EmotionFamily]?.emoji : '—'}</p>
          <p className="text-[10px] text-muted-foreground">رایج‌ترین</p>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-3 text-center">
          <p className="text-xl font-bold">{avgIntensity.toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground">میانگین شدت</p>
        </CardContent></Card>
      </div>
      {topTriggers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">محرک‌های مکرر</p>
          {topTriggers.map(([trigger, count]) => (
            <div key={trigger} className="flex items-center gap-2 text-sm">
              <div className="flex-1 truncate">{trigger}</div>
              <span className="text-xs text-muted-foreground shrink-0">{count}×</span>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(count/entries.length)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function EmotionalIntelligence({ state, onUpdate }: { state: PsychologyState; onUpdate: (fn: (p: PsychologyState) => PsychologyState) => void }) {
  const [showForm, setShowForm] = useState(false);
  const lastEmotion = state.emotionEntries.at(-1)?.primaryEmotion;

  return (
    <div className="space-y-8">
      <SectionHeader icon="❤️" title="هوش هیجانی" subtitle="احساساتت را بشناس، نه اینکه سرکوب کنی" color="#ec4899" />
      <Tabs defaultValue="track">
        <TabsList className="flex-wrap h-auto p-1 gap-1 mb-4">
          <TabsTrigger value="track" className="text-xs sm:text-sm">🌡️ ثبت احساس</TabsTrigger>
          <TabsTrigger value="regulate" className="text-xs sm:text-sm">🧘 تنظیم هیجان</TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs sm:text-sm">📊 الگوها</TabsTrigger>
        </TabsList>
        <TabsContent value="track">
          <ToolShell guide={{ toolId:'emotion-track', icon:'🌡️', title:'ردیابی احساسات با چرخه Plutchik', tagline:'نام‌گذاری دقیق احساس، قدرتش را کم می‌کند', whatIsIt:'چرخه احساسات Plutchik ۸ خانواده احساسی اصلی و ده‌ها احساس دقیق‌تر را نشان می‌دهد. هرچه دقیق‌تر احساست را نام‌گذاری کنی، بهتر می‌توانی آن را مدیریت کنی.', scienceBehind:'تحقیق Lisa Feldman Barrett نشان می‌دهد افرادی با واژگان هیجانی غنی‌تر، سالم‌تر هستند و بهتر تصمیم می‌گیرند. فقط نام‌گذاری احساس فعالیت آمیگدال را کاهش می‌دهد.', howToUse:['وقتی احساسی داری، اینجا ثبت کن','خانواده کلی را انتخاب کن بعد دقیق‌تر','محرک را بنویس — کمک می‌کند الگوها را ببینی','بعد از چند هفته به بخش "الگوها" نگاه کن'], expectedOutcome:'خودآگاهی هیجانی بالاتر و واکنش‌های سنجیده‌تر', timeToSeeResults:'۲-۴ هفته' }}>
            {!showForm ? (
              <div className="space-y-4">
                <Button onClick={() => setShowForm(true)} className="w-full"><Plus className="w-4 h-4 mr-1.5" />ثبت احساس جدید</Button>
                {state.emotionEntries.length === 0 ? <EmptyState icon="❤️" message="هنوز هیچ احساسی ثبت نکردی." /> : (
                  <div className="space-y-2">
                    {[...state.emotionEntries].reverse().slice(0,8).map(entry => {
                      const fd = EMOTION_FAMILIES[entry.primaryEmotion];
                      return (
                        <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card">
                          <span className="text-xl">{fd.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{entry.specificEmotion}</p>
                            {entry.trigger && <p className="text-xs text-muted-foreground truncate">{entry.trigger}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold" style={{ color: fd.color }}>{entry.intensity}%</p>
                            <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>← برگشت</Button>
                <EmotionForm onSave={e => { onUpdate(p => ({ ...p, emotionEntries: [...p.emotionEntries, e] })); setShowForm(false); }} />
              </div>
            )}
          </ToolShell>
        </TabsContent>
        <TabsContent value="regulate">
          <ToolShell guide={{ toolId:'regulation', icon:'🧘', title:'ابزارهای تنظیم هیجان', tagline:'برای هر احساس، ابزار مناسب وجود دارد', whatIsIt:'تنظیم هیجان یعنی تغییر شدت یا نوع احساس، نه سرکوب آن. هر تکنیک برای نوع خاصی از احساس بهترین کارایی را دارد.', scienceBehind:'کتاب "The Emotional Brain" جوزف لودوکس نشان می‌دهد سیستم هیجانی سریع‌تر از سیستم منطقی عمل می‌کند. تکنیک‌های جسمانی (تنفس، حرکت) مستقیم‌ترین اثر را دارند.', howToUse:['احساس فعلی‌ات را در نظر بگیر','تکنیکی که برای آن احساس پیشنهاد شده را انتخاب کن','مرحله به مرحله دنبال کن'], expectedOutcome:'توانایی آرام کردن خودت در لحظات سخت', timeToSeeResults:'از همان بار اول' }}>
            <RegulationTool currentEmotion={lastEmotion} />
          </ToolShell>
        </TabsContent>
        <TabsContent value="patterns">
          <ToolShell guide={{ toolId:'trigger-patterns', icon:'📊', title:'الگوهای هیجانی', tagline:'بعد از چند هفته، الگوها روشن می‌شوند', whatIsIt:'با جمع‌آوری داده از احساسات روزانه، می‌توانی ببینی کدام موقعیت‌ها، کدام احساسات را ایجاد می‌کنند و چه الگوهایی در زندگی‌ات وجود دارد.', scienceBehind:'رفتاردرمانی دیالکتیکی (DBT) از تحلیل زنجیره رفتاری استفاده می‌کند تا الگوهای هیجانی را شناسایی کند. آگاهی از الگو اولین قدم تغییر است.', howToUse:['حداقل ۳ احساس ثبت کن تا الگوها نشان داده شوند','به محرک‌های تکراری توجه کن','الگوها را با تراپیست یا در مطالعه شخصی‌ات بررسی کن'], expectedOutcome:'شناخت خودکار محرک‌های هیجانی', timeToSeeResults:'۲-۳ هفته' }}>
            <TriggerAnalysis entries={state.emotionEntries} />
          </ToolShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
