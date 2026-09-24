import { ExpiryStatus } from '../types/opportunity.js';

export function calculateExpiryStatus(deadlineIso?: string): {
  status: ExpiryStatus;
  daysRemaining?: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
} {
  if (!deadlineIso) {
    return { status: 'no_deadline', isExpired: false, isExpiringSoon: false };
  }

  const deadline = new Date(deadlineIso).getTime();
  if (isNaN(deadline)) {
    return { status: 'no_deadline', isExpired: false, isExpiringSoon: false };
  }

  const now = Date.now();
  const diffMs = deadline - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining, isExpired: true, isExpiringSoon: false };
  }

  if (daysRemaining <= 7) {
    return { status: 'expiring_soon', daysRemaining, isExpired: false, isExpiringSoon: true };
  }

  return { status: 'active', daysRemaining, isExpired: false, isExpiringSoon: false };
}
