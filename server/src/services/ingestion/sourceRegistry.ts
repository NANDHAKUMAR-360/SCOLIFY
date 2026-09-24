import { OpportunitySourceAdapter } from '../../integrations/opportunitySources/baseSourceAdapter.js';
import { DemoSourceAdapter } from '../../integrations/opportunitySources/demoSourceAdapter.js';
import { ManualSourceAdapter } from '../../integrations/opportunitySources/manualSourceAdapter.js';
import { RawOpportunity } from '../../types/opportunity.js';

export class SourceRegistry {
  private static instance: SourceRegistry;

  private constructor() {}

  public static getInstance(): SourceRegistry {
    if (!SourceRegistry.instance) {
      SourceRegistry.instance = new SourceRegistry();
    }
    return SourceRegistry.instance;
  }

  public getAdapter(sourceType: string, payload?: RawOpportunity | RawOpportunity[], sourceName?: string, sourceUrl?: string): OpportunitySourceAdapter {
    const typeUpper = sourceType.toUpperCase();

    if (typeUpper === 'DEMO') {
      return new DemoSourceAdapter();
    }

    if (typeUpper === 'MANUAL' && payload) {
      return new ManualSourceAdapter(payload, sourceName, sourceUrl);
    }

    // Default to manual adapter if custom payload provided
    if (payload) {
      return new ManualSourceAdapter(payload, sourceName || 'Custom Source Ingestion', sourceUrl || 'https://scolify.org');
    }

    // Fallback demo adapter
    return new DemoSourceAdapter();
  }
}

export const sourceRegistry = SourceRegistry.getInstance();
