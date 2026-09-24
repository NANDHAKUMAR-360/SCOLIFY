import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { BaseRepository } from './baseRepository.js';
import { OpportunitySourceRecord } from '../types/opportunity.js';

export class OpportunitySourcesRepository extends BaseRepository<OpportunitySourceRecord> {
  constructor() {
    super('opportunity_sources');
  }

  async attachSourceToOpportunity(
    opportunityId: string,
    sourceName: string,
    sourceUrl: string,
    sourceType = 'MANUAL',
    rawPayload: Record<string, any> = {}
  ): Promise<OpportunitySourceRecord> {
    const record: OpportunitySourceRecord = {
      opportunity_id: opportunityId,
      source_name: sourceName,
      source_url: sourceUrl,
      source_type: sourceType,
      raw_payload: rawPayload,
      crawled_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('opportunity_sources')
        .insert(record)
        .select()
        .single();

      if (!error && data) {
        return data as OpportunitySourceRecord;
      }
    } catch {
      // In case database insertion is restricted/mock mode
    }

    return record;
  }
}

export const opportunitySourcesRepository = new OpportunitySourcesRepository();
