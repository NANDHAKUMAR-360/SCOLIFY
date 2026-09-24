import React from 'react';
import { Opportunity } from '../../types/opportunity';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, formatDaysRemaining, formatVerificationLabel } from '../../utils/formatters';
import { Calendar, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onApplyClick?: (id: string) => void;
  onSaveClick?: (id: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onApplyClick,
  onSaveClick,
}) => {
  const verificationInfo = formatVerificationLabel(opportunity.verificationStatus);
  const deadlineInfo = formatDaysRemaining(opportunity.applicationDeadline);

  return (
    <Card className="flex flex-col justify-between h-full group hover:border-brand-200">
      <div className="space-y-4">
        {/* Top Badges Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge
            variant={opportunity.category === 'scholarship' ? 'emerald' : 'violet'}
            className="uppercase tracking-wider font-bold"
          >
            {opportunity.category}
          </Badge>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${verificationInfo.bg} inline-flex items-center gap-1`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {verificationInfo.label}
          </span>
        </div>

        {/* Title & Organization */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {opportunity.title}
          </h3>
          <p className="text-sm font-semibold text-slate-500">{opportunity.organizationName}</p>
        </div>

        {/* Key Info Pill Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="p-1 bg-brand-50 text-brand-600 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-slate-400 font-medium">Value / Reward</p>
              <p className="font-bold text-slate-800">{formatCurrency(opportunity.rewardAmount, opportunity.currency)}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <span className="p-1 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-slate-400 font-medium">Deadline</p>
              <p className={`font-bold ${deadlineInfo.urgent ? 'text-rose-600' : 'text-slate-800'}`}>
                {deadlineInfo.text}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Summary */}
        <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
          {opportunity.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {opportunity.location} {opportunity.isRemote && '(Remote Option)'}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">
          {opportunity.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-5 border-t border-slate-100 mt-4">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onApplyClick && onApplyClick(opportunity.id)}
        >
          View Intelligence & Apply
        </Button>
        {onSaveClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSaveClick(opportunity.id)}
          >
            Save
          </Button>
        )}
      </div>
    </Card>
  );
};
