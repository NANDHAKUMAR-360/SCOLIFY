import { BaseSourceAdapter } from './baseSourceAdapter.js';
import { RawOpportunity, SourceMetadata } from '../../types/opportunity.js';

export class DemoSourceAdapter extends BaseSourceAdapter {
  constructor() {
    const metadata: SourceMetadata = {
      sourceName: 'Scolify Curated Demo Collection',
      sourceType: 'DEMO',
      sourceUrl: 'https://scolify.org/demo-sources',
      description: 'Curated demonstration opportunities for hackathon ingestion testing',
    };
    super(metadata);
  }

  public async collect(): Promise<RawOpportunity[]> {
    return [
      {
        title: 'National Quantum Computing Undergraduate Fellowship 2026',
        organizationName: 'National Science & Tech Institute',
        category: 'fellowship',
        description: 'Comprehensive research fellowship providing 1-year research stipend, mentorship from senior scientists, and lab facility access for quantum information science students.',
        rewardAmount: 18000,
        currency: 'USD',
        location: 'Boulder, CO',
        isRemote: false,
        applicationDeadline: '2026-12-01T00:00:00Z',
        officialUrl: 'https://example.gov/quantum-fellowship-2026',
        requirements: [
          {
            requirement_type: 'gpa',
            criteria_json: { field: 'cgpa', operator: 'GREATER_THAN_OR_EQUAL', value: 3.6, unit: 'GPA' },
            is_mandatory: true,
          },
          {
            requirement_type: 'degree',
            criteria_json: { field: 'field_of_study', operator: 'CONTAINS', value: 'Physics' },
            is_mandatory: true,
          },
        ],
        rawPayload: { ingested_by: 'DemoSourceAdapter', batch: '2026-Q3' },
      },
      {
        title: 'Global High School & University Cybersecurity Hackathon',
        organizationName: 'SecureNet Alliance',
        category: 'competition',
        description: '48-hour virtual security competition focused on vulnerability research, capture-the-flag challenges, and secure code audit with cash prizes.',
        rewardAmount: 10000,
        currency: 'USD',
        location: 'Global / Virtual',
        isRemote: true,
        applicationDeadline: '2026-11-20T00:00:00Z',
        officialUrl: 'https://example.org/cyber-hackathon-2026',
        requirements: [
          {
            requirement_type: 'skill',
            criteria_json: { field: 'skills', operator: 'CONTAINS', value: 'Cybersecurity' },
            is_mandatory: true,
          },
        ],
        rawPayload: { ingested_by: 'DemoSourceAdapter', batch: '2026-Q3' },
      },
      {
        title: 'Clean Energy Innovation Research Grant',
        organizationName: 'GreenTech Global Foundation',
        category: 'grant',
        description: 'Direct project seed grant funding student-led research in solar efficiency, battery storage chemistry, and smart grid software solutions.',
        rewardAmount: 30000,
        currency: 'USD',
        location: 'Remote / University Campus',
        isRemote: true,
        applicationDeadline: '2026-10-25T00:00:00Z',
        officialUrl: 'https://example.org/clean-energy-grant',
        requirements: [
          {
            requirement_type: 'essay',
            criteria_json: { field: 'proposal', operator: 'EQUALS', value: 'Project Proposal PDF' },
            is_mandatory: true,
          },
        ],
        rawPayload: { ingested_by: 'DemoSourceAdapter', batch: '2026-Q3' },
      },
    ];
  }
}
