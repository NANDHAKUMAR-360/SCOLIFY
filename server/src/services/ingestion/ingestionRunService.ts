import { ingestionRunRepository } from '../../repositories/ingestionRunRepository.js';
import { IngestionRunRecord } from '../../types/opportunity.js';

export class IngestionRunService {
  async startRun(sourceName: string, sourceType: string): Promise<IngestionRunRecord> {
    return await ingestionRunRepository.createRun(sourceName, sourceType);
  }

  async updateProgress(
    runId: string,
    stats: {
      total_records?: number;
      successful_records?: number;
      rejected_records?: number;
      duplicate_records?: number;
      expired_records?: number;
      verification_pending_records?: number;
      errors?: Array<{ index: number; error: string; recordTitle?: string }>;
    }
  ): Promise<IngestionRunRecord> {
    return await ingestionRunRepository.updateRunStats(runId, stats);
  }

  async completeRun(
    runId: string,
    finalStats: {
      total_records: number;
      successful_records: number;
      rejected_records: number;
      duplicate_records: number;
      expired_records: number;
      verification_pending_records: number;
      errors: Array<{ index: number; error: string; recordTitle?: string }>;
    }
  ): Promise<IngestionRunRecord> {
    return await ingestionRunRepository.updateRunStats(runId, {
      ...finalStats,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  async failRun(runId: string, errorMsg: string): Promise<IngestionRunRecord> {
    return await ingestionRunRepository.updateRunStats(runId, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      errors: [{ index: 0, error: errorMsg }],
    });
  }

  async getRun(runId: string): Promise<IngestionRunRecord | null> {
    return await ingestionRunRepository.getRunById(runId);
  }
}

export const ingestionRunService = new IngestionRunService();
