import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { OpportunityCategory } from '../../types/opportunity';

export interface OpportunityTypeBadgeProps {
  category: OpportunityCategory;
}

export const OpportunityTypeBadge: React.FC<OpportunityTypeBadgeProps> = ({ category }) => {
  const variants: Record<OpportunityCategory, 'emerald' | 'violet' | 'brand' | 'amber' | 'rose' | 'slate'> = {
    scholarship: 'emerald',
    internship: 'violet',
    fellowship: 'brand',
    grant: 'amber',
    competition: 'rose',
    research: 'emerald',
    apprenticeship: 'violet',
    career: 'brand',
    other: 'slate',
  };

  return (
    <Badge variant={variants[category] || 'brand'} className="uppercase font-bold tracking-wider">
      {category}
    </Badge>
  );
};
