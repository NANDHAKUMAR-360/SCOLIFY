import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Search, Sparkles } from 'lucide-react';
import { Opportunity } from '../types/opportunity';
import { opportunityService } from '../services/opportunityService';
import { OpportunityCardItem } from '../features/opportunities/OpportunityCardItem';
import { OpportunityDetailModal } from '../features/opportunities/OpportunityDetailModal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

export const OpportunitiesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null) {
      setSearchTerm(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadOpportunities() {
      setIsLoading(true);
      try {
        const cat = categoryFilter === 'all' ? undefined : categoryFilter;
        const list = await opportunityService.getOpportunities(cat);
        setOpportunities(list);
      } catch {
        // Fallback demo data
      } finally {
        setIsLoading(false);
      }
    }
    loadOpportunities();
  }, [categoryFilter]);

  const filtered = opportunities.filter((o) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.title.toLowerCase().includes(term) ||
      o.organizationName.toLowerCase().includes(term) ||
      o.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Compass className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Verified Opportunity Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500">
            One canonical intelligence feed for scholarships, tech internships, research grants, and fellowships.
          </p>
        </div>
        <Badge variant="brand" className="self-start md:self-auto py-1.5 px-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" /> {filtered.length} Opportunities Available
        </Badge>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Search opportunity title, sponsor, domain, or skills..."
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { label: 'All Opportunity Types', value: 'all' },
            { label: 'Scholarships', value: 'scholarship' },
            { label: 'Tech Internships', value: 'internship' },
            { label: 'Fellowships', value: 'fellowship' },
            { label: 'Research Grants', value: 'grant' },
            { label: 'Competitions', value: 'competition' },
          ]}
          className="w-full md:w-64"
        />
      </div>

      {/* Opportunities Grid */}
      {isLoading ? (
        <LoadingState message="Loading verified opportunity intelligence..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Opportunities Found"
          description="Try adjusting your keyword search or category filter to discover available student opportunities."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((opp) => (
            <OpportunityCardItem key={opp.id} opportunity={opp} onSelect={(o) => setSelectedOpp(o)} />
          ))}
        </div>
      )}

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
    </div>
  );
};
