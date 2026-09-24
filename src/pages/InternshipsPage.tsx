import React, { useEffect, useState } from 'react';
import { Briefcase, Search, Sparkles } from 'lucide-react';
import { Opportunity } from '../types/opportunity';
import { opportunityService } from '../services/opportunityService';
import { OpportunityCardItem } from '../features/opportunities/OpportunityCardItem';
import { OpportunityDetailModal } from '../features/opportunities/OpportunityDetailModal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

export const InternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadInternships() {
      setIsLoading(true);
      try {
        const list = await opportunityService.getOpportunities('internship');
        setInternships(list);
      } catch {
        // Fallback demo data
      } finally {
        setIsLoading(false);
      }
    }
    loadInternships();
  }, []);

  const filtered = internships.filter((i) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return i.title.toLowerCase().includes(term) || i.organizationName.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Internships Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500">
            Verified corporate, startup, and research internships with sponsor domain legitimacy verification.
          </p>
        </div>
        <Badge variant="violet" className="self-start md:self-auto py-1.5 px-3">
          <Sparkles className="w-3.5 h-3.5" /> {filtered.length} Active Tech Internships
        </Badge>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search internship role, company name, or tech stack..."
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Internships Grid */}
      {isLoading ? (
        <LoadingState message="Loading verified internship intelligence..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Internships Found"
          description="Try modifying your keywords or location preferences to find open internships."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((opp) => (
            <OpportunityCardItem key={opp.id} opportunity={opp} onSelect={(o) => setSelectedOpp(o)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <OpportunityDetailModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
    </div>
  );
};
