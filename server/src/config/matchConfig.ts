// Match Engine Configuration
// Phase B - Centralized weights, versioning, score bands, and skill normalization

export const MATCH_SCORE_VERSION = 'v1.0.0';

export const MATCH_WEIGHTS = {
  skillMatch: 30,
  educationMatch: 20,
  interestMatch: 15,
  preferenceMatch: 10,
  locationRemote: 10,
  deadlineFeasibility: 10,
  experienceMatch: 5,
};

// Validate total = 100
if (Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0) !== 100) {
  throw new Error('Match weights must sum to 100');
}

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  color: string;
}

export const SCORE_BANDS: ScoreBand[] = [
  { min: 85, max: 100, label: 'Strong Alignment', color: 'emerald' },
  { min: 70, max: 84, label: 'High Alignment', color: 'blue' },
  { min: 50, max: 69, label: 'Moderate Alignment', color: 'amber' },
  { min: 25, max: 49, label: 'Developing Alignment', color: 'orange' },
  { min: 0, max: 24, label: 'Low Alignment', color: 'rose' },
];

export function getScoreBand(score: number): ScoreBand {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return SCORE_BANDS.find((b) => clamped >= b.min && clamped <= b.max) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

// Skill normalization map – map various aliases to a canonical skill name
export const SKILL_NORMALIZATION: Record<string, string> = {
  // JavaScript variants
  js: 'javascript',
  javascript: 'javascript',
  // TypeScript variants
  ts: 'typescript',
  typescript: 'typescript',
  // React variants
  react: 'react',
  reactjs: 'react',
  'react.js': 'react',
  // Python variants
  python: 'python',
  py: 'python',
  'python3': 'python',
  // Java variants
  java: 'java',
  // C / C++
  'c++': 'cpp',
  cpp: 'cpp',
  // Machine Learning / AI
  ml: 'machine learning',
  ai: 'artificial intelligence',
  'deep learning': 'deep learning',
};

// Helper to normalize a skill name
export function normalizeSkill(name: string): string {
  const lower = (name || '').toLowerCase().trim();
  return SKILL_NORMALIZATION[lower] || lower;
}

