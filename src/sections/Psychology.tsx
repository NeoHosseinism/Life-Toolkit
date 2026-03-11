import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Rocket, Hammer, Star, BookOpen, ArrowRight,
  CheckCircle2, ChevronRight, Sparkles, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
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
  title: { fa: string; en: string };
  subtitle: { fa: string; en: string };
  color: string;
  theory: string;
  benefit: { fa: string; en: string };
  timeCommit: { fa: string; en: string };
  difficulty: { fa: 'آسان' | 'متوسط' | 'پیشرفته'; en: 'Easy' | 'Medium' | 'Advanced' };
}

const MODULES: PsychModule[] = [
  {
    id: 'self-awareness',
    icon: '🪞',
    title: { fa: 'خودآگاهی', en: 'Self-Awareness' },
    subtitle: { fa: 'چرخه زندگی، ارزش‌ها، شخصیت', en: 'Life Wheel, Values & Personality' },
    color: '#6366f1',
    theory: 'Self-Determination Theory + Value Clarification',
    benefit: { fa: 'بدانی واقعاً کی هستی و چه می‌خواهی', en: 'Know who you truly are and what you want' },
    timeCommit: { fa: '۱۵ دقیقه در هفته', en: '15 min / week' },
    difficulty: { fa: 'آسان', en: 'Easy' },
  },
  {
    id: 'cbt',
    icon: '🧠',
    title: { fa: 'ابزارهای CBT', en: 'CBT Tools' },
    subtitle: { fa: 'ثبت افکار، تحریف‌ها، باورها', en: 'Thought Records, Distortions & Beliefs' },
    color: '#ef4444',
    theory: 'Cognitive Behavioral Therapy (Aaron Beck)',
    benefit: { fa: 'شناخت و بازسازی الگوهای فکری منفی', en: 'Identify and reshape negative thought patterns' },
    timeCommit: { fa: '۱۰ دقیقه در روز', en: '10 min / day' },
    difficulty: { fa: 'متوسط', en: 'Medium' },
  },
  {
    id: 'motivation',
    icon: '🚀',
    title: { fa: 'انگیزه‌شناسی', en: 'Motivation Science' },
    subtitle: { fa: 'نیازهای بنیادین، تعهد اجرایی، ماتریس انرژی', en: 'Core Needs, Implementation Intentions & Energy Matrix' },
    color: '#f59e0b',
    theory: 'Self-Determination Theory + Implementation Intentions',
    benefit: { fa: 'انگیزه پایدار بدون نیاز به اراده مداوم', en: 'Sustainable motivation without constant willpower' },
    timeCommit: { fa: '۵ دقیقه در روز', en: '5 min / day' },
    difficulty: { fa: 'آسان', en: 'Easy' },
  },
  {
    id: 'emotional',
    icon: '❤️',
    title: { fa: 'هوش هیجانی', en: 'Emotional Intelligence' },
    subtitle: { fa: 'ثبت احساس، تنظیم هیجان، الگوها', en: 'Emotion Tracking, Regulation & Patterns' },
    color: '#ec4899',
    theory: 'Plutchik Wheel + DBT Emotion Regulation',
    benefit: { fa: 'احساسات را مدیریت کنی، نه سرکوب', en: 'Manage emotions rather than suppress them' },
    timeCommit: { fa: '۳ دقیقه در روز', en: '3 min / day' },
    difficulty: { fa: 'آسان', en: 'Easy' },
  },
  {
    id: 'behavioral',
    icon: '🏗️',
    title: { fa: 'طراحی رفتار', en: 'Behavioral Design' },
    subtitle: { fa: 'زنجیره عادت، بسته‌سازی، پیش‌تعهد', en: 'Habit Stacking, Bundling & Pre-commitment' },
    color: '#10b981',
    theory: 'Atomic Habits + Temptation Bundling (Milkman)',
    benefit: { fa: 'رفتار مطلوب را با طراحی، نه اراده ایجاد کن', en: 'Build desired behavior through design, not willpower' },
    timeCommit: { fa: '۱۰ دقیقه در هفته', en: '10 min / week' },
    difficulty: { fa: 'متوسط', en: 'Medium' },
  },
  {
    id: 'existential',
    icon: '🌌',
    title: { fa: 'رشد و معنا', en: 'Growth & Meaning' },
    subtitle: { fa: 'Ikigai، فصل‌های زندگی، ذهنیت رشد', en: 'Ikigai, Life Seasons & Growth Mindset' },
    color: '#8b5cf6',
    theory: 'Logotherapy (Frankl) + Growth Mindset (Dweck)',
    benefit: { fa: 'معنا و جهت بلندمدت پیدا کنی', en: 'Find long-term meaning and direction' },
    timeCommit: { fa: '۳۰ دقیقه در ماه', en: '30 min / month' },
    difficulty: { fa: 'پیشرفته', en: 'Advanced' },
  },
];

// ─── Onboarding wizard ────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  {
    icon: '👋',
    title: { fa: 'خوش آمدی به بخش روانشناسی', en: 'Welcome to Psychology' },
    body: { fa: 'این بخش بر اساس علم روانشناسی روز دنیا طراحی شده. اینجا ابزارهایی پیدا می‌کنی که درمانگران، مربیان و محققان برتر دنیا استفاده می‌کنند — همه در یک جا.', en: 'This section is built on modern psychological science. Here you\'ll find tools that top therapists, coaches, and researchers use — all in one place.' },
    cta: { fa: 'ادامه', en: 'Continue' },
  },
  {
    icon: '🎯',
    title: { fa: 'این بخش برای چه کسی است؟', en: 'Who is this for?' },
    body: { fa: 'برای کسی که می‌خواهد خودش را بهتر بشناسد، الگوهای مخرب را تغییر دهد، انگیزه‌اش را بفهمد، یا فقط می‌خواهد زندگی آگاهانه‌تری داشته باشد. نیاز به هیچ پیش‌زمینه روانشناختی نداری.', en: 'For anyone who wants to know themselves better, change destructive patterns, understand their motivation, or simply live more intentionally. No psychology background needed.' },
    cta: { fa: 'ادامه', en: 'Continue' },
  },
  {
    icon: '🗺️',
    title: { fa: '۶ لایه روانشناختی', en: '6 Psychological Layers' },
    body: { fa: 'از خودآگاهی تا معنا. هر لایه مستقل است — می‌توانی از هر جا شروع کنی. پیشنهاد ما: با «خودآگاهی» یا «هوش هیجانی» شروع کن — ساده‌ترین نقطه ورود هستند.', en: 'From self-awareness to meaning. Each layer is independent — you can start anywhere. Recommendation: begin with Self-Awareness or Emotional Intelligence — the easiest entry points.' },
    cta: { fa: 'ادامه', en: 'Continue' },
  },
  {
    icon: '⏰',
    title: { fa: 'انتظارات واقعی', en: 'Realistic Expectations' },
    body: { fa: 'تغییر رفتاری ۶۶ روز طول می‌کشد (نه ۲۱ روز). تغییر باور ۱-۳ ماه. تغییر شخصیت ۶ ماه تا ۲ سال. این ابزارها کار می‌کنند — اما فقط اگر منظم استفاده کنی. حتی ۵ دقیقه در روز کافی است.', en: 'Behavioral change takes 66 days (not 21). Belief change: 1-3 months. Personality change: 6 months–2 years. These tools work — but only with consistent use. Even 5 minutes a day is enough.' },
    cta: { fa: 'شروع می‌کنم!', en: "Let's Start!" },
  },
];

function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const { language, isRTL } = useLanguage();
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
        <h2 className="text-xl sm:text-2xl font-bold">{language === 'fa' ? current.title.fa : current.title.en}</h2>
        <p className="text-muted-foreground leading-relaxed text-base">{language === 'fa' ? current.body.fa : current.body.en}</p>

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
          {language === 'fa' ? current.cta.fa : current.cta.en}
          <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
        </Button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {isRTL ? '← قبلی' : '← Back'}
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
  const { language } = useLanguage();
  const isFa = language === 'fa';

  const DIFF_COLOR = {
    'آسان':  'bg-green-500/10 text-green-600',
    'متوسط': 'bg-amber-500/10 text-amber-600',
    'پیشرفته': 'bg-red-500/10 text-red-600',
    'Easy':   'bg-green-500/10 text-green-600',
    'Medium': 'bg-amber-500/10 text-amber-600',
    'Advanced': 'bg-red-500/10 text-red-600',
  };

  const diffLabel = isFa ? module.difficulty.fa : module.difficulty.en;

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
            <p className="font-bold text-sm">{isFa ? module.title.fa : module.title.en}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${DIFF_COLOR[diffLabel]}`}>
              {diffLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{isFa ? module.subtitle.fa : module.subtitle.en}</p>
          <p className="text-[11px] text-primary/70 mt-1">✓ {isFa ? module.benefit.fa : module.benefit.en}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">⏱ {isFa ? module.timeCommit.fa : module.timeCommit.en}</p>
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
  const { language, isRTL } = useLanguage();
  const isFa = language === 'fa';

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
            <ArrowRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
            {isFa ? 'بازگشت به لیست' : 'Back to list'}
          </Button>
          {mod && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{mod.icon}</span>
              <span>{isFa ? mod.title.fa : mod.title.en}</span>
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
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            {isFa ? 'روانشناسی و رشد فردی' : 'Psychology & Personal Growth'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isFa ? 'ابزارهای علمی برای شناخت و بهبود خودت' : 'Science-based tools for self-knowledge and improvement'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => onUpdate(p => ({ ...p, onboarding: { ...p.onboarding, completed: false } }))}
        >
          {isFa ? 'راهنما' : 'Guide'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: isFa ? 'ورودی ثبت‌شده' : 'Entries', value: totalEntries, color: 'text-primary' },
          { label: isFa ? 'روز فعال' : 'Days Active', value: daysActive,   color: 'text-green-500' },
          { label: isFa ? 'ماژول فعال' : 'Modules',   value: MODULES.length, color: 'text-violet-500' },
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
        const weakestFa = last.autonomy <= last.competence && last.autonomy <= last.relatedness ? 'خودمختاری'
                        : last.competence <= last.relatedness ? 'شایستگی' : 'ارتباط';
        const weakestEn = last.autonomy <= last.competence && last.autonomy <= last.relatedness ? 'Autonomy'
                        : last.competence <= last.relatedness ? 'Competence' : 'Relatedness';
        return (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600">
            {isFa
              ? `💡 بر اساس آخرین ارزیابی‌ات، «${weakestFa}» کمترین نمره را داشت. امروز روی آن تمرکز کن.`
              : `💡 Based on your last assessment, «${weakestEn}» scored lowest. Focus on it today.`
            }
          </div>
        );
      })()}

      {/* Module grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {isFa ? '۶ لایه روانشناختی' : '6 Psychological Layers'}
        </h3>
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
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            {isFa ? 'چرا این ابزارها کار می‌کنند؟' : 'Why do these tools work?'}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isFa
              ? 'هر ابزار در این بخش بر اساس دهه‌ها تحقیق علمی است. CBT در بیش از ۵۰۰ مطالعه کنترل‌شده تأیید شده. Habit Stacking از مکانیزم‌های عصبی بهره می‌گیرد. SDT در ۳۰ سال تحقیق با هزاران شرکت‌کننده آزموده شده. این‌ها ابزارهای «خودیاری» نیستند — علم دقیق هستند.'
              : 'Every tool here is backed by decades of research. CBT is validated in 500+ controlled studies. Habit Stacking leverages neural mechanisms. SDT has been tested over 30 years with thousands of participants. These are not "self-help" — they are rigorous science.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
