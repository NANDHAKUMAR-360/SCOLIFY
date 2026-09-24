import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { VerificationBadge } from './VerificationBadge';
import { DeadlineBadge } from './DeadlineBadge';
import { OpportunityTypeBadge } from './OpportunityTypeBadge';
import { Opportunity } from '../../types/opportunity';
import { formatCurrency } from '../../utils/formatters';
import { MapPin, Bookmark, BookmarkCheck, ExternalLink, Sparkles } from 'lucide-react';
import { opportunityService } from '../../services/opportunityService';

export interface OpportunityCardItemProps {
  opportunity: Opportunity;
  onSelect?: (opp: Opportunity) => void;
}

export const OpportunityCardItem: React.FC<OpportunityCardItemProps> = ({ opportunity, onSelect }) => {
  const [isSaved, setIsSaved] = useState(Boolean(opportunity.isSaved));
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      if (isSaved) {
        await opportunityService.unsaveOpportunity(opportunity.id);
        setIsSaved(false);
      } else {
        await opportunityService.saveOpportunity(opportunity.id);
        setIsSaved(true);
      }
    } catch {
      setIsSaved(!isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full group hover:border-brand-200 cursor-pointer" onClick={() => onSelect && onSelect(opportunity)}>
      <div className="space-y-4">
        {/* Top Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <OpportunityTypeBadge category={opportunity.category} />
            <VerificationBadge status={opportunity.verificationStatus} />
          </div>
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label="Save Opportunity"
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-2xs'
                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Title & Organization */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {opportunity.title}
          </h3>
          <p className="text-xs font-semibold text-slate-500">{opportunity.organizationName}</p>
        </div>

        {/* Reward & Deadline Pill Row */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="p-1 bg-brand-50 text-brand-600 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Reward / Pay</p>
              <p className="font-bold text-slate-800">{formatCurrency(opportunity.rewardAmount, opportunity.currency)}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <DeadlineBadge deadlineIso={opportunity.applicationDeadline} className="w-full justify-center" />
          </div>
        </div>

        {/* Location & Remote Pill */}
        {opportunity.location && (
          <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{opportunity.location} {opportunity.isRemote && '(Remote)'}</span>
          </div>
        )}

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>
      </div>

      {/* Footer Action */}
      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-brand-600 group-hover:underline">
          View Opportunity Intelligence →
        </span>
        <a
          href={opportunity.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
          title="Open Official Source"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
};
