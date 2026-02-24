import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolShell, SectionHeader, EmptyState, EntryCard, ScaleInput } from './ui';
import type { IkigaiMap, LifeChapter, GrowthMindsetEntry, SDTNeedAssessment, PsychologyState } from './types';

// ─── Ikigai ───────────────────────────────────────────────────────────────────
function IkigaiTool({ ikigai, onSave }: { ikigai: IkigaiMap; onSave: (i: IkigaiMap) => void }) {
  const [love, setLove]         = useState(ikigai.love.join('\n'));
  const [goodAt, setGoodAt]     = useState(ikigai.goodAt.join('\n'));
  const [world, setWorld]       = useState(ikigai.worldNeeds.join('\n'));
  const [paid, setPaid]         = useState(ikigai.paidFor.join('\n'));
  const [statement, setStmt]    = useState(ikigai.ikigaiStatement ?? '');

  const CIRCLES = [
    { key: 'love',  label: 'دوست داری', emoji: '❤️', color: '#ec4899', value: love, onChange: setLove, placeholder: 'فعالیت‌ها، موضوعاتی که عاشقشان هستی' },
    { key: 'goodAt',label: 'خوبی',      emoji: '💪', color: '#6366f1', value: goodAt, onChange: setGoodAt, placeholder: 'مهارت‌ها و توانمندی‌هایت' },
    { key: 'world', label: 'دنیا نیاز دارد', emoji: '🌍', color: '#10b981', value: world, onChange: setWorld, placeholder: 'مشکلاتی که دنیا به حلشان نیاز دارد' },
    { key: 'paid',  label: 'می‌توانی درآمد کنی', emoji: '💰', color: '#f59e0b', value: paid, onChange: setPaid, placeholder: 'کارهایی که مردم برایشان پول می‌دهند' },
  ];

  // Find overlaps for display
  const loveList  = love.split('\n').filter(Boolean);
  const goodList  = goodAt.split('\n').filter(Boolean);
  const worldList = world.split('\n').filter(Boolean);
  const paidList  = paid.split('\n').filter(Boolean);
  const passion   = loveList.filter(x => goodList.some(g => g.includes(x.slice(0,5)) || x.includes(g.slice(0,5))));
  const mission   = loveList.filter(x => worldList.some(w => w.includes(x.slice(0,5)) || x.includes(w.slice(0,5))));

  return (
    <div className="space-y-5">
      {/* Ikigai Venn visual */}
      <div className="grid grid-cols-2 gap-3">
        {CIRCLES.map(c => (
          <div key={c.key} className="p-3 rounded-2xl border-2" style={{ borderColor: c.color+'40', backgroundColor: c.color+'08' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: c.color }}>{c.emoji} {c.label}</p>
            <textarea value={c.value} onChange={e => c.onChange(e.target.value)}
              placeholder={c.placeholder} rows={3}
              className="w-full bg-transparent text-xs resize-none focus:outline-none text-muted-foreground placeholder:text-muted-foreground/40" />
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground">جمله Ikigai (تقاطع همه ۴ دایره)</label>
        <textarea value={statement} onChange={e => setStmt(e.target.value)}
          placeholder="دلیل وجودی‌ات چیست؟ در یک یا دو جمله بنویس…" rows={3}
          className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <Button onClick={() => onSave({ love: loveList, goodAt: goodList, worldNeeds: worldList, paidFor: paidList, ikigaiStatement: statement, updatedAt: new Date().toISOString() })} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ذخیره Ikigai
      </Button>

      {statement && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/20 text-center">
          <p className="text-xs text-muted-foreground mb-1">Ikigai شما</p>
          <p className="font-bold text-base leading-relaxed">{statement}</p>
        </div>
      )}
    </div>
  );
}

// ─── Life Chapters ────────────────────────────────────────────────────────────
function LifeChaptersTool({ chapters, onAdd }: { chapters: LifeChapter[]; onAdd: (c: LifeChapter) => void }) {
  const [title, setTitle]   = useState('');
  const [startAge, setStart] = useState(0);
  const [endAge, setEnd]    = useState<number|undefined>(undefined);
  const [theme, setTheme]   = useState('');
  const [lessons, setLess]  = useState('');
  const [identity, setIdent] = useState('');
  const [show, setShow]     = useState(false);

  const currentYear = new Date().getFullYear();
  const approximateAge = 28; // default

  return (
    <div className="space-y-4">
      {!show ? (
        <>
          <Button onClick={() => setShow(true)} className="w-full"><Plus className="w-4 h-4 mr-1.5" />اضافه کردن فصل جدید</Button>
          {chapters.length === 0 ? (
            <EmptyState icon="📖" message="فصل‌های زندگی‌ات را مرور کن. هر دوره چه درسی داد؟" onAction={() => setShow(true)} action="شروع از اول" />
          ) : (
            <div className="relative">
              {/* Timeline */}
              <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border/40" />
              <div className="space-y-4">
                {[...chapters].sort((a,b) => a.startAge - b.startAge).map((ch, i) => (
                  <div key={ch.id} className="relative pr-10">
                    <div className="absolute right-2.5 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <Card className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-bold">{ch.title}</p>
                            <p className="text-xs text-muted-foreground">سن {ch.startAge}{ch.endAge ? ` تا ${ch.endAge}` : ' تا الان'}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{ch.theme}</span>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {ch.lessons.length > 0 && <p>📚 {ch.lessons.join(' · ')}</p>}
                          {ch.identityFormed && <p>👤 هویت: {ch.identityFormed}</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setShow(false)}>← برگشت</Button>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">عنوان این فصل</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً: دوران دانشگاه · کودکی شاد · سال‌های سخت"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">از سن</label>
              <input type="number" value={startAge} onChange={e => setStart(+e.target.value)} min={0} max={100}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">تا سن (خالی = الان)</label>
              <input type="number" value={endAge ?? ''} onChange={e => setEnd(e.target.value ? +e.target.value : undefined)} min={0} max={100}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">تم اصلی این دوره</label>
            <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="مثلاً: جستجو · ساختن · از دست دادن"
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">درس‌هایی که آموختی (هر خط یک درس)</label>
            <textarea value={lessons} onChange={e => setLess(e.target.value)} rows={3}
              placeholder="چه چیزهایی یاد گرفتی؟" 
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">چه هویتی در این دوره شکل گرفت؟</label>
            <input value={identity} onChange={e => setIdent(e.target.value)} placeholder="کی شدی در این دوره؟"
              className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
          </div>
          <Button onClick={() => { if(!title) return; onAdd({ id: uuidv4(), title, startAge, endAge, theme, lessons: lessons.split('\n').filter(Boolean), identityFormed: identity, createdAt: new Date().toISOString() }); setShow(false); setTitle(''); setStart(0); setEnd(undefined); setTheme(''); setLess(''); setIdent(''); }} disabled={!title} className="w-full">
            <Save className="w-4 h-4 mr-1.5" />ذخیره فصل
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Growth Mindset Log ───────────────────────────────────────────────────────
function GrowthMindsetTool({ entries, onAdd }: { entries: GrowthMindsetEntry[]; onAdd: (e: GrowthMindsetEntry) => void }) {
  const [challenge, setChall] = useState('');
  const [fixed, setFixed]     = useState('');
  const [growth, setGrowth]   = useState('');
  const [lesson, setLesson]   = useState('');
  const [next, setNext]       = useState('');

  const REFRAME_PROMPTS = [
    { fixed: 'از پسش برنمیام', growth: 'هنوز یاد نگرفتم، در حال یادگیری هستم' },
    { fixed: 'در این زمینه استعداد ندارم', growth: 'تمرین کافی نکردم. استعداد با تلاش ساخته می‌شود' },
    { fixed: 'شکست خوردم', growth: 'داده جمع کردم. یاد گرفتم چه نکنم' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">نمونه‌های بازسازی</p>
        {REFRAME_PROMPTS.map((p, i) => (
          <div key={i} className="p-2.5 rounded-xl border border-border/50 text-xs">
            <p className="text-red-500">❌ {p.fixed}</p>
            <p className="text-green-500 mt-1">✅ {p.growth}</p>
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">چالش یا شکستی که اتفاق افتاد</label>
        <textarea value={challenge} onChange={e => setChall(e.target.value)} rows={2}
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">اولین فکر Fixed Mindset</label>
        <input value={fixed} onChange={e => setFixed(e.target.value)} placeholder='"نمی‌توانم"، "بی‌استعداد هستم"…'
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">بازسازی Growth Mindset</label>
        <input value={growth} onChange={e => setGrowth(e.target.value)} placeholder='"در حال یادگیری هستم"، "داده جمع کردم"…'
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">درس عملی</label>
        <input value={lesson} onChange={e => setLesson(e.target.value)} placeholder="یک چیز مشخص که یاد گرفتی"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">قدم بعدی</label>
        <input value={next} onChange={e => setNext(e.target.value)} placeholder="یک عمل کوچک برای ادامه دادن"
          className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none" />
      </div>
      <Button onClick={() => { if(!challenge) return; onAdd({ id: uuidv4(), date: new Date().toISOString().split('T')[0], challenge, fixedThought: fixed, growthReframe: growth, lessonLearned: lesson, nextStep: next }); setChall(''); setFixed(''); setGrowth(''); setLesson(''); setNext(''); }} disabled={!challenge} className="w-full">
        <Save className="w-4 h-4 mr-1.5" />ذخیره بازسازی
      </Button>
      {entries.length > 0 && (
        <div className="space-y-2">
          {[...entries].reverse().slice(0,5).map(e => (
            <EntryCard key={e.id} title={e.challenge} date={e.date} accentColor="#10b981">
              <div className="text-xs space-y-0.5 mt-1">
                <p className="text-red-400">❌ {e.fixedThought}</p>
                <p className="text-green-500">✅ {e.growthReframe}</p>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ExistentialGrowth({ state, onUpdate }: { state: PsychologyState; onUpdate: (fn: (p: PsychologyState) => PsychologyState) => void }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon="🌌" title="رشد و معنا" subtitle="چرا اینجایی؟ به کجا می‌روی؟" color="#8b5cf6" />
      <Tabs defaultValue="ikigai">
        <TabsList className="flex-wrap h-auto p-1 gap-1 mb-4">
          <TabsTrigger value="ikigai" className="text-xs sm:text-sm">⭕ Ikigai</TabsTrigger>
          <TabsTrigger value="chapters" className="text-xs sm:text-sm">📖 فصل‌های زندگی</TabsTrigger>
          <TabsTrigger value="mindset" className="text-xs sm:text-sm">🌱 ذهنیت رشد</TabsTrigger>
        </TabsList>
        <TabsContent value="ikigai">
          <ToolShell guide={{ toolId:'ikigai', icon:'⭕', title:'Ikigai — دلیل وجودی', tagline:'تقاطع دوست داشتن، مهارت، نیاز جهان و درآمد', whatIsIt:'Ikigai یک مفهوم ژاپنی است به معنای "دلیل برای بیدار شدن". در محل تلاقی چهار دایره است: آنچه دوست داری، آنچه خوب هستی، آنچه دنیا نیاز دارد، و آنچه می‌توانی برایش پول بگیری.', scienceBehind:'تحقیقات روی صدساله‌های اوکیناوا نشان داد Ikigai یک عامل کلیدی در طول عمر و سلامت روان است. افرادی با Ikigai روشن تا ۷ سال بیشتر عمر می‌کنند.', howToUse:['در هر دایره چند مورد بنویس بدون قضاوت','دنبال تقاطع بگرد','Ikigai‌ات را در یک جمله خلاصه کن','هر ۶ ماه بازبینی کن'], expectedOutcome:'وضوح در هدف زندگی و انگیزه پایدار درونی', timeToSeeResults:'۱-۲ ساعت تأمل' }}>
            <IkigaiTool ikigai={state.ikigai} onSave={i => onUpdate(p => ({ ...p, ikigai: i }))} />
          </ToolShell>
        </TabsContent>
        <TabsContent value="chapters">
          <ToolShell guide={{ toolId:'life-chapters', icon:'📖', title:'فصل‌های زندگی', tagline:'هر دوره زندگی درسی داشت', whatIsIt:'زندگی را به فصل‌هایی تقسیم کن. هر فصل یک دوره مشخص با تم، درس‌ها و هویتی که در آن شکل گرفت. این روایت‌پردازی کمک می‌کند معنای سفرت را ببینی.', scienceBehind:'Dan McAdams، روانشناس شخصیت، نشان داد "روایت زندگی" (Life Narrative) یکی از اصلی‌ترین عوامل هویت و سلامت روان است. افرادی که داستان منسجم‌تری از زندگی‌شان دارند، انعطاف بیشتری در بحران نشان می‌دهند.', howToUse:['از کودکی شروع کن','هر دوره با یک رویداد کلیدی یا تغییر جهت شروع می‌شود','درس‌ها را بدون سانسور بنویس','ببین چه الگوهایی تکرار می‌شود'], expectedOutcome:'درک عمیق‌تر از خودت و حس پیوستگی', timeToSeeResults:'در طول یک ماه کامل‌تر می‌شود' }}>
            <LifeChaptersTool chapters={state.lifeChapters} onAdd={c => onUpdate(p => ({ ...p, lifeChapters: [...p.lifeChapters, c] }))} />
          </ToolShell>
        </TabsContent>
        <TabsContent value="mindset">
          <ToolShell guide={{ toolId:'growth-mindset', icon:'🌱', title:'ذهنیت رشد (Growth Mindset)', tagline:'شکست داده نیست — داده است', whatIsIt:'ذهنیت ثابت (Fixed Mindset) می‌گوید استعداد ذاتی است. ذهنیت رشد (Growth Mindset) می‌گوید هر مهارتی با تلاش ساخته می‌شود. این باور تفاوت بزرگی در مسیر رشد ایجاد می‌کند.', scienceBehind:'Carol Dweck دهه‌ها تحقیق کرد و ثابت کرد که ذهنیت رشد قابل تغییر است. دانش‌آموزانی که ذهنیت رشد داشتند، ۴۰٪ بهتر از همتایان خود عمل کردند.', howToUse:['وقتی چیزی سخت یا ناموفق است، اینجا بیا','فکر اول (Fixed) را بنویس بدون سانسور','آن را به یک فکر رشد تبدیل کن','یک قدم کوچک بعدی تعریف کن'], expectedOutcome:'تبدیل شکست‌ها به سوخت پیشرفت', timeToSeeResults:'۳-۶ ماه تغییر ذهنیت' }}>
            <GrowthMindsetTool entries={state.growthMindsetLog} onAdd={e => onUpdate(p => ({ ...p, growthMindsetLog: [...p.growthMindsetLog, e] }))} />
          </ToolShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}
