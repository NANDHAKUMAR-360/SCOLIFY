import { OpportunityCategory } from '../types/opportunity.js';

export function normalizeOpportunityTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = ''; // Remove fragment
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

export function normalizeCategory(categoryStr: string): OpportunityCategory {
  const lower = categoryStr.toLowerCase().trim();
  if (lower.includes('scholar')) return 'scholarship';
  if (lower.includes('intern')) return 'internship';
  if (lower.includes('fellow')) return 'fellowship';
  if (lower.includes('grant')) return 'grant';
  if (lower.includes('compet')) return 'competition';
  if (lower.includes('research')) return 'research';
  if (lower.includes('apprentice')) return 'apprenticeship';
  if (lower.includes('career') || lower.includes('job')) return 'career';
  return 'other';
}

export function normalizeOpportunityData(raw: any) {
  return {
    title: normalizeOpportunityTitle(raw.title || ''),
    organization_name: (raw.organizationName || raw.organization_name || 'Verified Sponsor').trim(),
    category: normalizeCategory(raw.category || 'scholarship'),
    description: (raw.description || '').trim(),
    reward_amount: typeof raw.rewardAmount === 'number' ? raw.rewardAmount : raw.reward_amount,
    currency: raw.currency || 'USD',
    location: raw.location ? raw.location.trim() : undefined,
    is_remote: Boolean(raw.isRemote || raw.is_remote),
    application_deadline: raw.applicationDeadline || raw.application_deadline,
    official_url: normalizeUrl(raw.officialUrl || raw.official_url || 'https://scolify.org'),
  };
}
