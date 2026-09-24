export function formatCurrency(amount?: number, currency: string = 'USD'): string {
  if (amount === undefined || amount === null) return 'Varies / Full Coverage';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Ongoing / Rolling';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDaysRemaining(dateString?: string): { text: string; urgent: boolean } {
  if (!dateString) return { text: 'Flexible', urgent: false };
  const target = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Passed', urgent: true };
  if (diffDays === 0) return { text: 'Ends Today', urgent: true };
  if (diffDays <= 7) return { text: `${diffDays}d left`, urgent: true };
  return { text: `${diffDays} days left`, urgent: false };
}

export function formatVerificationLabel(status: string): { label: string; bg: string; text: string } {
  switch (status) {
    case 'verified':
      return { label: 'Verified Source', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' };
    case 'partially_verified':
      return { label: 'Partially Verified', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' };
    case 'warning':
      return { label: 'Verification Warning', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700' };
    default:
      return { label: 'Unverified', bg: 'bg-slate-100 text-slate-600 border-slate-200', text: 'text-slate-600' };
  }
}
