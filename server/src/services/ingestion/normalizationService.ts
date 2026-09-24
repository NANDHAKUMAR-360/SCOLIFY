import { normalizeOpportunityTitle, normalizeUrl, normalizeCategory } from '../../utils/opportunityNormalizer.js';
import { RawOpportunity, ServerOpportunity } from '../../types/opportunity.js';

export class NormalizationService {
  public normalize(raw: RawOpportunity): Partial<ServerOpportunity> {
    const rawDeadline = raw.applicationDeadline;
    let validDeadlineIso: string | undefined;

    if (rawDeadline) {
      const d = new Date(rawDeadline);
      if (!isNaN(d.getTime())) {
        validDeadlineIso = d.toISOString();
      }
    }

    const title = normalizeOpportunityTitle(raw.title || '');
    const organization_name = (raw.organizationName || 'Verified Sponsor').trim();
    const category = normalizeCategory(raw.category || 'scholarship');
    const official_url = normalizeUrl(raw.officialUrl || '');

    return {
      title,
      organization_name,
      category,
      description: (raw.description || '').trim(),
      reward_amount: typeof raw.rewardAmount === 'number' && !isNaN(raw.rewardAmount) ? raw.rewardAmount : undefined,
      currency: raw.currency ? raw.currency.toUpperCase().trim() : 'USD',
      location: raw.location ? raw.location.trim() : undefined,
      is_remote: Boolean(raw.isRemote),
      application_deadline: validDeadlineIso,
      official_url,
    };
  }
}

export const normalizationService = new NormalizationService();
