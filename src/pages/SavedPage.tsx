import React, { useEffect, useState } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { Opportunity } from '../types/opportunity';
import { opportunityService } from '../services/opportunityService';
import { OpportunityCardItem } from '../features/opportunities/OpportunityCardItem';
import { OpportunityDetailModal } from '../features/opportunities/OpportunityDetailModal';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';

export const SavedPage: React.FC = () => {
  const [savedList, setSavedList] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  useEffect(() => {
    async function loadSaved() {
      setIsLoading(true);
      try {
        const all = await opportunityService.getOpportunities();
        setSavedList(all.filter((o) => o.isSaved));
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bookmark className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Saved Opportunities</h1>
          </div>
          <p className="text-xs text-slate-500">
            Bookmarked scholarships and internships saved for future application preparation.
          </p>
        </div>
        <Badge variant="amber" className="self-start md:self-auto py-1.5 px-3">
          <Sparkles className="w-3.5 h-3.5" /> {savedList.length} Saved Bookmarks
        </Badge>
      </div>

      {/* Saved Opportunities Grid */}
      {isLoading ? (
        <LoadingState message="Loading saved bookmarks..." />
      ) : savedList.length === 0 ? (
        <EmptyState
          title="No Saved Opportunities Yet"
          description="Click the bookmark icon on any scholarship or internship to save it to your personal watchlist."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedList.map((opp) => (
            <OpportunityCardItem key={opp.id} opportunity={opp} onSelect={(o) => setSelectedOpp(o)} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <OpportunityDetailModal opportunity={selectedOpp} onClose={() => setSelectedOpp(null)} />
    </div>
  );
};
