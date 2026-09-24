import { BaseSourceAdapter } from './baseSourceAdapter.js';
import { RawOpportunity, SourceMetadata } from '../../types/opportunity.js';

export class ManualSourceAdapter extends BaseSourceAdapter {
  private payload: RawOpportunity[];

  constructor(payload: RawOpportunity | RawOpportunity[], sourceName = 'Admin Manual Ingestion', sourceUrl = 'https://scolify.org/admin/ingest') {
    const metadata: SourceMetadata = {
      sourceName,
      sourceType: 'MANUAL',
      sourceUrl,
      description: 'Controlled admin manual opportunity entry',
    };
    super(metadata);
    this.payload = Array.isArray(payload) ? payload : [payload];
  }

  public async collect(): Promise<RawOpportunity[]> {
    return this.payload;
  }
}
