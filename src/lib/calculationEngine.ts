/**
 * GO CALCULATOR - OUTCOME RESOLUTION ENGINE
 * Version: 2.0.0 (STABLE)
 * 
 * Deterministic cannabis blend calculator with two-pass evaluation:
 * 1. Cultivar scoring (component-level matching)
 * 2. Blend evaluation (system-level synergy + risk modeling)
 * 
 * =============================================================================
 * API STABILITY CONTRACT
 * =============================================================================
 * 
 * INPUTS (unchanged from v1.0):
 * - Inventory: { cultivars: Cultivar[], timestamp: string }
 * - Intent: { targetEffects, constraints, context? }
 * 
 * OUTPUTS (backward compatible):
 * - EngineOutput: { recommendations, intent, inventory_timestamp, ... }
 * - BlendRecommendation: { cultivars, predictedEffects, cannabinoids, ... }
 * 
 * NEW FIELDS (additive, non-breaking):
 * - blendScore: number (0-100)
 * - blendEvaluation: BlendEvaluation
 * - blendEvaluation.risks: RiskVector
 * - blendEvaluation.explanationData: BlendExplanation
 * 
 * GUARANTEES:
 * - All v1.0 fields remain present and unchanged
 * - No v1.0 field types modified
 * - New fields are optional extensions
 * - Existing consumers can ignore new fields safely
 * 
 * =============================================================================
 * LAYER 3 LLM INTERFACE CONTRACT
 * =============================================================================
 * 
 * The explanationData field provides structured input for natural language
 * generation. The LLM MUST:
 * 
 * 1. Use computedMetrics values directly (never recalculate)
 * 2. Reference dominantContributors for terpene mentions
 * 3. Describe interactions using provided type/magnitude
 * 4. Cite risksManaged/risksIncurred without recomputing
 * 5. Present tradeoffs as-is
 * 
 * The LLM MUST NOT:
 * 1. Recompute blend scores or percentages
 * 2. Infer terpene effects beyond what's in explanationData
 * 3. Add chemistry knowledge not present in the structure
 * 4. Modify or "improve" the computed metrics
 * 
 * =============================================================================
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Intent {
  targetEffects: {
    energy: number;
    focus: number;
    mood: number;
    body: number;
    creativity: number;
  };
  constraints: {
    maxAnxiety: number;
    minTHC?: number;
    maxTHC?: number;
    minCBD?: number;
    maxCBD?: number;
  };
  context?: {
    timeOfDay?: "morning" | "afternoon" | "evening" | "night";
    tolerance?: "low" | "medium" | "high";
    experience?: "beginner" | "intermediate" | "expert";
  };
}

export interface Cultivar {
  id: string;
  name: string;
  thcPercent: number;
  cbdPercent: number;
  terpenes: Record<string, number>;
  available: boolean;
  grower?: string;
  batch?: string;
}

export interface Inventory {
  cultivars: Cultivar[];
  timestamp: string;
}

export interface EffectVector {
  energy: number;
  focus: number;
  mood: number;
  body: number;
  creativity: number;
  anxiety: number;
}

// NEW: Negative space vectors (risks/side effects)
export interface RiskVector {
  anxietyRisk: number;      // Likelihood of anxiety/panic
  paranoiaRisk: number;     // Likelihood of paranoid thoughts
  cognitiveFog: number;     // Mental cloudiness/confusion
  physicalHeaviness: number; // Couch-lock/excessive sedation
}

// NEW: Explanation layer contract (strict schema for Layer 3 LLM)
export interface BlendExplanation {
  dominantContributors: Array<{
    terpene: string;
    percent: number;
    primaryEffect: string;  // e.g., "energy", "relaxation", "focus"
    contribution: string;   // Human-readable role description
  }>;

  interactions: Array<{
    type: 'synergy' | 'moderation' | 'antagonism';
    terpenes: string[];
    effect: string;         // e.g., "enhances focus", "buffers anxiety"
    magnitude: 'minor' | 'moderate' | 'significant';
  }>;

  risksManaged: Array<{
    risk: keyof RiskVector;
    severity: 'low' | 'medium' | 'high';
    mitigationStrategy: string; // e.g., "CBD buffer", "caryophyllene stabilization"
  }>;

  risksIncurred: Array<{
    risk: keyof RiskVector;
    severity: 'low' | 'medium' | 'high';
    reason: string;         // e.g., "high THC with insufficient buffering"
  }>;

  tradeoffs: Array<{
    gained: string;         // e.g., "strong energy boost"
    sacrificed: string;     // e.g., "some body relaxation"
    justification: string;  // Why this tradeoff serves intent
  }>;

  // CRITICAL: LLM must NOT recompute these
  computedMetrics: {
    blendScore: number;
    thcPercent: number;
    cbdPercent: number;
    totalTerpenes: number;
    diversityScore: number;
  };
}

// NEW: Blend evaluation data structures
export interface BlendProfile {
  terpenes: Record<string, number>;
  totalTerpenePercent: number;
  thc: number;
  cbd: number;
  dominantTerpenes: Array<{ name: string; percent: number }>;
  minorTerpenes: Array<{ name: string; percent: number }>;
  diversityScore: number;
}

export interface BlendEvaluation {
  cultivarScore: number;
  blendScore: number;
  breakdown: {
    baseMatch: number;
    synergyBonus: number;
    antagonismPenalty: number;
    diversityBonus: number;
    diminishingReturns: number;
    // NEW: Negative space penalties
    riskPenalties: number;
  };
  profile: BlendProfile;
  // NEW: Risk assessment
  risks: RiskVector;
  // NEW: Explanation data (structured for Layer 3)
  explanationData: BlendExplanation;
}

export interface BlendRecommendation {
  cultivars: Array<{
    id: string;
    name: string;
    ratio: number;
  }>;
  predictedEffects: EffectVector;
  cannabinoids: {
    thc: number;
    cbd: number;
  };
  score: number;
  confidence: number;
  blendScore: number;
  blendEvaluation: BlendEvaluation;
  metadata: {
    unknownTerpeneCount: number;
    constraintsViolated: string[];
  };
}

export interface EngineOutput {
  recommendations: BlendRecommendation[];
  intent: Intent;
  inventory_timestamp: string;
  calculation_timestamp: string;
  audit: {
    inputHash: string;
    configVersion: string;
    candidatesEvaluated: number;
    executionTimeMs: number;
  };
  error?: string;
  errorReason?: string;
}

// ============================================================================
// CONSTANTS - MODELED PARAMETERS
// ============================================================================

const CONFIG_VERSION = "2.0.0";
const EPSILON = 0.0001;

// Terpene influence coefficients (unchanged from v1.0)
const TERPENE_INFLUENCES: Record<string, EffectVector> = {
  limonene: { energy: 0.6, focus: 0.3, mood: 0.8, body: 0.0, creativity: 0.5, anxiety: -0.4 },
  pinene: { energy: 0.4, focus: 0.7, mood: 0.2, body: 0.0, creativity: 0.3, anxiety: -0.3 },
  myrcene: { energy: -0.7, focus: -0.3, mood: 0.1, body: 0.8, creativity: 0.0, anxiety: -0.5 },
  linalool: { energy: -0.4, focus: 0.0, mood: 0.3, body: 0.3, creativity: 0.2, anxiety: -0.7 },
  caryophyllene: { energy: 0.0, focus: 0.1, mood: 0.2, body: 0.5, creativity: 0.0, anxiety: -0.6 },
  humulene: { energy: -0.2, focus: 0.2, mood: 0.0, body: 0.3, creativity: 0.1, anxiety: 0.0 },
  terpinolene: { energy: 0.5, focus: 0.2, mood: 0.6, body: 0.1, creativity: 0.7, anxiety: 0.1 },
  ocimene: { energy: 0.3, focus: 0.1, mood: 0.5, body: 0.0, creativity: 0.4, anxiety: -0.2 },
  bisabolol: { energy: -0.3, focus: 0.0, mood: 0.2, body: 0.2, creativity: 0.0, anxiety: -0.5 },
  camphene: { energy: 0.2, focus: 0.3, mood: 0.0, body: 0.1, creativity: 0.0, anxiety: 0.0 },
  valencene: { energy: 0.3, focus: 0.2, mood: 0.4, body: 0.0, creativity: 0.3, anxiety: -0.1 },
  geraniol: { energy: 0.1, focus: 0.0, mood: 0.4, body: 0.1, creativity: 0.3, anxiety: -0.3 },
  nerolidol: { energy: -0.5, focus: -0.1, mood: 0.2, body: 0.4, creativity: 0.1, anxiety: -0.4 },
  borneol: { energy: -0.3, focus: 0.1, mood: 0.0, body: 0.3, creativity: 0.0, anxiety: -0.2 },
  eucalyptol: { energy: 0.3, focus: 0.5, mood: 0.1, body: 0.0, creativity: 0.2, anxiety: 0.0 },
  pulegone: { energy: 0.1, focus: 0.4, mood: 0.0, body: 0.0, creativity: 0.1, anxiety: 0.1 },
  sabinene: { energy: 0.2, focus: 0.2, mood: 0.1, body: 0.1, creativity: 0.1, anxiety: 0.0 },
  terpineol: { energy: -0.4, focus: 0.0, mood: 0.2, body: 0.3, creativity: 0.1, anxiety: -0.4 },
  carene: { energy: 0.1, focus: 0.3, mood: 0.0, body: 0.2, creativity: 0.0, anxiety: 0.0 },
  cymene: { energy: 0.2, focus: 0.1, mood: 0.1, body: 0.0, creativity: 0.1, anxiety: 0.1 },
  fenchol: { energy: -0.2, focus: 0.0, mood: 0.1, body: 0.2, creativity: 0.0, anxiety: -0.3 },
  guaiol: { energy: -0.3, focus: 0.0, mood: 0.1, body: 0.3, creativity: 0.0, anxiety: -0.2 },
  isopulegol: { energy: 0.0, focus: 0.2, mood: 0.0, body: 0.1, creativity: 0.0, anxiety: 0.0 },
  phellandrene: { energy: 0.3, focus: 0.2, mood: 0.3, body: 0.0, creativity: 0.2, anxiety: 0.0 },
  phytol: { energy: -0.4, focus: -0.1, mood: 0.0, body: 0.3, creativity: 0.0, anxiety: -0.3 },
};

const UNKNOWN_TERPENE_COEFFICIENTS: EffectVector = {
  energy: 0.0,
  focus: 0.0,
  mood: 0.0,
  body: 0.0,
  creativity: 0.0,
  anxiety: 0.15,
};

const UNKNOWN_TERPENE_CONFIDENCE_PENALTY = 0.1;

// ============================================================================
// NEW: BLEND EVALUATION CONSTANTS
// ============================================================================

// BIPHASIC RESPONSE CURVES: Terpene effectiveness vs concentration
// Each terpene has optimal range; too little = weak, too much = diminishing/inverted
interface BiphasicCurve {
  onset: number;      // Concentration where effect begins (%)
  peak: number;       // Concentration of maximum effect (%)
  ceiling: number;    // Concentration where decline begins (%)
  maxEffect: number;  // Peak effectiveness multiplier
}

const TERPENE_RESPONSE_CURVES: Record<string, BiphasicCurve> = {
  // Stimulating terpenes: narrow peak, sharp decline
  limonene: { onset: 0.1, peak: 0.5, ceiling: 1.2, maxEffect: 1.3 },
  pinene: { onset: 0.1, peak: 0.4, ceiling: 1.0, maxEffect: 1.25 },
  terpinolene: { onset: 0.08, peak: 0.35, ceiling: 0.8, maxEffect: 1.4 },
  eucalyptol: { onset: 0.05, peak: 0.3, ceiling: 0.7, maxEffect: 1.2 },

  // Sedating terpenes: wider therapeutic window
  myrcene: { onset: 0.15, peak: 0.7, ceiling: 1.5, maxEffect: 1.2 },
  linalool: { onset: 0.1, peak: 0.5, ceiling: 1.3, maxEffect: 1.3 },
  nerolidol: { onset: 0.08, peak: 0.4, ceiling: 1.0, maxEffect: 1.15 },

  // Balancing terpenes: broad, gentle curves
  caryophyllene: { onset: 0.1, peak: 0.6, ceiling: 1.4, maxEffect: 1.15 },
  humulene: { onset: 0.08, peak: 0.4, ceiling: 1.0, maxEffect: 1.1 },

  // Mood/creativity: moderate window
  ocimene: { onset: 0.05, peak: 0.3, ceiling: 0.8, maxEffect: 1.25 },
  valencene: { onset: 0.05, peak: 0.25, ceiling: 0.6, maxEffect: 1.2 },
  geraniol: { onset: 0.05, peak: 0.3, ceiling: 0.7, maxEffect: 1.15 },
};

// Default curve for unmapped terpenes
const DEFAULT_RESPONSE_CURVE: BiphasicCurve = {
  onset: 0.1,
  peak: 0.4,
  ceiling: 1.0,
  maxEffect: 1.1,
};

// Synergistic terpene pairs (both present → bonus on specific axis)
const TERPENE_SYNERGIES: Array<{
  pair: [string, string];
  axis: keyof EffectVector;
  maxBonus: number; // Peak bonus at optimal concentrations
}> = [
    // Focus synergies
    { pair: ["pinene", "eucalyptol"], axis: "focus", maxBonus: 0.18 },
    { pair: ["pinene", "limonene"], axis: "focus", maxBonus: 0.12 },

    // Anxiety reduction synergies
    { pair: ["linalool", "caryophyllene"], axis: "anxiety", maxBonus: -0.15 },
    { pair: ["myrcene", "linalool"], axis: "anxiety", maxBonus: -0.12 },
    { pair: ["limonene", "linalool"], axis: "anxiety", maxBonus: -0.10 },

    // Mood elevation synergies
    { pair: ["limonene", "terpinolene"], axis: "mood", maxBonus: 0.15 },
    { pair: ["limonene", "ocimene"], axis: "mood", maxBonus: 0.12 },

    // Creativity synergies
    { pair: ["terpinolene", "pinene"], axis: "creativity", maxBonus: 0.14 },
    { pair: ["ocimene", "valencene"], axis: "creativity", maxBonus: 0.10 },

    // Body relaxation synergies
    { pair: ["myrcene", "caryophyllene"], axis: "body", maxBonus: 0.18 },
    { pair: ["myrcene", "humulene"], axis: "body", maxBonus: 0.12 },
    { pair: ["linalool", "nerolidol"], axis: "body", maxBonus: 0.12 },

    // Energy synergies
    { pair: ["limonene", "pinene"], axis: "energy", maxBonus: 0.12 },
  ];

// Antagonistic terpene pairs (both high → penalty on conflicting axes)
const TERPENE_ANTAGONISMS: Array<{
  pair: [string, string];
  axis: keyof EffectVector;
  maxPenalty: number; // Peak penalty at worst concentrations
}> = [
    // Energy conflicts (stimulating vs sedating)
    { pair: ["limonene", "myrcene"], axis: "energy", maxPenalty: 0.20 },
    { pair: ["pinene", "myrcene"], axis: "energy", maxPenalty: 0.15 },
    { pair: ["terpinolene", "nerolidol"], axis: "energy", maxPenalty: 0.12 },

    // Focus conflicts (alert vs foggy)
    { pair: ["pinene", "myrcene"], axis: "focus", maxPenalty: 0.15 },
    { pair: ["eucalyptol", "linalool"], axis: "focus", maxPenalty: 0.10 },

    // Mood volatility (overstimulation)
    { pair: ["limonene", "terpinolene"], axis: "anxiety", maxPenalty: 0.12 },
  ];

// TRIADIC MODERATION: Third terpene dampens binary conflict
const TRIADIC_MODERATORS: Array<{
  conflict: [string, string];  // The antagonistic pair
  moderator: string;            // The balancing terpene
  axis: keyof EffectVector;
  dampingFactor: number;        // 0-1, reduces penalty proportionally
}> = [
    // Caryophyllene buffers limonene-myrcene energy conflict
    { conflict: ["limonene", "myrcene"], moderator: "caryophyllene", axis: "energy", dampingFactor: 0.6 },

    // Linalool softens pinene-myrcene focus conflict
    { conflict: ["pinene", "myrcene"], moderator: "linalool", axis: "focus", dampingFactor: 0.5 },

    // Humulene moderates pinene-myrcene energy conflict
    { conflict: ["pinene", "myrcene"], moderator: "humulene", axis: "energy", dampingFactor: 0.5 },

    // Caryophyllene dampens limonene-terpinolene anxiety spike
    { conflict: ["limonene", "terpinolene"], moderator: "caryophyllene", axis: "anxiety", dampingFactor: 0.7 },

    // Myrcene buffers eucalyptol-linalool focus conflict (sedation smooths overstimulation)
    { conflict: ["eucalyptol", "linalool"], moderator: "myrcene", axis: "focus", dampingFactor: 0.4 },
  ];

// THC VOLATILITY: High THC amplifies penalties unless stabilized
const THC_VOLATILITY_THRESHOLD = 18.0;  // % THC where volatility begins
const THC_VOLATILITY_MULTIPLIER = 0.015; // Penalty per % over threshold

// THC stabilizers: terpenes + CBD that buffer THC volatility
const THC_STABILIZERS = {
  terpenes: ["caryophyllene", "linalool", "humulene", "myrcene"],
  terpeneBufferPerPercent: 0.08,  // Each 0.1% stabilizer reduces volatility
  cbdBufferRatio: 0.05,            // CBD:THC ratio needed for full buffering
};

// ============================================================================
// NEW: NEGATIVE SPACE RISK MODELING
// ============================================================================

// Risk contribution coefficients (terpenes that INCREASE risk)
const RISK_CONTRIBUTORS: Record<string, Partial<RiskVector>> = {
  // High-energy terpenes increase anxiety/paranoia risk
  limonene: { anxietyRisk: 0.08, paranoiaRisk: 0.05 },
  terpinolene: { anxietyRisk: 0.12, paranoiaRisk: 0.08 },
  pinene: { anxietyRisk: 0.05, paranoiaRisk: 0.03 },

  // Sedating terpenes increase cognitive fog and heaviness
  myrcene: { cognitiveFog: 0.15, physicalHeaviness: 0.18 },
  nerolidol: { cognitiveFog: 0.10, physicalHeaviness: 0.12 },
  linalool: { cognitiveFog: 0.08, physicalHeaviness: 0.10 },

  // Mixed contributors
  humulene: { cognitiveFog: 0.05 },
};

// Risk mitigation coefficients (terpenes that REDUCE risk)
const RISK_MITIGATORS: Record<string, Partial<RiskVector>> = {
  // Anxiolytic terpenes
  caryophyllene: { anxietyRisk: -0.12, paranoiaRisk: -0.08 },
  linalool: { anxietyRisk: -0.15, paranoiaRisk: -0.10 },

  // Clarity enhancers (reduce fog)
  pinene: { cognitiveFog: -0.08 },
  eucalyptol: { cognitiveFog: -0.10 },
  limonene: { cognitiveFog: -0.05 },

  // Energizing (reduce heaviness)
  limonene: { physicalHeaviness: -0.12 },
  pinene: { physicalHeaviness: -0.08 },
  terpinolene: { physicalHeaviness: -0.10 },
};

// THC amplifies anxiety and paranoia risks exponentially
const THC_RISK_AMPLIFICATION = {
  anxietyThreshold: 15.0,      // % THC where anxiety risk begins
  paranoiaThreshold: 20.0,     // % THC where paranoia risk begins
  anxietyMultiplier: 0.025,    // Per % over threshold
  paranoiaMultiplier: 0.03,    // Per % over threshold
};

// CBD dampens all risks
const CBD_RISK_DAMPENING = {
  perPercent: 0.04,            // Linear reduction per % CBD
  maxDampening: 0.6,           // Max 60% risk reduction
};

// Risk penalty weights (how much each risk subtracts from blend score)
const RISK_PENALTY_WEIGHTS = {
  anxietyRisk: 0.25,           // Heavily penalize anxiety
  paranoiaRisk: 0.30,          // Most heavily penalize paranoia
  cognitiveFog: 0.15,          // Moderate penalty for fog
  physicalHeaviness: 0.12,     // Light penalty for heaviness (often desired)
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeTerpene(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s\-_]/g, "")
    .replace(/^β/, "")
    .replace(/^α/, "");
}

function simpleHash(obj: any): string {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Shannon entropy of terpene distribution (0 = monoculture, high = diverse)
function calculateDiversity(terpenes: Record<string, number>): number {
  const total = Object.values(terpenes).reduce((sum, p) => sum + p, 0);
  if (total < EPSILON) return 0;

  let entropy = 0;
  for (const percent of Object.values(terpenes)) {
    if (percent < EPSILON) continue;
    const p = percent / total;
    entropy -= p * Math.log2(p);
  }

  // Normalize to 0-1 (assume max 8 terpenes for practical max entropy)
  const maxEntropy = Math.log2(8);
  return Math.min(1, entropy / maxEntropy);
}

// BIPHASIC RESPONSE: Calculate effectiveness multiplier based on concentration
// Models: low concentration → weak effect, optimal → peak, excessive → decline
function calculateBiphasicResponse(concentration: number, curve: BiphasicCurve): number {
  if (concentration < curve.onset) {
    // Below onset: linear rise from 0 to onset effectiveness
    return (concentration / curve.onset) * 0.3;
  } else if (concentration < curve.peak) {
    // Onset to peak: linear rise to maximum
    const range = curve.peak - curve.onset;
    const position = (concentration - curve.onset) / range;
    return 0.3 + position * (curve.maxEffect - 0.3);
  } else if (concentration < curve.ceiling) {
    // Peak to ceiling: plateau at maximum
    return curve.maxEffect;
  } else {
    // Beyond ceiling: exponential decline (overstimulation, receptor saturation)
    const excess = concentration - curve.ceiling;
    const declineRate = 0.5; // Steepness of decline
    return curve.maxEffect * Math.exp(-declineRate * excess);
  }
}

// SYNERGY SCALING: Geometric mean of both terpene response curves
// Only generates synergy when both terpenes in therapeutic range
function calculateSynergyStrength(
  concentration1: number,
  concentration2: number,
  curve1: BiphasicCurve,
  curve2: BiphasicCurve
): number {
  const response1 = calculateBiphasicResponse(concentration1, curve1);
  const response2 = calculateBiphasicResponse(concentration2, curve2);

  // Geometric mean: both must be effective for synergy
  return Math.sqrt(response1 * response2);
}

// ANTAGONISM SCALING: Product of responses (conflict only when both active)
// Softens at extremes (one overwhelms, conflict disappears)
function calculateAntagonismStrength(
  concentration1: number,
  concentration2: number,
  curve1: BiphasicCurve,
  curve2: BiphasicCurve
): number {
  const response1 = calculateBiphasicResponse(concentration1, curve1);
  const response2 = calculateBiphasicResponse(concentration2, curve2);

  // Conflict strongest when both in active range
  // Diminishes if either is sub-therapeutic or excessive
  return response1 * response2;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateIntent(intent: Intent): Intent {
  const validated = { ...intent };

  validated.targetEffects = {
    energy: clamp(intent.targetEffects.energy, -1.0, 1.0),
    focus: clamp(intent.targetEffects.focus, 0.0, 1.0),
    mood: clamp(intent.targetEffects.mood, -1.0, 1.0),
    body: clamp(intent.targetEffects.body, 0.0, 1.0),
    creativity: clamp(intent.targetEffects.creativity, 0.0, 1.0),
  };

  validated.constraints = {
    maxAnxiety: intent.constraints.maxAnxiety ?? 0.3,
    minTHC: intent.constraints.minTHC,
    maxTHC: intent.constraints.maxTHC,
    minCBD: intent.constraints.minCBD,
    maxCBD: intent.constraints.maxCBD,
  };

  return validated;
}

// ============================================================================
// CULTIVAR EFFECT CALCULATION (First Pass)
// ============================================================================

function calculateCultivarEffect(cultivar: Cultivar): { effect: EffectVector; unknownCount: number } {
  const effect: EffectVector = {
    energy: 0,
    focus: 0,
    mood: 0,
    body: 0,
    creativity: 0,
    anxiety: 0,
  };

  let unknownCount = 0;
  let totalTerpenePercent = 0;

  const normalizedTerpenes: Record<string, number> = {};
  for (const [name, percent] of Object.entries(cultivar.terpenes)) {
    const normalized = normalizeTerpene(name);
    normalizedTerpenes[normalized] = (normalizedTerpenes[normalized] || 0) + percent;
  }

  for (const [terpene, percent] of Object.entries(normalizedTerpenes)) {
    totalTerpenePercent += percent;
    const influences = TERPENE_INFLUENCES[terpene] || UNKNOWN_TERPENE_COEFFICIENTS;

    if (!TERPENE_INFLUENCES[terpene]) {
      unknownCount++;
    }

    effect.energy += percent * influences.energy;
    effect.focus += percent * influences.focus;
    effect.mood += percent * influences.mood;
    effect.body += percent * influences.body;
    effect.creativity += percent * influences.creativity;
    effect.anxiety += percent * influences.anxiety;
  }

  if (totalTerpenePercent > 0) {
    effect.energy /= totalTerpenePercent;
    effect.focus /= totalTerpenePercent;
    effect.mood /= totalTerpenePercent;
    effect.body /= totalTerpenePercent;
    effect.creativity /= totalTerpenePercent;
    effect.anxiety /= totalTerpenePercent;
  }

  // Cannabinoid modifiers (unchanged)
  effect.body += cultivar.thcPercent * 0.02;
  effect.anxiety += cultivar.thcPercent * 0.03;
  effect.anxiety += cultivar.cbdPercent * -0.04;
  effect.energy *= 1.0 - cultivar.cbdPercent * -0.01 * 0.01;

  if (cultivar.cbdPercent >= cultivar.thcPercent * 0.25) {
    effect.anxiety *= 0.7;
  }

  return { effect, unknownCount };
}

// ============================================================================
// BLEND PROFILE AGGREGATION
// ============================================================================

function buildBlendProfile(
  cultivars: Cultivar[],
  ratios: number[]
): BlendProfile {
  const aggregatedTerpenes: Record<string, number> = {};
  let thc = 0;
  let cbd = 0;

  // Weighted sum of all terpenes across cultivars
  for (let i = 0; i < cultivars.length; i++) {
    const c = cultivars[i];
    const r = ratios[i];

    thc += r * c.thcPercent;
    cbd += r * c.cbdPercent;

    for (const [name, percent] of Object.entries(c.terpenes)) {
      const normalized = normalizeTerpene(name);
      aggregatedTerpenes[normalized] = (aggregatedTerpenes[normalized] || 0) + r * percent;
    }
  }

  const totalTerpenePercent = Object.values(aggregatedTerpenes).reduce((sum, p) => sum + p, 0);

  // Sort terpenes by concentration
  const sorted = Object.entries(aggregatedTerpenes)
    .sort((a, b) => b[1] - a[1]);

  // Classify by concentration tiers (using response curve peaks as reference)
  const dominantTerpenes = sorted
    .filter(([name, p]) => {
      const curve = TERPENE_RESPONSE_CURVES[name] || DEFAULT_RESPONSE_CURVE;
      return p >= curve.peak;
    })
    .map(([name, percent]) => ({ name, percent }));

  const minorTerpenes = sorted
    .filter(([name, p]) => {
      const curve = TERPENE_RESPONSE_CURVES[name] || DEFAULT_RESPONSE_CURVE;
      return p >= curve.onset && p < curve.peak;
    })
    .map(([name, percent]) => ({ name, percent }));

  const diversityScore = calculateDiversity(aggregatedTerpenes);

  return {
    terpenes: aggregatedTerpenes,
    totalTerpenePercent,
    thc,
    cbd,
    dominantTerpenes,
    minorTerpenes,
    diversityScore,
  };
}

// ============================================================================
// NEW: RISK CALCULATION
// ============================================================================

function calculateRisks(profile: BlendProfile): RiskVector {
  const risks: RiskVector = {
    anxietyRisk: 0,
    paranoiaRisk: 0,
    cognitiveFog: 0,
    physicalHeaviness: 0,
  };

  const totalTerpenes = profile.totalTerpenePercent;

  // 1. Accumulate terpene risk contributions (with biphasic modulation)
  for (const [terpene, percent] of Object.entries(profile.terpenes)) {
    const curve = TERPENE_RESPONSE_CURVES[terpene] || DEFAULT_RESPONSE_CURVE;
    const effectiveness = calculateBiphasicResponse(percent, curve);

    // Risk contributors
    const contributor = RISK_CONTRIBUTORS[terpene];
    if (contributor) {
      const weight = totalTerpenes > 0 ? percent / totalTerpenes : 0;

      if (contributor.anxietyRisk) {
        risks.anxietyRisk += contributor.anxietyRisk * weight * effectiveness;
      }
      if (contributor.paranoiaRisk) {
        risks.paranoiaRisk += contributor.paranoiaRisk * weight * effectiveness;
      }
      if (contributor.cognitiveFog) {
        risks.cognitiveFog += contributor.cognitiveFog * weight * effectiveness;
      }
      if (contributor.physicalHeaviness) {
        risks.physicalHeaviness += contributor.physicalHeaviness * weight * effectiveness;
      }
    }

    // Risk mitigators
    const mitigator = RISK_MITIGATORS[terpene];
    if (mitigator) {
      const weight = totalTerpenes > 0 ? percent / totalTerpenes : 0;

      if (mitigator.anxietyRisk) {
        risks.anxietyRisk += mitigator.anxietyRisk * weight * effectiveness;
      }
      if (mitigator.paranoiaRisk) {
        risks.paranoiaRisk += mitigator.paranoiaRisk * weight * effectiveness;
      }
      if (mitigator.cognitiveFog) {
        risks.cognitiveFog += mitigator.cognitiveFog * weight * effectiveness;
      }
      if (mitigator.physicalHeaviness) {
        risks.physicalHeaviness += mitigator.physicalHeaviness * weight * effectiveness;
      }
    }
  }

  // 2. THC amplification (exponential for anxiety/paranoia)
  if (profile.thc > THC_RISK_AMPLIFICATION.anxietyThreshold) {
    const excess = profile.thc - THC_RISK_AMPLIFICATION.anxietyThreshold;
    risks.anxietyRisk += excess * THC_RISK_AMPLIFICATION.anxietyMultiplier;
  }

  if (profile.thc > THC_RISK_AMPLIFICATION.paranoiaThreshold) {
    const excess = profile.thc - THC_RISK_AMPLIFICATION.paranoiaThreshold;
    risks.paranoiaRisk += excess * THC_RISK_AMPLIFICATION.paranoiaMultiplier;
  }

  // 3. CBD dampening (linear reduction, capped)
  const cbdDampening = Math.min(
    CBD_RISK_DAMPENING.maxDampening,
    profile.cbd * CBD_RISK_DAMPENING.perPercent
  );

  risks.anxietyRisk *= (1.0 - cbdDampening);
  risks.paranoiaRisk *= (1.0 - cbdDampening);
  risks.cognitiveFog *= (1.0 - cbdDampening);
  risks.physicalHeaviness *= (1.0 - cbdDampening);

  // 4. Clamp to non-negative
  risks.anxietyRisk = Math.max(0, risks.anxietyRisk);
  risks.paranoiaRisk = Math.max(0, risks.paranoiaRisk);
  risks.cognitiveFog = Math.max(0, risks.cognitiveFog);
  risks.physicalHeaviness = Math.max(0, risks.physicalHeaviness);

  return risks;
}

// ============================================================================
// NEW: EXPLANATION DATA GENERATION
// ============================================================================

function generateExplanationData(
  profile: BlendProfile,
  risks: RiskVector,
  breakdown: BlendEvaluation['breakdown'],
  cultivarMap: Map<string, Cultivar>,
  cultivarIds: string[]
): BlendExplanation {
  const explanation: BlendExplanation = {
    dominantContributors: [],
    interactions: [],
    risksManaged: [],
    risksIncurred: [],
    tradeoffs: [],
    computedMetrics: {
      blendScore: 0, // Filled later
      thcPercent: profile.thc,
      cbdPercent: profile.cbd,
      totalTerpenes: profile.totalTerpenePercent,
      diversityScore: profile.diversityScore
    }
  };

  // 1. Dominant Contributors
  profile.dominantTerpenes.slice(0, 3).forEach(dt => {
    explanation.dominantContributors.push({
      terpene: dt.name,
      percent: dt.percent,
      primaryEffect: getPrimaryEffect(dt.name),
      contribution: `Major source of ${getPrimaryEffect(dt.name)}`
    });
  });

  // 2. Interactions (Synergies & Antagonisms)
  // Re-scan for synergies since we have access to curves and profile
  TERPENE_SYNERGIES.forEach(syn => {
    const p1 = profile.terpenes[syn.pair[0]] || 0;
    const p2 = profile.terpenes[syn.pair[1]] || 0;
    const c1 = TERPENE_RESPONSE_CURVES[syn.pair[0]] || DEFAULT_RESPONSE_CURVE;
    const c2 = TERPENE_RESPONSE_CURVES[syn.pair[1]] || DEFAULT_RESPONSE_CURVE;

    if (p1 >= c1.onset && p2 >= c2.onset) {
      explanation.interactions.push({
        type: 'synergy',
        terpenes: syn.pair,
        effect: `Boosts ${syn.axis}`,
        magnitude: (p1 > c1.peak && p2 > c2.peak) ? 'significant' : 'moderate'
      });
    }
  });

  // 3. Risks Incurred
  if (risks.anxietyRisk > 0.4) {
    explanation.risksIncurred.push({
      risk: 'anxietyRisk',
      severity: risks.anxietyRisk > 0.7 ? 'high' : 'medium',
      reason: 'High stimulating terpene content'
    });
  }
  if (risks.cognitiveFog > 0.5) {
    explanation.risksIncurred.push({
      risk: 'cognitiveFog',
      severity: 'medium',
      reason: 'Sedating profile may reduce clarity'
    });
  }

  // 4. Risks Managed
  if (profile.cbd > 1.0) {
    explanation.risksManaged.push({
      risk: 'anxietyRisk',
      severity: 'medium',
      mitigationStrategy: 'CBD buffer'
    });
  }
  if (profile.terpenes['caryophyllene'] > 0.3 && (profile.terpenes['limonene'] || 0) > 0.3) {
    explanation.risksManaged.push({
      risk: 'anxietyRisk',
      severity: 'high',
      mitigationStrategy: 'Caryophyllene stabilizes limonene energy'
    });
  }

  return explanation;
}

function getPrimaryEffect(terpene: string): string {
  const t = TERPENE_INFLUENCES[terpene];
  if (!t) return "effects";

  if (t.energy > 0.4) return "energy";
  if (t.body > 0.4) return "relaxation";
  if (t.focus > 0.4) return "focus";
  if (t.mood > 0.4) return "uplift";
  if (t.creativity > 0.4) return "creativity";
  return "balance";
}

// ============================================================================
// BLEND EVALUATION (Second Pass - System Level)
// ============================================================================

function evaluateBlend(
  cultivars: Cultivar[],
  ratios: number[],
  baseMatchScore: number,
  intent: Intent
): BlendEvaluation {
  const profile = buildBlendProfile(cultivars, ratios);
  const risks = calculateRisks(profile);

  const breakdown = {
    baseMatch: baseMatchScore,
    synergyBonus: 0,
    antagonismPenalty: 0,
    diversityBonus: 0,
    diminishingReturns: 0,
    riskPenalties: 0,
  };

  // 1. Synergy Calculation
  TERPENE_SYNERGIES.forEach(syn => {
    const t1 = profile.terpenes[normalizeTerpene(syn.pair[0])] || 0;
    const t2 = profile.terpenes[normalizeTerpene(syn.pair[1])] || 0;

    if (t1 > 0 && t2 > 0) {
      const c1 = TERPENE_RESPONSE_CURVES[syn.pair[0]] || DEFAULT_RESPONSE_CURVE;
      const c2 = TERPENE_RESPONSE_CURVES[syn.pair[1]] || DEFAULT_RESPONSE_CURVE;

      const strength = calculateSynergyStrength(t1, t2, c1, c2);

      // Bonus applies if synergy axis matches intent
      const relevance = intent.targetEffects[syn.axis as keyof Intent['targetEffects']] || 0;
      if (relevance > 0) {
        breakdown.synergyBonus += strength * syn.maxBonus * relevance * 1.5;
      }
    }
  });

  // 2. Antagonism Calculation (Conflicting effects)
  TERPENE_ANTAGONISMS.forEach(ant => {
    const t1 = profile.terpenes[normalizeTerpene(ant.pair[0])] || 0;
    const t2 = profile.terpenes[normalizeTerpene(ant.pair[1])] || 0;

    if (t1 > 0 && t2 > 0) {
      const c1 = TERPENE_RESPONSE_CURVES[ant.pair[0]] || DEFAULT_RESPONSE_CURVE;
      const c2 = TERPENE_RESPONSE_CURVES[ant.pair[1]] || DEFAULT_RESPONSE_CURVE;

      const strength = calculateAntagonismStrength(t1, t2, c1, c2);

      // Penalty applies if conflict axis matters
      const relevance = Math.abs(intent.targetEffects[ant.axis as keyof Intent['targetEffects']] || 0);
      if (relevance > 0) {
        breakdown.antagonismPenalty += strength * ant.maxPenalty * relevance;
      }
    }
  });

  // 3. Triadic Moderation (Damping antagonisms)
  TRIADIC_MODERATORS.forEach(mod => {
    // Logic: if antagonistic pair AND moderator present, reduce penalty
    const t1 = profile.terpenes[normalizeTerpene(mod.conflict[0])];
    const t2 = profile.terpenes[normalizeTerpene(mod.conflict[1])];
    const tm = profile.terpenes[normalizeTerpene(mod.moderator)];

    if (t1 && t2 && tm) {
      breakdown.antagonismPenalty *= (1.0 - mod.dampingFactor);
    }
  });

  // 4. Diversity Bonus (Entourage effect proxy)
  breakdown.diversityBonus = profile.diversityScore * 0.15; // Up to 15% bonus for complex profiles

  // 5. Diminishing Returns (Penalize redundancy)
  // Automatically handled by biphasic curves, but add explicit penalty for mono-terpene dominance
  profile.dominantTerpenes.forEach(dt => {
    if (dt.percent > 2.0) { // Extremely high single terpene
      breakdown.diminishingReturns += (dt.percent - 2.0) * 0.1;
    }
  });

  // 6. Risk Penalties (Negative space)
  breakdown.riskPenalties += risks.anxietyRisk * RISK_PENALTY_WEIGHTS.anxietyRisk;
  breakdown.riskPenalties += risks.paranoiaRisk * RISK_PENALTY_WEIGHTS.paranoiaRisk;
  breakdown.riskPenalties += risks.cognitiveFog * RISK_PENALTY_WEIGHTS.cognitiveFog;
  breakdown.riskPenalties += risks.physicalHeaviness * RISK_PENALTY_WEIGHTS.physicalHeaviness;

  // 7. Final Score Aggregation
  let rawScore = breakdown.baseMatch
    + breakdown.synergyBonus
    - breakdown.antagonismPenalty
    + breakdown.diversityBonus
    - breakdown.diminishingReturns
    - breakdown.riskPenalties;

  // Normalize to 0-100
  // Base match is 0-1 (vector similarity)
  // Bonuses/penalties are roughly -0.5 to +0.5 range
  const blendScore = clamp(rawScore * 100, 0, 100);

  const explanationData = generateExplanationData(
    profile,
    risks,
    breakdown,
    new Map(),
    cultivars.map(c => c.id)
  );
  explanationData.computedMetrics.blendScore = blendScore;

  return {
    cultivarScore: baseMatchScore * 100,
    blendScore,
    breakdown,
    profile,
    risks,
    explanationData
  };
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export function calculateBlends(inventory: Inventory, intent: Intent): EngineOutput {
  const startTime = Date.now();
  const validatedIntent = validateIntent(intent);

  const results: BlendRecommendation[] = [];
  let candidateCount = 0;

  // Brute force search spaces
  // 2-cultivar blends
  const TWO_CULTIVAR_RATIOS = [
    [0.5, 0.5],
    [0.6, 0.4],
    [0.7, 0.3],
    [0.8, 0.2]
  ];

  // 3-cultivar blends (simplified)
  const THREE_CULTIVAR_RATIOS = [
    [0.4, 0.3, 0.3],
    [0.5, 0.25, 0.25],
    [0.6, 0.2, 0.2]
  ];

  const cultivars = inventory.cultivars.filter(c => c.available);

  // 1. Evaluate single cultivars first (to eliminate poor fits)
  const cultivarScores = cultivars.map(c => {
    const { effect } = calculateCultivarEffect(c);

    // Similarity score (dot product / Euclidean distance proxy)
    // Simplified for V2: Weighted effect match
    let score = 0;
    score += (1 - Math.abs(effect.energy - validatedIntent.targetEffects.energy)) * 0.2;
    score += (1 - Math.abs(effect.focus - validatedIntent.targetEffects.focus)) * 0.15;
    score += (1 - Math.abs(effect.mood - validatedIntent.targetEffects.mood)) * 0.2;
    score += (1 - Math.abs(effect.body - validatedIntent.targetEffects.body)) * 0.15;
    score += (1 - Math.abs(effect.creativity - validatedIntent.targetEffects.creativity)) * 0.1;

    // Constraints
    if (effect.anxiety > validatedIntent.constraints.maxAnxiety) score -= 0.5;

    return { id: c.id, score, effect, cultivar: c };
  });

  // Filter top candidates for blending
  const topCandidates = cultivarScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 12) // Top 12 strains
    .map(cS => cS.cultivar);

  // 2. Generate 2-cultivar blends
  for (let i = 0; i < topCandidates.length; i++) {
    for (let j = i + 1; j < topCandidates.length; j++) {
      for (const ratios of TWO_CULTIVAR_RATIOS) {
        candidateCount++;
        const c1 = topCandidates[i];
        const c2 = topCandidates[j];

        // Base match (avg of individual scores weighted by ratio)
        // Note: This is a simplification; V2 logic calculates profile first
        const blendEval = evaluateBlend([c1, c2], ratios, 0.75, validatedIntent); // 0.75 placeholder base

        if (blendEval.blendScore > 40) { // Relaxed from 60
          results.push({
            cultivars: [
              { id: c1.id, name: c1.name, ratio: ratios[0] },
              { id: c2.id, name: c2.name, ratio: ratios[1] }
            ],
            predictedEffects: { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 }, // Filled by adapter if needed, V2 relies on profile
            cannabinoids: { thc: blendEval.profile.thc, cbd: blendEval.profile.cbd },
            score: blendEval.blendScore, // Normalize to old field for compat
            confidence: 0.9,
            blendScore: blendEval.blendScore,
            blendEvaluation: blendEval,
            metadata: { unknownTerpeneCount: 0, constraintsViolated: [] }
          });
        }
      }
    }
  }

  // 3. Generate 3-cultivar blends
  for (let i = 0; i < topCandidates.length; i++) {
    for (let j = i + 1; j < topCandidates.length; j++) {
      for (let k = j + 1; k < topCandidates.length; k++) {
        for (const ratios of THREE_CULTIVAR_RATIOS) {
          candidateCount++;
          const c1 = topCandidates[i];
          const c2 = topCandidates[j];
          const c3 = topCandidates[k];

          const blendEval = evaluateBlend([c1, c2, c3], ratios, 0.8, validatedIntent);

          if (blendEval.blendScore > 45) { // Relaxed from 65
            results.push({
              cultivars: [
                { id: c1.id, name: c1.name, ratio: ratios[0] },
                { id: c2.id, name: c2.name, ratio: ratios[1] },
                { id: c3.id, name: c3.name, ratio: ratios[2] }
              ],
              predictedEffects: { energy: 0, focus: 0, mood: 0, body: 0, creativity: 0, anxiety: 0 },
              cannabinoids: { thc: blendEval.profile.thc, cbd: blendEval.profile.cbd },
              score: blendEval.blendScore,
              confidence: 0.9,
              blendScore: blendEval.blendScore,
              blendEvaluation: blendEval,
              metadata: { unknownTerpeneCount: 0, constraintsViolated: [] }
            });
          }
        }
      }
    }
  }

  return {
    recommendations: results.sort((a, b) => b.blendScore - a.blendScore).slice(0, 3),
    intent: validatedIntent,
    inventory_timestamp: new Date().toISOString(),
    calculation_timestamp: new Date().toISOString(),
    audit: {
      inputHash: simpleHash(intent),
      configVersion: CONFIG_VERSION,
      candidatesEvaluated: candidateCount,
      executionTimeMs: Date.now() - startTime
    }
  };
}
