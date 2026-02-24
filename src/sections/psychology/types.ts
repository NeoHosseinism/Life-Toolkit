// ═══════════════════════════════════════════════════════════════════════════
// PSYCHOLOGY MODULE — TYPE DEFINITIONS
// All data structures for the 10 psychological layers
// ═══════════════════════════════════════════════════════════════════════════

// ─── Onboarding ───────────────────────────────────────────────────────────────
export interface OnboardingState {
  completed: boolean;
  completedTools: string[];
  startedAt?: string;
  completedAt?: string;
}

// ─── 1. Self-Awareness ────────────────────────────────────────────────────────

export interface WheelOfLifeEntry {
  id: string;
  date: string;
  areas: Record<WheelArea, number>; // 0-10
  notes?: string;
}

export type WheelArea =
  | 'career' | 'finances' | 'health' | 'relationships'
  | 'family' | 'fun' | 'growth' | 'environment';

export interface PersonalValue {
  id: string;
  name: string;
  category: string;
  selected: boolean;
  rank?: number; // 1-10 for top values
}

export interface ValueAlignment {
  date: string;
  goalId?: string;
  taskId?: string;
  description: string;
  alignedValues: string[];
  score: number; // 1-5 how aligned
}

export type MBTILetter = 'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P';

export interface PersonalityProfile {
  mbti?: string; // e.g. "INTJ"
  bigFive?: {
    openness: number;       // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  enneagram?: number; // 1-9
  completedAt?: string;
  notes?: string;
}

// ─── 2. CBT Tools ────────────────────────────────────────────────────────────

export type CognitiveDistortion =
  | 'all-or-nothing'    // Black/white thinking
  | 'catastrophizing'   // Magnifying negatives
  | 'mind-reading'      // Assuming others' thoughts
  | 'fortune-telling'   // Predicting negative future
  | 'emotional-reasoning' // Feelings = facts
  | 'should-statements' // Rigid rules
  | 'labeling'          // Global negative labels
  | 'personalization'   // Blaming self for everything
  | 'discounting'       // Dismissing positives
  | 'overgeneralization'  // One event → always
  | 'mental-filter'     // Focus on one negative
  | 'magnification'     // Exaggerating flaws
  | 'jumping-conclusions'
  | 'blame'
  | 'unfair-comparison';

export interface ThoughtRecord {
  id: string;
  date: string;
  situation: string;       // What happened?
  automaticThought: string; // What thought appeared?
  emotions: string[];      // What emotions? (with intensity 0-100)
  emotionIntensity: number;
  distortions: CognitiveDistortion[];
  evidence_for: string;
  evidence_against: string;
  balancedThought: string; // Reframed thought
  moodAfter: number;       // 0-100
  createdAt: string;
}

export interface BeliefRecord {
  id: string;
  belief: string;          // "I'm not good enough"
  origin?: string;         // Where does it come from?
  impact: string;          // How does it limit you?
  challenge: string;       // What's the counter-evidence?
  newBelief: string;       // Empowering alternative
  strength: number;        // 0-100 how strongly you believe old belief
  createdAt: string;
  updatedAt: string;
}

// ─── 3. Motivational Psychology ──────────────────────────────────────────────

export type MotivationType = 'intrinsic' | 'extrinsic' | 'identified' | 'introjected' | 'amotivation';

export interface SDTNeedAssessment {
  id: string;
  date: string;
  autonomy: number;      // 0-10 — feeling of choice & volition
  competence: number;    // 0-10 — feeling of effectiveness
  relatedness: number;   // 0-10 — feeling of connection
  notes?: string;
}

export interface ImplementationIntention {
  id: string;
  goalDescription: string;
  whenCondition: string;   // "When X happens..."
  thenAction: string;      // "...I will do Y"
  location?: string;
  linkedHabitId?: string;
  active: boolean;
  successCount: number;
  createdAt: string;
}

export interface EnergyTask {
  id: string;
  title: string;
  energyRequired: 'low' | 'high';
  interestLevel: 'low' | 'high';
  bestTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  date: string;
  createdAt: string;
}

// ─── 4. Emotional Intelligence ────────────────────────────────────────────────

export type EmotionFamily =
  | 'joy' | 'trust' | 'fear' | 'surprise'
  | 'sadness' | 'disgust' | 'anger' | 'anticipation';

export interface EmotionEntry {
  id: string;
  date: string;
  time: string;
  primaryEmotion: EmotionFamily;
  specificEmotion: string;     // e.g. "melancholy", "serenity"
  intensity: number;           // 0-100
  trigger?: string;
  bodyLocation?: string;       // Where do you feel it?
  regulationUsed?: string;
  notes?: string;
}

export interface TriggerPattern {
  id: string;
  trigger: string;             // What triggers it
  category: 'sleep' | 'social' | 'work' | 'food' | 'exercise' | 'environment' | 'other';
  resultingEmotion: string;
  frequency: number;           // times detected
  lastSeen: string;
}

export interface RegulationTechnique {
  id: string;
  name: string;
  category: 'cognitive' | 'somatic' | 'behavioral' | 'social';
  bestFor: EmotionFamily[];
  steps: string[];
  timeRequired: number; // minutes
  effectiveness?: number; // user-rated 0-5
}

// ─── 5. Growth Psychology ────────────────────────────────────────────────────

export type ZPDZone = 'boredom' | 'flow' | 'anxiety';

export interface SkillPracticeSession {
  id: string;
  skillId: string;
  date: string;
  duration: number;            // minutes
  focusArea: string;           // What specific aspect?
  method: string;              // How did you practice?
  feedback: string;            // What feedback did you get/notice?
  adjustment: string;          // What will you adjust?
  zpd: ZPDZone;
  quality: number;             // 1-5
}

export interface GrowthMindsetEntry {
  id: string;
  date: string;
  challenge: string;           // What happened?
  fixedThought: string;        // Initial fixed mindset thought
  growthReframe: string;       // Reframed growth mindset thought
  lessonLearned: string;
  nextStep: string;
}

export interface PTGEntry {
  id: string;
  date: string;
  adversity: string;           // What difficult experience?
  domain: 'relationships' | 'possibilities' | 'strength' | 'spirituality' | 'appreciation';
  growth: string;              // What grew from it?
  meaning: string;             // What meaning do you make of it?
}

// ─── 6. Behavioral Design ────────────────────────────────────────────────────

export interface HabitStack {
  id: string;
  anchor: string;              // Existing habit (cue)
  newHabit: string;            // New behavior
  reward?: string;
  linkedHabitId?: string;
  active: boolean;
  successRate: number;         // 0-100
  createdAt: string;
}

export interface TemptationBundle {
  id: string;
  task: string;                // Unpleasant task
  pleasure: string;            // Only allowed during task
  active: boolean;
  lastUsed?: string;
  createdAt: string;
}

export interface EnvironmentDesign {
  id: string;
  goal: string;
  frictionReducers: string[];  // Make good behavior easier
  frictionAdders: string[];    // Make bad behavior harder
  cues: string[];              // Visual/environmental cues
  completed: boolean;
  createdAt: string;
}

export interface PreCommitment {
  id: string;
  goal: string;
  commitment: string;          // Specific commitment
  consequence: string;         // What happens if you fail
  deadline: string;
  witnessName?: string;
  status: 'active' | 'kept' | 'broken';
  createdAt: string;
}

// ─── 7. Social Psychology ────────────────────────────────────────────────────

export type SupportType = 'emotional' | 'practical' | 'informational' | 'appraisal';

export interface RelationshipContact {
  id: string;
  name: string;
  relationship: string;        // friend, mentor, family…
  supportTypes: SupportType[];
  lastContact?: string;
  idealFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  notes?: string;
  createdAt: string;
}

export interface AccountabilityCheck {
  id: string;
  partnerId?: string;
  date: string;
  commitment: string;
  kept: boolean;
  reflection: string;
  createdAt: string;
}

// ─── 8. Existential ──────────────────────────────────────────────────────────

export interface IkigaiMap {
  love: string[];              // What you love
  goodAt: string[];            // What you're good at
  worldNeeds: string[];        // What the world needs
  paidFor: string[];           // What you can be paid for
  ikigaiStatement?: string;    // The intersection
  updatedAt: string;
}

export interface LifeChapter {
  id: string;
  title: string;
  startAge: number;
  endAge?: number;
  theme: string;               // Core theme of this period
  lessons: string[];           // Key lessons learned
  identityFormed: string;      // Who did you become?
  createdAt: string;
}

export interface LegacyEntry {
  id: string;
  question: string;
  answer: string;
  date: string;
}

// ─── 9. Neuroscience ─────────────────────────────────────────────────────────

export interface UltradianCycle {
  id: string;
  date: string;
  startTime: string;
  peakMinutes: number;         // How many peak minutes?
  restMinutes: number;         // How many rest minutes?
  focusQuality: number;        // 1-5
  peakActivity: string;        // What did during peak
  restActivity: string;        // What did during rest
}

export interface StressRecoveryLog {
  id: string;
  date: string;
  stressEvents: string[];      // What was stressful
  stressLevel: number;         // 0-10
  recoveryActivities: string[];
  recoveryQuality: number;     // 0-10
  netBalance: number;          // stress - recovery (computed)
  notes?: string;
}

// ─── Complete Psychology State ────────────────────────────────────────────────

export interface PsychologyState {
  onboarding: OnboardingState;
  // Layer 1 — Self-Awareness
  wheelOfLife: WheelOfLifeEntry[];
  personalValues: PersonalValue[];
  valueAlignments: ValueAlignment[];
  personalityProfile: PersonalityProfile;
  // Layer 2 — CBT
  thoughtRecords: ThoughtRecord[];
  beliefRecords: BeliefRecord[];
  // Layer 3 — Motivation
  sdtAssessments: SDTNeedAssessment[];
  implementationIntentions: ImplementationIntention[];
  energyTasks: EnergyTask[];
  // Layer 4 — Emotional Intelligence
  emotionEntries: EmotionEntry[];
  triggerPatterns: TriggerPattern[];
  // Layer 5 — Growth
  practiceLog: SkillPracticeSession[];
  growthMindsetLog: GrowthMindsetEntry[];
  ptgEntries: PTGEntry[];
  // Layer 6 — Behavioral Design
  habitStacks: HabitStack[];
  temptationBundles: TemptationBundle[];
  environmentDesigns: EnvironmentDesign[];
  preCommitments: PreCommitment[];
  // Layer 7 — Social
  relationships: RelationshipContact[];
  accountabilityChecks: AccountabilityCheck[];
  // Layer 8 — Existential
  ikigai: IkigaiMap;
  lifeChapters: LifeChapter[];
  legacyEntries: LegacyEntry[];
  // Layer 9 — Neuroscience
  ultradianCycles: UltradianCycle[];
  stressRecoveryLog: StressRecoveryLog[];
}

export const DEFAULT_PSYCHOLOGY_STATE: PsychologyState = {
  onboarding: { completed: false, completedTools: [] },
  wheelOfLife: [],
  personalValues: [],
  valueAlignments: [],
  personalityProfile: {},
  thoughtRecords: [],
  beliefRecords: [],
  sdtAssessments: [],
  implementationIntentions: [],
  energyTasks: [],
  emotionEntries: [],
  triggerPatterns: [],
  practiceLog: [],
  growthMindsetLog: [],
  ptgEntries: [],
  habitStacks: [],
  temptationBundles: [],
  environmentDesigns: [],
  preCommitments: [],
  relationships: [],
  accountabilityChecks: [],
  ikigai: { love: [], goodAt: [], worldNeeds: [], paidFor: [], updatedAt: new Date().toISOString() },
  lifeChapters: [],
  legacyEntries: [],
  ultradianCycles: [],
  stressRecoveryLog: [],
};
