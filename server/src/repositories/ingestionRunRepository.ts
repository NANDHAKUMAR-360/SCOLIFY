import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { BaseRepository } from './baseRepository.js';
import { IngestionRunRecord } from '../types/opportunity.js';

// In-memory fallback cache for development/demo mode
const inMemoryRuns = new Map<string, IngestionRunRecord>();

export class IngestionRunRepository extends BaseRepository<IngestionRunRecord> {
  constructor() {
    super('ingestion_runs');
  }

  async createRun(sourceName: string, sourceType: string): Promise<IngestionRunRecord> {
    const record: IngestionRunRecord = {
      id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      source_name: sourceName,
      source_type: sourceType,
      started_at: new Date().toISOString(),
      total_records: 0,
      successful_records: 0,
      rejected_records: 0,
      duplicate_records: 0,
      expired_records: 0,
      verification_pending_records: 0,
      status: 'running',
      errors: [],
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('ingestion_runs')
        .insert({
          source_name: sourceName,
          source_type: sourceType,
          started_at: record.started_at,
          status: 'running',
          errors: [],
        })
        .select()
        .single();

      if (!error && data) {
        return data as IngestionRunRecord;
      }
    } catch {
      // Fallback to in-memory store
    }

    inMemoryRuns.set(record.id, record);
    return record;
  }

  async updateRunStats(
    id: string,
    updates: Partial<IngestionRunRecord>
  ): Promise<IngestionRunRecord> {
    try {
      const { data, error } = await supabaseAdmin
        .from('ingestion_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as IngestionRunRecord;
      }
    } catch {
      // Fallback to in-memory update
    }

    const existing = inMemoryRuns.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      inMemoryRuns.set(id, updated);
      return updated;
    }

    return {
      id,
      source_name: 'Unknown',
      source_type: 'MANUAL',
      started_at: new Date().toISOString(),
      total_records: 0,
      successful_records: 0,
      rejected_records: 0,
      duplicate_records: 0,
      expired_records: 0,
      verification_pending_records: 0,
      status: 'completed',
      created_at: new Date().toISOString(),
      ...updates,
    };
  }

  async getRunById(id: string): Promise<IngestionRunRecord | null> {
    const dbRun = await this.findById(id);
    if (dbRun) return dbRun;
    return inMemoryRuns.get(id) || null;
  }
}

export const ingestionRunRepository = new IngestionRunRepository();
