import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Rocket, Hammer, Star, BookOpen, ArrowRight,
  CheckCircle2, ChevronRight, Sparkles, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePsychState } from './psychology/storage';
import SelfAwareness      from './psychology/SelfAwareness';
import CBTTools           from './psychology/CBTTools';
import MotivationTools    from './psychology/MotivationTools';
import EmotionalIntelligence from './psychology/EmotionalIntelligence';
import BehavioralDesign   from './psychology/BehavioralDesign';
import ExistentialGrowth  from './psychology/ExistentialGrowth';

// ─── Module definitions ───────────────────────────────────────────────────────

interface PsychModule {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  theory: string;
  benefit: string;
  timeCommit: string;
  difficulty: 'آسان' | 'متوسط' | 'پیشرفته';
}

const MODULES: PsychModule[] = [
  {
    id: 'self-awareness',
    icon: '🪞', title: 'خودآگاهی', subtitle: 'چرخه زندگی، ارزش‌ها، شخصیت',
    color: '#6366f1',
    theory: 'Self-Determination Theory + Value Clarification',
    benefit: 'بدانی واقعاً کی هستی و چه می‌خواهی',
    timeCommit: '۱۵ دقیقه در هفته',
    difficulty: 'آسان',
  },
  {
    id: 'cbt',
    icon: '🧠', title: 'ابزارهای CBT', subtitle: 'ثبت افکار، تحریف‌ها، باورها',
    color: '#ef4444',
    theory: 'Cognitive Behavioral Therapy (Aaron Beck)',
    benefit: 'شناخت و بازسازی الگوهای فکری منفی',
    timeCommit: '۱۰ دقیقه در روز',
    difficulty: 'متوسط',
  },
  {
    id: 'motivation',
    icon: '🚀', title: 'انگیزه‌شناسی', subtitle: 'نیازهای بنیادین، تعهد اجرایی، ماتریس انرژی',
    color: '#f59e0b',
    theory: 'Self-Determination Theory + Implementation Intentions',
    benefit: 'انگیزه پایدار بدون نیاز به اراده مداوم',
    timeCommit: '۵ دقیقه در روز',
    difficulty: 'آسان',
  },
  {
    id: 'emotional',
    icon: '❤️', title: 'هوش هیجانی', subtitle: 'ثبت احساس، تنظیم هیجان، الگوها',
    color: '#ec4899',
    theory: 'Plutchik Wheel + DBT Emotion Regulation',
    benefit: 'احساسات را مدیریت کنی، نه سرکوب',
    timeCommit: '۳ دقیقه در روز',
    difficulty: 'آسان',
  },
  {
    id: 'behavioral',
    icon: '🏗️', title: 'طراحی رفتار', subtitle: 'زنجیره عادت، بسته‌سازی، پیش‌تعهد',
    color: '#10b981',
    theory: 'Atomic Habits + Temptation Bundling (Milkman)',
    benefit: 'رفتار مطلوب را با طراحی، نه اراده ایجاد کن',
    timeCommit: '۱۰ دقیقه در هفته',
    difficulty: 'متوسط',
  },
  {
    id: 'existential',
    icon: '🌌', title: 'رشد و معنا', subtitle: 'Ikigai، فصل‌های زندگی، ذهنیت رشد',
    color: '#8b5cf6',
    theory: 'Logotherapy (Frankl) + Growth Mindset (Dweck)',
    benefit: 'معنا و جهت بلندمدت پیدا کنی',
    timeCommit: '۳۰ دقیقه در ماه',
    difficulty: 'پیشرفته',
  },
];

// ─── Onboarding wizard ────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  {
    icon: '👋',
    title: 'خوش آمدی به بخش روانشناسی',
    body: 'این بخش بر اساس علم روانشناسی روز دنیا طراحی شده. اینجا ابزارهایی پیدا می‌کنی که درمانگران، مربیان و محققان برتر دنیا استفاده می‌کنند — همه در یک جا.',
    cta: 'ادامه',
  },
  {
    icon: '🎯',
    title: 'این بخش برای چه کسی است؟',
    body: 'برای کسی که می‌خواهد خودش را بهتر بشناسد، الگوهای مخرب را تغییر دهد، انگیزه‌اش را بفهمد، یا فقط می‌خواهد زندگی آگاهانه‌تری داشته باشد. نیاز به هیچ پیش‌زمینه روانشناختی نداری.',
    cta: 'ادامه',
  },
  {
    icon: '🗺️',
    title: '۶ لایه روانشناختی',
    body: 'از خودآگاهی تا معنا. هر لایه مستقل است — می‌توانی از هر جا شروع کنی. پیشنهاد ما: با «خودآگاهی» یا «هوش هیجانی» شروع کن — ساده‌ترین نقطه ورود هستند.',
    cta: 'ادامه',
  },
  {
    icon: '⏰',
    title: 'انتظارات واقعی',
    body: 'تغییر رفتاری ۶۶ روز طول می‌کشد (نه ۲۱ روز). تغییر باور ۱-۳ ماه. تغییر شخصیت ۶ ماه تا ۲ سال. این ابزارها کار می‌کنند — اما فقط اگر منظم استفاده کنی. حتی ۵ دقیقه در روز کافی است.',
    cta: 'شروع می‌کنم!',
  },
];

function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast  = step === ONBOARDING_STEPS.length - 1;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        className="max-w-lg w-full space-y-6 text-center px-4"
      >
        <div className="text-7xl">{current.icon}</div>
        <h2 className="text-2xl font-bold">{current.title}</h2>
        <p className="text-muted-foreground leading-relaxed text-base">{current.body}</p>

        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-primary w-6' : i < step ? 'bg-primary/40' : 'bg-muted'}`} />
          ))}
        </div>

        <Button
          size="lg"
          className="w-full max-w-xs mx-auto"
          onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
        >
          {current.cta}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← قبلی
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({
  module, active, onClick,
}: {
  module: PsychModule;
  active: boolean;
  onClick: () => void;
}) {
  const DIFF_COLOR = {
    'آسان': 'bg-green-500/10 text-green-600',
    'متوسط': 'bg-amber-500/10 text-amber-600',
    'پیشرفته': 'bg-red-500/10 text-red-600',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-start p-4 rounded-2xl border-2 transition-all ${
        active
          ? 'border-primary shadow-lg shadow-primary/10'
          : 'border-border/50 hover:border-primary/30'
      }`}
      style={active ? { backgroundColor: module.color + '08', borderColor: module.color } : {}}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl shrink-0">{module.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-sm">{module.title}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${DIFF_COLOR[module.difficulty]}`}>
              {module.difficulty}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{module.subtitle}</p>
          <p className="text-[11px] text-primary/70 mt-1">✓ {module.benefit}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">⏱ {module.timeCommit}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" style={{ color: active ? module.color : '' }} />
      </div>
    </motion.button>
  );
}

// ─── Main Psychology Component ────────────────────────────────────────────────

export default function Psychology() {
  const [state, setState] = usePsychState();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const onUpdate = (fn: (prev: typeof state) => typeof state) => setState(fn);

  // Show onboarding if not completed
  if (!state.onboarding.completed) {
    return (
      <OnboardingWizard
        onComplete={() => onUpdate(p => ({ ...p, onboarding: { ...p.onboarding, completed: true, startedAt: new Date().toISOString() } }))}
      />
    );
  }

  // If a module is active, render it
  if (activeModule) {
    const mod = MODULES.find(m => m.id === activeModule);
    return (
      <div className="space-y-4">
        {/* Back bar */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveModule(null)} className="gap-1.5">
            <ArrowRight className="w-4 h-4 rotate-180" />
            بازگشت به لیست
          </Button>
          {mod && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{mod.icon}</span>
              <span>{mod.title}</span>
            </div>
          )}
        </div>

        {/* Module content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {activeModule === 'self-awareness' && <SelfAwareness state={state} onUpdate={onUpdate} />}
            {activeModule === 'cbt'            && <CBTTools state={state} onUpdate={onUpdate} />}
            {activeModule === 'motivation'     && <MotivationTools state={state} onUpdate={onUpdate} />}
            {activeModule === 'emotional'      && <EmotionalIntelligence state={state} onUpdate={onUpdate} />}
            {activeModule === 'behavioral'     && <BehavioralDesign state={state} onUpdate={onUpdate} />}
            {activeModule === 'existential'    && <ExistentialGrowth state={state} onUpdate={onUpdate} />}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Module list (hub)
  const totalEntries =
    state.wheelOfLife.length + state.thoughtRecords.length + state.sdtAssessments.length +
    state.emotionEntries.length + state.habitStacks.length + state.growthMindsetLog.length;

  const daysActive = state.onboarding.startedAt
    ? Math.ceil((Date.now() - new Date(state.onboarding.startedAt).getTime()) / 86400000)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />روانشناسی و رشد فردی
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ابزارهای علمی برای شناخت و بهبود خودت
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => onUpdate(p => ({ ...p, onboarding: { ...p.onboarding, completed: false } }))}
        >
          راهنما
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'ورودی ثبت‌شده', value: totalEntries, color: 'text-primary' },
          { label: 'روز فعال',       value: daysActive,   color: 'text-green-500' },
          { label: 'ماژول فعال',     value: MODULES.length, color: 'text-violet-500' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick insight */}
      {state.sdtAssessments.length > 0 && (() => {
        const last = state.sdtAssessments.at(-1)!;
        const weakest = last.autonomy <= last.competence && last.autonomy <= last.relatedness ? 'خودمختاری'
                      : last.competence <= last.relatedness ? 'شایستگی' : 'ارتباط';
        return (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600">
            💡 بر اساس آخرین ارزیابی‌ات، «{weakest}» کمترین نمره را داشت. امروز روی آن تمرکز کن.
          </div>
        );
      })()}

      {/* Module grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">۶ لایه روانشناختی</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {MODULES.map(mod => (
            <ModuleCard
              key={mod.id}
              module={mod}
              active={false}
              onClick={() => setActiveModule(mod.id)}
            />
          ))}
        </div>
      </div>

      {/* Science note */}
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" />چرا این ابزارها کار می‌کنند؟</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            هر ابزار در این بخش بر اساس دهه‌ها تحقیق علمی است. CBT در بیش از ۵۰۰ مطالعه کنترل‌شده تأیید شده.
            Habit Stacking از مکانیزم‌های عصبی بهره می‌گیرد. SDT در ۳۰ سال تحقیق با هزاران شرکت‌کننده آزموده شده.
            این‌ها ابزارهای «خودیاری» نیستند — علم دقیق هستند.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
