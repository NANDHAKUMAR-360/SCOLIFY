import React, { useEffect, useState } from 'react';
import { GraduationCap, Search, Sparkles } from 'lucide-react';
import { Opportunity } from '../types/opportunity';
import { opportunityService } from '../services/opportunityService';
import { OpportunityCardItem } from '../features/opportunities/OpportunityCardItem';
import { OpportunityDetailModal } from '../features/opportunities/OpportunityDetailModal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

export const ScholarshipsPage: React.FC = () => {
  const [scholarships, setScholarships] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadScholarships() {
      setIsLoading(true);
      try {
        const list = await opportunityService.getOpportunities('scholarship');
        setScholarships(list);
      } catch {
        // Fallback demo data
      } finally {
        setIsLoading(false);
      }
    }
    loadScholarships();
  }, []);

  const filtered = scholarships.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(term) || s.organizationName.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Scholarships Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500">
            Verified merit-based, need-based, and research scholarships powered by shared opportunity intelligence.
          </p>
        </div>
        <Badge variant="emerald" className="self-start md:self-auto py-1.5 px-3">
          <Sparkles className="w-3.5 h-3.5" /> {filtered.length} Active Scholarships
        </Badge>
      </div>

      {/* Search Bar */}
      <Input
        placeholder="Search scholarship name, sponsor, or criteria..."
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Scholarships Grid */}
      {isLoading ? (
        <LoadingState message="Loading verified scholarship intelligence..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Scholarships Found"
          description="Try broadening your search keywords to discover available scholarships."
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
