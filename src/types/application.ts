import { Opportunity } from './opportunity';

export type ApplicationStatus =
  | 'draft'
  | 'in_review'
  | 'ready_for_approval'
  | 'approved'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  studentId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  status: ApplicationStatus;
  matchScore: number;
  matchReasoning?: string;
  missingRequirements: string[];
  humanApproved: boolean;
  approvedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
