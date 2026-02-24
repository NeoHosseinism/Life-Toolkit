import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolShell, ScaleInput, SectionHeader, EmptyState, EntryCard } from './ui';
import type {
  WheelOfLifeEntry, WheelArea, PersonalValue, PersonalityProfile,
  PsychologyState,
} from './types';

// ─── Wheel of Life data ───────────────────────────────────────────────────────

const WHEEL_AREAS: { key: WheelArea; label: string; emoji: string; color: string }[] = [
  { key: 'career',        label: 'کار و حرفه',         emoji: '💼', color: '#6366f1' },
  { key: 'finances',      label: 'مالی',               emoji: '💰', color: '#f59e0b' },
  { key: 'health',        label: 'سلامت',              emoji: '💪', color: '#ef4444' },
  { key: 'relationships', label: 'روابط عاطفی',        emoji: '❤️', color: '#ec4899' },
  { key: 'family',        label: 'خانواده',            emoji: '🏡', color: '#f97316' },
  { key: 'fun',           label: 'تفریح و سرگرمی',     emoji: '🎮', color: '#10b981' },
  { key: 'growth',        label: 'رشد شخصی',           emoji: '🌱', color: '#3b82f6' },
  { key: 'environment',   label: 'محیط زندگی',         emoji: '🏙️', color: '#8b5cf6' },
];

const ALL_VALUES: PersonalValue[] = [
  { id: '1',  name: 'آزادی',         category: 'فردی',     selected: false },
  { id: '2',  name: 'امنیت',         category: 'فردی',     selected: false },
  { id: '3',  name: 'خلاقیت',        category: 'فردی',     selected: false },
  { id: '4',  name: 'رشد',           category: 'فردی',     selected: false },
  { id: '5',  name: 'معنا',          category: 'فردی',     selected: false },
  { id: '6',  name: 'شجاعت',         category: 'فردی',     selected: false },
  { id: '7',  name: 'صداقت',         category: 'اخلاقی',   selected: false },
  { id: '8',  name: 'عدالت',         category: 'اخلاقی',   selected: false },
  { id: '9',  name: 'مسئولیت',       category: 'اخلاقی',   selected: false },
  { id: '10', name: 'وفاداری',       category: 'اخلاقی',   selected: false },
  { id: '11', name: 'همدلی',         category: 'اجتماعی',  selected: false },
  { id: '12', name: 'خانواده',       category: 'اجتماعی',  selected: false },
  { id: '13', name: 'دوستی',         category: 'اجتماعی',  selected: false },
  { id: '14', name: 'خدمت',          category: 'اجتماعی',  selected: false },
  { id: '15', name: 'همکاری',        category: 'اجتماعی',  selected: false },
  { id: '16', name: 'ثروت',          category: 'حرفه‌ای',  selected: false },
  { id: '17', name: 'موفقیت',        category: 'حرفه‌ای',  selected: false },
  { id: '18', name: 'تأثیرگذاری',    category: 'حرفه‌ای',  selected: false },
  { id: '19', name: 'تخصص',          category: 'حرفه‌ای',  selected: false },
  { id: '20', name: 'ریسک‌پذیری',    category: 'حرفه‌ای',  selected: false },
  { id: '21', name: 'سلامتی',        category: 'جسمی',     selected: false },
  { id: '22', name: 'انرژی',         category: 'جسمی',     selected: false },
  { id: '23', name: 'تناسب اندام',   category: 'جسمی',     selected: false },
  { id: '24', name: 'آرامش',         category: 'روحی',     selected: false },
  { id: '25', name: 'معنویت',        category: 'روحی',     selected: false },
  { id: '26', name: 'کنجکاوی',       category: 'ذهنی',     selected: false },
  { id: '27', name: 'یادگیری',       category: 'ذهنی',     selected: false },
  { id: '28', name: 'خرد',           category: 'ذهنی',     selected: false },
  { id: '29', name: 'ماجراجویی',     category: 'تجربه',    selected: false },
  { id: '30', name: 'هیجان',         category: 'تجربه',    selected: false },
];

// ─── Wheel SVG ────────────────────────────────────────────────────────────────

function WheelSVG({ areas }: { areas: Record<WheelArea, number> }) {
  const cx = 150, cy = 150, r = 120;
  const n = WHEEL_AREAS.length;

  const segments = WHEEL_AREAS.map((area, i) => {
    const angleStart = (i / n) * 2 * Math.PI - Math.PI / 2;
    const angleEnd = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const val = (areas[area.key] ?? 0) / 10;

    const ox1 = cx + Math.cos(angleStart) * r * val;
    const oy1 = cy + Math.sin(angleStart) * r * val;
    const ox2 = cx + Math.cos(angleEnd) * r * val;
    const oy2 = cy + Math.sin(angleEnd) * r * val;

    const path = val > 0
      ? `M ${cx} ${cy} L ${ox1} ${oy1} A ${r * val} ${r * val} 0 0 1 ${ox2} ${oy2} Z`
      : '';

    const midAngle = (angleStart + angleEnd) / 2;
    const labelR = r + 18;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    return { path, lx, ly, area, val, midAngle };
  });

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
      {/* Grid circles */}
      {[2, 4, 6, 8, 10].map(v => (
        <circle key={v} cx={cx} cy={cy} r={r * v / 10}
          fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
      ))}

      {/* Grid lines */}
      {WHEEL_AREAS.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return (
          <line key={i}
            x1={cx} y1={cy}
            x2={cx + Math.cos(angle) * r}
            y2={cy + Math.sin(angle) * r}
            stroke="currentColor" strokeOpacity={0.1} strokeWidth={1}
          />
        );
      })}

      {/* Filled segments */}
      {segments.map(({ path, area }) => path && (
        <path key={area.key} d={path} fill={area.color} fillOpacity={0.65} />
      ))}

      {/* Segment borders */}
      {segments.map(({ path, area }) => path && (
        <path key={area.key + 'b'} d={path} fill="none" stroke={area.color} strokeWidth={1.5} />
      ))}

      {/* Emoji labels */}
      {segments.map(({ lx, ly, area }) => (
        <text key={area.key + 'l'} x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle" fontSize={14}>
          {area.emoji}
        </text>
      ))}
    </svg>
  );
}

// ─── Wheel of Life Tool ───────────────────────────────────────────────────────

function WheelOfLifeTool({
  entries, onSave,
}: {
  entries: WheelOfLifeEntry[];
  onSave: (e: WheelOfLifeEntry) => void;
}) {
  const latest = entries.at(-1);
  const initAreas = () => WHEEL_AREAS.reduce((acc, a) => ({ ...acc, [a.key]: latest?.areas[a.key] ?? 5 }), {} as Record<WheelArea, number>);

  const [areas, setAreas]     = useState<Record<WheelArea, number>>(initAreas);
  const [notes, setNotes]     = useState('');
  const [saved, setSaved]     = useState(false);

  const setArea = (key: WheelArea, v: number) => setAreas(prev => ({ ...prev, [key]: v }));

  const avg = Object.values(areas).reduce((s, v) => s + v, 0) / 8;
  const mostNeeded = WHEEL_AREAS.reduce((a, b) => areas[a.key] < areas[b.key] ? a : b);

  const handleSave = () => {
    onSave({
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      areas,
      notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Wheel visualization */}
        <div className="space-y-3">
          <WheelSVG areas={areas} />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-muted/50">
              <p className="text-lg font-bold text-primary">{avg.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">میانگین</p>
            </div>
            <div className="p-2 rounded-xl bg-red-500/10">
              <p className="text-xs font-bold text-red-500">{mostNeeded.emoji} {mostNeeded.label}</p>
              <p className="text-[10px] text-muted-foreground">نیاز به توجه</p>
            </div>
            <div className="p-2 rounded-xl bg-muted/50">
              <p className="text-lg font-bold">{entries.length}</p>
              <p className="text-[10px] text-muted-foreground">ارزیابی قبلی</p>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {WHEEL_AREAS.map(area => (
            <div key={area.key}>
              <ScaleInput
                label={`${area.emoji} ${area.label}`}
                value={areas[area.key]}
                onChange={v => setArea(area.key, v)}
                color={area.color}
              />
            </div>
          ))}

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="یادداشت‌های این ارزیابی (اختیاری)…"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-1.5" />
            {saved ? '✅ ذخیره شد!' : 'ذخیره ارزیابی'}
          </Button>
        </div>
      </div>

      {/* History */}
      {entries.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">تاریخچه ارزیابی‌ها</h4>
          {[...entries].reverse().slice(0, 5).map(entry => (
            <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50">
              <span className="text-xs text-muted-foreground w-20 shrink-0">{entry.date}</span>
              <div className="flex gap-1 flex-1">
                {WHEEL_AREAS.map(a => (
                  <div key={a.key}
                    className="h-6 w-full rounded-sm"
                    style={{ backgroundColor: a.color + Math.round((entry.areas[a.key] / 10) * 255).toString(16).padStart(2, '0') }}
                    title={`${a.label}: ${entry.areas[a.key]}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-primary">
                {(Object.values(entry.areas).reduce((s, v) => s + v, 0) / 8).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Values Map Tool ──────────────────────────────────────────────────────────

function ValuesTool({
  values: savedValues, onSave,
}: {
  values: PersonalValue[];
  onSave: (v: PersonalValue[]) => void;
}) {
  const [values, setValues] = useState<PersonalValue[]>(
    savedValues.length ? savedValues : ALL_VALUES
  );

  const selected = values.filter(v => v.selected);
  const categories = [...new Set(values.map(v => v.category))];

  const toggle = (id: string) => {
    setValues(prev => prev.map(v =>
      v.id === id ? { ...v, selected: !v.selected } : v
    ));
  };

  const canSave = selected.length >= 3 && selected.length <= 10;

  const alignmentWarnings = selected.length > 0
    ? `شما ${selected.length} ارزش انتخاب کردید. این ارزش‌ها باید در تصمیم‌گیری‌ها، هدف‌گذاری و برنامه‌ریزی روزانه‌تان نقش داشته باشند.`
    : 'حداقل ۳ و حداکثر ۱۰ ارزش انتخاب کنید.';

  return (
    <div className="space-y-5">
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600">
        {alignmentWarnings}
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {values.filter(v => v.category === cat).map(v => (
              <button
                key={v.id}
                onClick={() => toggle(v.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  v.selected
                    ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                } ${selected.length >= 10 && !v.selected ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={selected.length >= 10 && !v.selected}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
          <p className="text-sm font-semibold">ارزش‌های انتخاب‌شده شما:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(v => (
              <span key={v.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {v.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button onClick={() => onSave(values)} disabled={!canSave} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ذخیره ارزش‌ها
      </Button>
    </div>
  );
}

// ─── Personality Profile Tool ─────────────────────────────────────────────────

const MBTI_DESCRIPTIONS: Record<string, string> = {
  'INTJ': 'معمار — استراتژیست مستقل، با بینش بلندمدت',
  'INTP': 'منطق‌دان — تحلیلگر کنجکاو، عاشق ایده‌ها',
  'ENTJ': 'فرمانده — رهبر قاطع، هدف‌محور',
  'ENTP': 'مناظره‌گر — نوآور پرانرژی، دوستدار چالش',
  'INFJ': 'مشاور — ایده‌آلیست عمیق، مهربان و هدفمند',
  'INFP': 'میانجی — خلاق و احساساتی، ارزش‌محور',
  'ENFJ': 'قهرمان — الهام‌بخش و دلسوز، رهبر طبیعی',
  'ENFP': 'مبارز — پرشور و خلاق، انسان‌دوست',
  'ISTJ': 'بازرس — منطم و مسئولیت‌پذیر، قابل اتکا',
  'ISFJ': 'مدافع — محافظ صبور، خدمتگزار',
  'ESTJ': 'مدیر — سازمان‌دهنده کارآمد، رهبر عملی',
  'ESFJ': 'مراقب — اجتماعی و دلسوز، هماهنگ‌کننده',
  'ISTP': 'صنعتگر — ماهر و انعطاف‌پذیر، مشکل‌گشا',
  'ISFP': 'ماجراجو — هنرمند حساس، لحظه‌محور',
  'ESTP': 'کارآفرین — پرانرژی و عملگرا، ریسک‌پذیر',
  'ESFP': 'سرگرم‌کننده — خودانگیخته و اجتماعی، لذت‌جو',
};

function PersonalityTool({
  profile, onSave,
}: {
  profile: PersonalityProfile;
  onSave: (p: PersonalityProfile) => void;
}) {
  const [mbtiLetters, setMbti] = useState({
    ei: profile.mbti?.[0] ?? '',
    sn: profile.mbti?.[1] ?? '',
    tf: profile.mbti?.[2] ?? '',
    jp: profile.mbti?.[3] ?? '',
  });
  const [bigFive, setBigFive] = useState(profile.bigFive ?? {
    openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50,
  });
  const [enneagram, setEnneagram] = useState<number | undefined>(profile.enneagram);

  const mbtiResult = Object.values(mbtiLetters).join('');
  const isMbtiComplete = mbtiResult.length === 4;
  const mbtiDesc = isMbtiComplete ? MBTI_DESCRIPTIONS[mbtiResult] : null;

  const MBTI_PAIRS = [
    { key: 'ei', a: 'E', b: 'I', labelA: 'برون‌گرا (E)', labelB: 'درون‌گرا (I)' },
    { key: 'sn', a: 'S', b: 'N', labelA: 'حسی (S)', labelB: 'شهودی (N)' },
    { key: 'tf', a: 'T', b: 'F', labelA: 'متفکر (T)', labelB: 'احساساتی (F)' },
    { key: 'jp', a: 'J', b: 'P', labelA: 'قضاوتی (J)', labelB: 'ادراکی (P)' },
  ] as const;

  const ENNEAGRAM_TYPES = [
    { n: 1, label: 'کمال‌گرا', emoji: '⚖️' },
    { n: 2, label: 'یاری‌دهنده', emoji: '🤝' },
    { n: 3, label: 'موفق‌طلب', emoji: '🏆' },
    { n: 4, label: 'فردگرا', emoji: '🎭' },
    { n: 5, label: 'محقق', emoji: '🔬' },
    { n: 6, label: 'وفادار', emoji: '🛡️' },
    { n: 7, label: 'شادمان', emoji: '🎉' },
    { n: 8, label: 'چالشگر', emoji: '🦁' },
    { n: 9, label: 'صلح‌جو', emoji: '🕊️' },
  ];

  const BIG5_LABELS: Record<string, { label: string; low: string; high: string }> = {
    openness: { label: 'گشودگی', low: 'سنتی', high: 'خلاق' },
    conscientiousness: { label: 'وجدانی بودن', low: 'انعطاف‌پذیر', high: 'منضبط' },
    extraversion: { label: 'برون‌گرایی', low: 'درون‌گرا', high: 'برون‌گرا' },
    agreeableness: { label: 'سازگاری', low: 'انتقادی', high: 'مشارکتی' },
    neuroticism: { label: 'روان‌رنجوری', low: 'باثبات', high: 'حساس' },
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mbti">
        <TabsList className="flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="mbti" className="text-xs">MBTI</TabsTrigger>
          <TabsTrigger value="bigfive" className="text-xs">Big Five</TabsTrigger>
          <TabsTrigger value="enneagram" className="text-xs">Enneagram</TabsTrigger>
        </TabsList>

        <TabsContent value="mbti" className="space-y-4 pt-3">
          {MBTI_PAIRS.map(pair => (
            <div key={pair.key}>
              <p className="text-xs text-muted-foreground mb-2">{pair.labelA} یا {pair.labelB}؟</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ val: pair.a, label: pair.labelA }, { val: pair.b, label: pair.labelB }].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setMbti(prev => ({ ...prev, [pair.key]: opt.val }))}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      mbtiLetters[pair.key] === opt.val
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {opt.val} — {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {isMbtiComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center"
            >
              <p className="text-3xl font-black text-indigo-500 mb-1">{mbtiResult}</p>
              {mbtiDesc && <p className="text-sm text-muted-foreground">{mbtiDesc}</p>}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="bigfive" className="space-y-4 pt-3">
          {Object.entries(bigFive).map(([key, val]) => {
            const meta = BIG5_LABELS[key];
            return (
              <ScaleInput
                key={key}
                label={meta.label}
                value={val}
                onChange={v => setBigFive(prev => ({ ...prev, [key]: v }))}
                lowLabel={meta.low}
                highLabel={meta.high}
                color="#6366f1"
              />
            );
          })}
        </TabsContent>

        <TabsContent value="enneagram" className="pt-3">
          <div className="grid grid-cols-3 gap-2">
            {ENNEAGRAM_TYPES.map(type => (
              <button
                key={type.n}
                onClick={() => setEnneagram(type.n)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  enneagram === type.n
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-xl block">{type.emoji}</span>
                <span className="text-[10px] block mt-1 font-semibold">نوع {type.n}</span>
                <span className="text-[10px] block text-muted-foreground">{type.label}</span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        onClick={() => onSave({
          mbti: isMbtiComplete ? mbtiResult : profile.mbti,
          bigFive,
          enneagram,
          completedAt: new Date().toISOString(),
        })}
        className="w-full"
      >
        <Save className="w-4 h-4 mr-1.5" />ذخیره پروفایل شخصیتی
      </Button>
    </div>
  );
}

// ─── Main SelfAwareness export ────────────────────────────────────────────────

interface Props {
  state: PsychologyState;
  onUpdate: (updater: (prev: PsychologyState) => PsychologyState) => void;
}

export default function SelfAwareness({ state, onUpdate }: Props) {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon="🪞"
        title="خودآگاهی"
        subtitle="بشناس خودت رو — پایه همه رشد اینجاست"
        color="#6366f1"
      />

      <Tabs defaultValue="wheel">
        <TabsList className="flex-wrap h-auto p-1 gap-1 mb-4">
          <TabsTrigger value="wheel" className="text-xs sm:text-sm">🎡 چرخه زندگی</TabsTrigger>
          <TabsTrigger value="values" className="text-xs sm:text-sm">💎 ارزش‌ها</TabsTrigger>
          <TabsTrigger value="personality" className="text-xs sm:text-sm">🧠 شخصیت</TabsTrigger>
        </TabsList>

        <TabsContent value="wheel">
          <ToolShell
            guide={{
              toolId: 'wheel-of-life',
              icon: '🎡',
              title: 'چرخه زندگی (Wheel of Life)',
              tagline: 'تصویر بصری از توازن حوزه‌های مختلف زندگی‌ات',
              whatIsIt: 'چرخه زندگی ابزاری است که ۸ حوزه کلیدی زندگی را از ۰ تا ۱۰ ارزیابی می‌کند. نتیجه یک نمودار عنکبوتی است که نشان می‌دهد کجا توازن داری و کجا نداری.',
              scienceBehind: 'این ابزار از مفهوم "Well-being Wheel" در روانشناسی مثبت‌نگر و مدل PERMA Martin Seligman الهام گرفته. تحقیقات نشان می‌دهد افرادی که به صورت دوره‌ای زندگی‌شان را ارزیابی می‌کنند، سریع‌تر تغییرات لازم را می‌دهند.',
              howToUse: [
                'هر حوزه را از ۰ (بدترین) تا ۱۰ (بهترین) نمره بده',
                'به جای ایده‌آل‌ها، به واقعیت فعلی فکر کن',
                'بعد از ذخیره، به پایین‌ترین نمره توجه کن — اینجا باید انرژی بگذاری',
                'هر ماه یک بار این ارزیابی را تکرار کن تا تغییر را ببینی',
              ],
              expectedOutcome: 'شناسایی حوزه‌هایی که نادیده گرفتی و برنامه‌ریزی متوازن‌تر',
              timeToSeeResults: '۱ ماه',
              isNew: true,
            }}
          >
            <WheelOfLifeTool
              entries={state.wheelOfLife}
              onSave={entry => onUpdate(prev => ({ ...prev, wheelOfLife: [...prev.wheelOfLife, entry] }))}
            />
          </ToolShell>
        </TabsContent>

        <TabsContent value="values">
          <ToolShell
            guide={{
              toolId: 'values-map',
              icon: '💎',
              title: 'نقشه ارزش‌های شخصی',
              tagline: 'بدون ارزش‌های روشن، هر مسیری درست به نظر می‌رسد',
              whatIsIt: 'ارزش‌ها اصول بنیادینی هستند که رفتار و تصمیماتت را هدایت می‌کنند. وقتی زندگی‌ات با ارزش‌هایت همراستا باشد، احساس معنا و رضایت بیشتری داری.',
              scienceBehind: 'Value Clarification Therapy (Steven Hayes, ACT) نشان می‌دهد اکثر مشکلات روانشناختی از ناهماهنگی بین زندگی فعلی و ارزش‌های واقعی ناشی می‌شود. شناختن ارزش‌ها ۴۰٪ احتمال پیگیری اهداف را افزایش می‌دهد.',
              howToUse: [
                'از بین ارزش‌های لیست‌شده، آنهایی را که واقعاً برایت مهم‌اند انتخاب کن',
                'حداکثر ۱۰ ارزش را انتخاب کن — اگر همه چیز مهم باشد، هیچ چیز مهم نیست',
                'بعد از ذخیره، اهداف و عادت‌هایت را با این ارزش‌ها مقایسه کن',
                'هر ۳ ماه یک بار بازبینی کن — ارزش‌ها با گذر زمان تغییر می‌کنند',
              ],
              expectedOutcome: 'تصمیم‌گیری آسان‌تر و احساس صداقت با خود',
              timeToSeeResults: 'فوری در تصمیم‌گیری',
            }}
          >
            <ValuesTool
              values={state.personalValues}
              onSave={values => onUpdate(prev => ({ ...prev, personalValues: values }))}
            />
          </ToolShell>
        </TabsContent>

        <TabsContent value="personality">
          <ToolShell
            guide={{
              toolId: 'personality',
              icon: '🧠',
              title: 'پروفایل شخصیتی',
              tagline: 'بشناس نقاط قوت و الگوهای طبیعی‌ات',
              whatIsIt: 'سه مدل شخصیتی معروف را ترکیب کن: MBTI (سبک تفکر)، Big Five (پنج بعد شخصیت از علم روانشناسی)، و Enneagram (انگیزه‌های عمیق). هیچ‌کدام کامل نیستند، اما هر کدام جنبه‌ای متفاوت را روشن می‌کنند.',
              scienceBehind: 'Big Five (OCEAN) با بالاترین اعتبار علمی‌ترین مدل است. MBTI برای درک سبک کاری و Enneagram برای انگیزه‌های ناخودآگاه مفیدترند. ترکیب هر سه تصویر جامع‌تری می‌دهد.',
              howToUse: [
                'اگر قبلاً تست گرفتی، نتایج را اینجا وارد کن',
                'اگر نه، بر اساس شناختت از خودت انتخاب کن',
                'نتایج را برای تنظیم Pomodoro، نوع استراحت و سبک هدف‌گذاری استفاده کن',
                'این پروفایل در پیشنهادات سایر بخش‌های اپ تأثیر می‌گذارد',
              ],
              expectedOutcome: 'پیشنهادات شخصی‌سازی‌شده‌تر در سراسر اپ',
              timeToSeeResults: 'فوری',
            }}
          >
            <PersonalityTool
              profile={state.personalityProfile}
              onSave={profile => onUpdate(prev => ({ ...prev, personalityProfile: profile }))}
            />
          </ToolShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
