export interface TrustCard {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface CategoryPill {
  id: string;
  label: string;
  categoryValue: string;
  iconName: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const publicExperienceContent = {
  hero: {
    badge: 'AI-Powered Student Opportunity Intelligence Platform',
    titleLine1: 'Find Your Next',
    titleHighlight: 'Verified Opportunity',
    subtitle: 'Discover, verify, and prepare for genuine scholarships, tech internships, research programs and more — matched directly to your academic profile with human application control.',
    searchPlaceholder: 'Search scholarships, internships, companies, or keywords...',
  },
  trustCards: [
    {
      id: 'trust-1',
      title: 'Verified Opportunities',
      description: 'Passed provenance & source verification checks',
      iconName: 'ShieldCheck',
    },
    {
      id: 'trust-2',
      title: 'Profile-Based Matching',
      description: 'Evaluated against your canonical student profile',
      iconName: 'Target',
    },
    {
      id: 'trust-3',
      title: 'Source Provenance',
      description: 'Ingested from official institutional registries',
      iconName: 'CheckCircle2',
    },
    {
      id: 'trust-4',
      title: 'Human Approval Engine',
      description: 'Applications submitted ONLY with your approval',
      iconName: 'UserCheck',
    },
  ],
  categoryPills: [
    { id: 'cat-all', label: 'All', categoryValue: 'all', iconName: 'Sparkles' },
    { id: 'cat-scholarships', label: 'Scholarships', categoryValue: 'scholarship', iconName: 'GraduationCap' },
    { id: 'cat-internships', label: 'Internships', categoryValue: 'internship', iconName: 'Briefcase' },
    { id: 'cat-research', label: 'Research', categoryValue: 'research', iconName: 'FlaskConical' },
    { id: 'cat-competitions', label: 'Competitions', categoryValue: 'competition', iconName: 'Trophy' },
    { id: 'cat-grants', label: 'Grants', categoryValue: 'grant', iconName: 'Coins' },
  ],
  productLifecycle: [
    { step: 1, title: 'Discover', description: 'Continuous ingestion from verified institutional portals.' },
    { step: 2, title: 'Verify', description: 'Automated duplicate, dead-link & expiry checks.' },
    { step: 3, title: 'Understand', description: 'Requirement criteria parsed into clear rules.' },
    { step: 4, title: 'Check Eligibility', description: 'Deterministic GPA, degree & skill rule evaluation.' },
    { step: 5, title: 'Match', description: 'Profile compatibility calculated without hallucination.' },
    { step: 6, title: 'Prepare', description: 'Document vault gap check & AI drafting assistance.' },
    { step: 7, title: 'Human Review', description: 'Explicit student review and manual approval.' },
    { step: 8, title: 'Apply & Track', description: 'Official application submission and status tracking.' },
  ],
  verificationStages: [
    { name: '1. Source Ingestion', desc: 'Official foundations, university portals & recruiter domains.' },
    { name: '2. Normalization', desc: 'Standardizes title, organization, category & requirements.' },
    { name: '3. Duplicate Detector', desc: 'Detects identical or overlapping opportunity postings.' },
    { name: '4. Expiry Engine', desc: 'Evaluates deadlines against live timestamp.' },
    { name: '5. Rule Verification', desc: 'Confirms mandatory field completeness.' },
    { name: '6. Admin Review', desc: 'Optional human verification for suspicious listings.' },
    { name: '7. Published Feed', desc: 'Exposed to authenticated student feed.' },
  ],
  faqs: [
    {
      question: 'What is Scolify?',
      answer: 'Scolify is an AI-powered student opportunity intelligence platform that discovers, verifies, and matches scholarships, tech internships, research grants, and fellowships directly to your canonical academic profile.',
    },
    {
      question: 'How are opportunities verified on Scolify?',
      answer: 'Scolify uses an automated multi-stage ingestion and verification pipeline that checks domain provenance, tax registry data, official corporate portals, duplicate detection, and active expiry deadlines before publishing.',
    },
    {
      question: 'Does Scolify automatically submit my applications?',
      answer: 'No. Scolify strictly enforces a Human Approval Engine boundary. AI assists with document gap analysis and essay drafting, but consequential application submission ALWAYS requires your explicit human review and approval.',
    },
    {
      question: 'Can AI change my eligibility status?',
      answer: 'Never. Eligibility status (Eligible, Ineligible, or More Info Required) is determined 100% deterministically by rule engine evaluation of your canonical profile against requirement criteria. AI models are strictly limited to explaining findings.',
    },
    {
      question: 'Is my student data and document vault private?',
      answer: 'Yes. All student profile data, transcripts, resumes, and saved items are protected using Supabase Row Level Security (RLS) policies. Your data is isolated to your authenticated account.',
    },
    {
      question: 'How do offline mode and connectivity status work?',
      answer: 'When offline, Scolify lets you view previously cached opportunities and your saved profile data. Fresh verification checks are performed as soon as connection is restored.',
    },
  ],
};
