export interface AIResultMetadata {
  confidence: number;
  reasoning: string;
  source?: string;
  evidence?: string[];
  warnings?: string[];
  timestamp: string;
}

export interface AIInsight {
  id: string;
  insightType: 'match_breakdown' | 'doc_gap' | 'resume_tip' | 'eligibility_check';
  content: any;
  meta: AIResultMetadata;
}

export interface AgentRunContract {
  agentName: string;
  studentId?: string;
  opportunityId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'flagged';
  inputParams: Record<string, any>;
  outputResult?: Record<string, any>;
  executionTimeMs?: number;
}
