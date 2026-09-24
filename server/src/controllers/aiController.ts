import { Request, Response } from 'express';
import { agentOrchestrator } from '../agents/orchestrator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const orchestrateAgent = async (req: Request, res: Response) => {
  try {
    const { agentName, studentId, opportunityId, params } = req.body;
    if (!agentName) {
      return sendError(res, 'MISSING_AGENT_NAME', 'Agent name is required');
    }

    const runResult = await agentOrchestrator.runAgent({
      agentName,
      studentId,
      opportunityId,
      params: params || {},
    });

    return sendSuccess(res, runResult, `Agent ${agentName} executed`);
  } catch (error: any) {
    return sendError(res, 'AGENT_EXECUTION_ERROR', error.message || 'Agent failed', 500);
  }
};
