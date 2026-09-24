import { SourceMetadata, RawOpportunity } from '../../types/opportunity.js';

export interface OpportunitySourceAdapter {
  getSourceMetadata(): SourceMetadata;
  collect(): Promise<RawOpportunity[]>;
}

export abstract class BaseSourceAdapter implements OpportunitySourceAdapter {
  protected metadata: SourceMetadata;

  constructor(metadata: SourceMetadata) {
    this.metadata = metadata;
  }

  public getSourceMetadata(): SourceMetadata {
    return this.metadata;
  }

  public abstract collect(): Promise<RawOpportunity[]>;
}
