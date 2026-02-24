import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ToolShell, SectionHeader, EmptyState, EntryCard, ScaleInput } from './ui';
import type { ThoughtRecord, BeliefRecord, CognitiveDistortion, PsychologyState } from './types';

// ─── Distortion definitions ───────────────────────────────────────────────────

const DISTORTIONS: Record<CognitiveDistortion, { label: string; emoji: string; description: string; example: string }> = {
  'all-or-nothing':       { label: 'همه یا هیچ', emoji: '⚖️', description: 'همه چیز را سیاه یا سفید می‌بینی، هیچ طیف خاکستری وجود ندارد', example: '"یا کامل موفق می‌شم، یا شکست خوردم"' },
  'catastrophizing':      { label: 'فاجعه‌سازی', emoji: '🌋', description: 'بدترین سناریو را تصور می‌کنی و آن را محتمل می‌دانی', example: '"اگه این کار رو خراب کنم، زندگیم تموم شده"' },
  'mind-reading':         { label: 'ذهن‌خوانی', emoji: '🔮', description: 'فکر می‌کنی می‌دانی دیگران چه فکری می‌کنند، بدون شواهد', example: '"می‌دونم که ازم بدشون میاد"' },
  'fortune-telling':      { label: 'پیشگویی منفی', emoji: '🎱', description: 'آینده را منفی پیش‌بینی می‌کنی و گویی حتمی است', example: '"می‌دونم که موفق نمی‌شم"' },
  'emotional-reasoning':  { label: 'استدلال احساساتی', emoji: '💔', description: 'فکر می‌کنی چون احساسی داری، آن احساس واقعیت است', example: '"احساس می‌کنم بی‌ارزشم، پس هستم"' },
  'should-statements':    { label: 'باید و نباید', emoji: '📏', description: 'قوانین سخت و انعطاف‌ناپذیری دارید که وقتی نقض شود گناه‌کار احساس می‌کنی', example: '"باید همیشه کامل باشم"' },
  'labeling':             { label: 'برچسب‌زنی', emoji: '🏷️', description: 'به جای بررسی رفتار، یک برچسب منفی کلی می‌زنی', example: '"من یه بازنده‌ام" به جای "این کار رو خوب نکردم"' },
  'personalization':      { label: 'خود-مقصر دانستن', emoji: '🎯', description: 'خودت را مسئول چیزهایی می‌دانی که خارج از کنترل توست', example: '"اگه ناراحته حتماً تقصیر منه"' },
  'discounting':          { label: 'رد مثبت‌ها', emoji: '🙈', description: 'موفقیت‌ها را کم‌اهمیت می‌شمری و شکست‌ها را بزرگ می‌کنی', example: '"این موفقیتم از شانس بود، نه مهارت"' },
  'overgeneralization':   { label: 'تعمیم افراطی', emoji: '♾️', description: 'از یک رویداد منفی، یک قانون کلی نتیجه می‌گیری', example: '"همیشه شکست می‌خورم"' },
  'mental-filter':        { label: 'فیلتر ذهنی', emoji: '🕶️', description: 'فقط روی جنبه‌های منفی تمرکز می‌کنی و مثبت‌ها را نمی‌بینی', example: '"وسط ۱۰ تعریف، یه انتقاد شنیدم و کل روزم خراب شد"' },
  'magnification':        { label: 'بزرگ‌نمایی', emoji: '🔍', description: 'نقص‌هایت را بزرگ و مهارت‌هایت را کوچک می‌بینی', example: '"این اشتباه کوچیک نشون می‌ده که کلاً بی‌کفایتم"' },
  'jumping-conclusions':  { label: 'نتیجه‌گیری سریع', emoji: '⚡', description: 'بدون شواهد کافی، نتیجه منفی می‌گیری', example: '"جواب نداد، پس ازم متنفره"' },
  'blame':                { label: 'سرزنش', emoji: '👉', description: 'همه مشکلات را به خودت یا دیگران نسبت می‌دهی', example: '"همه بدبختی‌هام تقصیر اونه"' },
  'unfair-comparison':    { label: 'مقایسه ناعادلانه', emoji: '🏆', description: 'خودت را با بهترین‌ها مقایسه می‌کنی و ضعیف به نظر می‌رسی', example: '"اون بهتر از منه، پس من فایده‌ای ندارم"' },
};

// ─── Thought Record Form ──────────────────────────────────────────────────────

function ThoughtRecordForm({ onSave }: { onSave: (r: ThoughtRecord) => void }) {
  const [step, setStep]                   = useState(0);
  const [situation, setSituation]         = useState('');
  const [thought, setThought]             = useState('');
  const [emotion, setEmotion]             = useState('');
  const [intensity, setIntensity]         = useState(50);
  const [selected, setSelected]           = useState<CognitiveDistortion[]>([]);
  const [evidenceFor, setEvFor]           = useState('');
  const [evidenceAgainst, setEvAgainst]   = useState('');
  const [balanced, setBalanced]           = useState('');
  const [moodAfter, setMoodAfter]         = useState(50);

  const steps = [
    { title: '📍 موقعیت', subtitle: 'چه اتفاقی افتاد؟' },
    { title: '💭 فکر خودکار', subtitle: 'چه فکری آمد؟' },
    { title: '😰 احساس', subtitle: 'چه احساسی داشتی؟' },
    { title: '🔍 تحریف‌ها', subtitle: 'کدام تحریف‌های شناختی بود؟' },
    { title: '⚖️ شواهد', subtitle: 'شواهد له و علیه' },
    { title: '🌱 بازسازی', subtitle: 'فکر متوازن' },
  ];

  const toggle = (d: CognitiveDistortion) =>
    setSelected(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleSave = () => {
    onSave({
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      situation,
      automaticThought: thought,
      emotions: [emotion],
      emotionIntensity: intensity,
      distortions: selected,
      evidence_for: evidenceFor,
      evidence_against: evidenceAgainst,
      balancedThought: balanced,
      moodAfter,
      createdAt: new Date().toISOString(),
    });
    // Reset
    setSituation(''); setThought(''); setEmotion(''); setIntensity(50);
    setSelected([]); setEvFor(''); setEvAgainst(''); setBalanced(''); setMoodAfter(50);
    setStep(0);
  };

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <div>
        <p className="font-semibold">{steps[step].title}</p>
        <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          {step === 0 && (
            <textarea value={situation} onChange={e => setSituation(e.target.value)}
              rows={3} placeholder="توصیف دقیق موقعیت: کجا بودی، با کی، چه اتفاقی افتاد؟"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          )}

          {step === 1 && (
            <textarea value={thought} onChange={e => setThought(e.target.value)}
              rows={3} placeholder="دقیقاً چه فکری به ذهنت رسید؟ همان‌طور که بود بنویس..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          )}

          {step === 2 && (
            <div className="space-y-3">
              <input value={emotion} onChange={e => setEmotion(e.target.value)}
                placeholder="چه احساسی داشتی؟ (مثلاً: ترس، غم، عصبانیت، شرم)"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <ScaleInput label="شدت احساس" value={intensity} onChange={setIntensity}
                lowLabel="خفیف" highLabel="شدید" color="#ef4444" />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(DISTORTIONS) as CognitiveDistortion[]).map(key => {
                const d = DISTORTIONS[key];
                const isSel = selected.includes(key);
                return (
                  <button key={key} onClick={() => toggle(key)}
                    className={`p-2.5 rounded-xl border text-xs text-start transition-all ${
                      isSel ? 'border-red-500/40 bg-red-500/10 text-red-600' : 'border-border hover:border-primary/30'
                    }`}
                    title={d.description}
                  >
                    <span className="text-base block">{d.emoji}</span>
                    <span className="font-semibold mt-0.5 block">{d.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">شواهد له این فکر</label>
                <textarea value={evidenceFor} onChange={e => setEvFor(e.target.value)}
                  rows={2} placeholder="چه چیزی این فکر را تأیید می‌کند؟"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">شواهد علیه این فکر</label>
                <textarea value={evidenceAgainst} onChange={e => setEvAgainst(e.target.value)}
                  rows={2} placeholder="چه چیزی این فکر را رد می‌کند؟"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <textarea value={balanced} onChange={e => setBalanced(e.target.value)}
                rows={3} placeholder="یک فکر متوازن‌تر و واقعی‌تر بنویس که هر دو طرف را در نظر بگیرد..."
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <ScaleInput label="حال الان چطوری؟" value={moodAfter} onChange={setMoodAfter}
                lowLabel="بدتر" highLabel="بهتر" color="#10b981" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)}>قبلی</Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} className="flex-1"
            disabled={step === 0 && !situation || step === 1 && !thought}>
            بعدی
          </Button>
        ) : (
          <Button onClick={handleSave} className="flex-1" disabled={!balanced}>
            <Save className="w-4 h-4 mr-1.5" />ذخیره
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Belief Record Form ───────────────────────────────────────────────────────

function BeliefForm({ onSave }: { onSave: (b: BeliefRecord) => void }) {
  const [belief, setBelief]     = useState('');
  const [origin, setOrigin]     = useState('');
  const [impact, setImpact]     = useState('');
  const [challenge, setChall]   = useState('');
  const [newBelief, setNew]     = useState('');
  const [strength, setStrength] = useState(70);

  const handleSave = () => {
    onSave({
      id: uuidv4(), belief, origin, impact, challenge, newBelief, strength,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setBelief(''); setOrigin(''); setImpact(''); setChall(''); setNew(''); setStrength(70);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-muted-foreground">باور محدودکننده</label>
        <input value={belief} onChange={e => setBelief(e.target.value)}
          placeholder='"من به اندازه کافی خوب نیستم"، "موفقیت برای من ممکن نیست"...'
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <ScaleInput label="چقدر به این باور اعتقاد داری؟" value={strength} onChange={setStrength}
        lowLabel="اصلاً" highLabel="کاملاً" color="#ef4444" />
      <div>
        <label className="text-xs font-semibold text-muted-foreground">ریشه این باور از کجاست؟</label>
        <textarea value={origin} onChange={e => setOrigin(e.target.value)} rows={2}
          placeholder="کدام تجربه، گفته یا دوره زندگی این باور را شکل داد؟"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">چطور این باور تو را محدود می‌کند؟</label>
        <textarea value={impact} onChange={e => setImpact(e.target.value)} rows={2}
          placeholder="چه کارهایی نمی‌کنی؟ چه فرصت‌هایی از دست می‌دهی؟"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">شواهد رد این باور</label>
        <textarea value={challenge} onChange={e => setChall(e.target.value)} rows={2}
          placeholder="چه مثال‌هایی وجود دارد که این باور کاملاً درست نیست؟"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">باور توانمندساز جایگزین</label>
        <input value={newBelief} onChange={e => setNew(e.target.value)}
          placeholder='"من در حال رشد هستم"، "با تلاش می‌توانم بهتر شوم"...'
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>
      <Button onClick={handleSave} disabled={!belief || !newBelief} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ذخیره
      </Button>
    </div>
  );
}

// ─── Distortion Stats ─────────────────────────────────────────────────────────

function DistortionStats({ records }: { records: ThoughtRecord[] }) {
  const counts: Partial<Record<CognitiveDistortion, number>> = {};
  records.forEach(r => r.distortions.forEach(d => {
    counts[d] = (counts[d] ?? 0) + 1;
  }));

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [CognitiveDistortion, number][];

  if (sorted.length === 0) return null;

  const max = sorted[0][1];

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />تحریف‌های رایج شما
        </p>
        {sorted.map(([key, count]) => {
          const d = DISTORTIONS[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{d.emoji} {d.label}</span>
                <span className="text-muted-foreground">{count} بار</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Main CBT export ──────────────────────────────────────────────────────────

interface Props {
  state: PsychologyState;
  onUpdate: (updater: (prev: PsychologyState) => PsychologyState) => void;
}

export default function CBTTools({ state, onUpdate }: Props) {
  const [showForm, setShowForm]         = useState(false);
  const [showBeliefForm, setShowBF]     = useState(false);

  return (
    <div className="space-y-8">
      <SectionHeader icon="🧠" title="ابزارهای CBT" subtitle="شناخت درمانی رفتاری — تفکرت را بازسازی کن" color="#ef4444" />

      <Tabs defaultValue="thoughts">
        <TabsList className="flex-wrap h-auto p-1 gap-1 mb-4">
          <TabsTrigger value="thoughts" className="text-xs sm:text-sm">💭 ثبت افکار</TabsTrigger>
          <TabsTrigger value="distortions" className="text-xs sm:text-sm">🔍 تحریف‌ها</TabsTrigger>
          <TabsTrigger value="beliefs" className="text-xs sm:text-sm">🔓 باورها</TabsTrigger>
        </TabsList>

        {/* Thought Records */}
        <TabsContent value="thoughts">
          <ToolShell
            guide={{
              toolId: 'thought-record',
              icon: '💭',
              title: 'ثبت و بازسازی افکار (Thought Record)',
              tagline: 'افکار خودکار را شناسایی و به چالش بکش',
              whatIsIt: 'ثبت افکار یکی از مؤثرترین تکنیک‌های CBT است. وقتی احساس بدی داری، فکر پشتش را پیدا می‌کنی، آن را به چالش می‌کشی و یک فکر متوازن‌تر جایگزین می‌کنی.',
              scienceBehind: 'Aaron Beck در دهه ۶۰ CBT را توسعه داد. بیش از ۵۰۰ مطالعه تأیید می‌کند که ثبت افکار به همان اندازه داروهای ضدافسردگی مؤثر است. تفاوت: اثرش دائمی است.',
              howToUse: [
                'بعد از هر موقعیتی که احساس ناخوشایند داشتی، فرم را پر کن',
                'سعی کن کمتر از ۲ ساعت بعد از رویداد این کار را بکنی',
                'به شواهد واقعی فکر کن، نه احساسات',
                'فکر متوازن نباید "خوش‌بینانه" باشد — فقط "واقعی‌تر"',
              ],
              expectedOutcome: 'کاهش شدت احساسات منفی و افزایش انعطاف شناختی',
              timeToSeeResults: '۲-۳ هفته استفاده منظم',
            }}
          >
            {!showForm ? (
              <div className="space-y-4">
                <Button onClick={() => setShowForm(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-1.5" />ثبت فکر جدید
                </Button>
                {state.thoughtRecords.length > 0 ? (
                  <>
                    <DistortionStats records={state.thoughtRecords} />
                    <div className="space-y-3">
                      {[...state.thoughtRecords].reverse().slice(0, 5).map(record => (
                        <EntryCard key={record.id} title={record.automaticThought} date={record.date} accentColor="#ef4444">
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>😰 {record.emotions.join(', ')} (شدت: {record.emotionIntensity}%)</p>
                            {record.distortions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {record.distortions.map(d => (
                                  <span key={d} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 text-[10px]">
                                    {DISTORTIONS[d].label}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-green-600">🌱 {record.balancedThought}</p>
                          </div>
                        </EntryCard>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState icon="💭" message="هنوز هیچ فکری ثبت نکردی. وقتی احساس بدی داشتی اینجا بیا." />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>← برگشت</Button>
                <ThoughtRecordForm
                  onSave={record => {
                    onUpdate(prev => ({ ...prev, thoughtRecords: [...prev.thoughtRecords, record] }));
                    setShowForm(false);
                  }}
                />
              </div>
            )}
          </ToolShell>
        </TabsContent>

        {/* Distortion Reference */}
        <TabsContent value="distortions">
          <ToolShell
            guide={{
              toolId: 'distortions-ref',
              icon: '🔍',
              title: 'راهنمای تحریف‌های شناختی',
              tagline: 'آشنا شو با الگوهای تفکر مخربی که همه داریم',
              whatIsIt: 'تحریف‌های شناختی الگوهای فکری هستند که ذهن را از واقعیت منحرف می‌کنند. اولین قدم تشخیص آن‌هاست.',
              scienceBehind: 'David Burns در کتاب "Feeling Good" ۱۵ تحریف شناختی اصلی را توصیف کرد. تحقیقات نشان می‌دهد صرف نام‌گذاری یک تحریف، شدت آن را ۳۰٪ کاهش می‌دهد.',
              howToUse: [
                'هر بار که احساس بدی داری، این لیست را مرور کن',
                'تحریف‌هایی که بیشتر داری را حفظ کن',
                'در ثبت افکار، از این لیست برای برچسب‌گذاری استفاده کن',
              ],
              expectedOutcome: 'شناسایی خودکار تحریف‌ها در لحظه',
              timeToSeeResults: '۱-۲ هفته',
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.entries(DISTORTIONS) as [CognitiveDistortion, typeof DISTORTIONS[CognitiveDistortion]][]).map(([key, d]) => {
                const myCount = state.thoughtRecords.reduce((s, r) => s + (r.distortions.includes(key) ? 1 : 0), 0);
                return (
                  <Card key={key} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{d.emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{d.label}</p>
                            {myCount > 0 && (
                              <Badge className="text-[10px] bg-red-500/10 text-red-600">{myCount}×</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
                          <p className="text-[11px] text-primary/70 mt-1.5 italic">{d.example}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ToolShell>
        </TabsContent>

        {/* Beliefs */}
        <TabsContent value="beliefs">
          <ToolShell
            guide={{
              toolId: 'beliefs',
              icon: '🔓',
              title: 'باورهای محدودکننده',
              tagline: 'ریشه‌های پنهانی که پیشرفتت را کند می‌کنند',
              whatIsIt: 'باورهای محدودکننده جملاتی هستند که به عنوان "حقیقت" پذیرفتیم، اما در واقع تعبیرهایی هستند که از تجربیات گذشته ساختیم. مثل "من باهوش نیستم" یا "عشق واقعی وجود ندارد".',
              scienceBehind: 'Schema Therapy (Jeffrey Young) نشان می‌دهد اکثر باورهای محدودکننده در دوران کودکی و نوجوانی شکل می‌گیرند و ناخودآگاه رفتار بزرگسالی را هدایت می‌کنند.',
              howToUse: [
                'یک باور که اغلب به خودت می‌گویی را بنویس',
                'ریشه‌اش را پیدا کن — کی آن را شنیدی یا تجربه کردی؟',
                'شواهد رد آن را بنویس',
                'یک باور جایگزین توانمند بنویس و هر روز آن را مرور کن',
              ],
              expectedOutcome: 'آگاهی از الگوهای ذهنی خودمحدودکننده و جایگزینی آن‌ها',
              timeToSeeResults: '۱-۳ ماه',
            }}
          >
            {!showBeliefForm ? (
              <div className="space-y-4">
                <Button onClick={() => setShowBF(true)} className="w-full">
                  <Plus className="w-4 h-4 mr-1.5" />ثبت باور محدودکننده
                </Button>
                {state.beliefRecords.length === 0 ? (
                  <EmptyState icon="🔓" message="هنوز باور محدودکننده‌ای ثبت نکردی." />
                ) : (
                  <div className="space-y-3">
                    {state.beliefRecords.map(b => (
                      <EntryCard key={b.id} title={`"${b.belief}"`} date={b.createdAt.split('T')[0]} accentColor="#f59e0b">
                        <div className="space-y-1.5 text-xs">
                          <p className="text-red-500">📉 {b.impact}</p>
                          <p className="text-green-500">🌱 جایگزین: "{b.newBelief}"</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500/60" style={{ width: `${b.strength}%` }} />
                            </div>
                            <span className="text-muted-foreground shrink-0">{b.strength}% قدرت</span>
                          </div>
                        </div>
                      </EntryCard>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={() => setShowBF(false)}>← برگشت</Button>
                <BeliefForm
                  onSave={belief => {
                    onUpdate(prev => ({ ...prev, beliefRecords: [...prev.beliefRecords, belief] }));
                    setShowBF(false);
                  }}
                />
              </div>
            )}
          </ToolShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
