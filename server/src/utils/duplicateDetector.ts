import { DuplicateStatus, ServerOpportunity } from '../types/opportunity.js';

export function detectDuplicateStatus(
  candidate: Partial<ServerOpportunity>,
  existingOpportunities: ServerOpportunity[]
): { status: DuplicateStatus; matchedOpportunityId?: string } {
  const candTitle = (candidate.title || '').toLowerCase().trim();
  const candUrl = (candidate.official_url || '').toLowerCase().trim();
  const candOrg = (candidate.organization_name || '').toLowerCase().trim();

  for (const existing of existingOpportunities) {
    const exTitle = existing.title.toLowerCase().trim();
    const exUrl = existing.official_url.toLowerCase().trim();
    const exOrg = existing.organization_name.toLowerCase().trim();

    // Exact Match: URL matches OR (Title + Organization match)
    if ((candUrl && candUrl === exUrl) || (candTitle === exTitle && candOrg === exOrg)) {
      return { status: 'exact_duplicate', matchedOpportunityId: existing.id };
    }

    // Possible Match: High Title Similarity + Same Organization
    if (candOrg === exOrg && (candTitle.includes(exTitle) || exTitle.includes(candTitle))) {
      return { status: 'possible_duplicate', matchedOpportunityId: existing.id };
    }
  }

  return { status: 'unique' };
}
