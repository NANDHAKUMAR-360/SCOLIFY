import React from 'react';
import { EligibilityStatus, MatchExplanationData } from '../types/matching';
import { XCircle, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export interface EligibilityGateProps {
  status: EligibilityStatus;
  explanation?: MatchExplanationData;
  gaps?: string[];
  warnings?: string[];
  children?: React.ReactNode;
}

export const EligibilityGate: React.FC<EligibilityGateProps> = ({
  status,
  explanation,
  gaps: _gaps = [],
  warnings = [],
  children,
}) => {
  const navigate = useNavigate();

  if (status === 'INELIGIBLE') {
    const reasons = explanation?.reasons || [];
    return (
      <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-3xl space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
            <XCircle className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-rose-950">
              Not Eligible for this Opportunity
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              {explanation?.summary ||
                'Your current student profile does not satisfy one or more mandatory eligibility requirements established by the sponsor.'}
            </p>
            {warnings.length > 0 && (
              <p className="text-[11px] text-rose-700 font-medium pt-0.5">
                {warnings.join(' ')}
              </p>
            )}
          </div>
        </div>

        {/* Failed Criteria Breakdown */}
        {reasons.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-rose-200/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Unmet Mandatory Requirements ({reasons.length})
            </p>
            <div className="space-y-1.5">
              {reasons.map((r, i) => (
                <div key={i} className="p-2.5 bg-white/80 border border-rose-100 rounded-xl text-xs text-rose-900 font-medium flex items-center justify-between">
                  <span>{r.description || r.reason || 'Requirement failed'}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-md">
                    Mandatory
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-rose-200/60 text-xs text-rose-700">
          <span>Match recommendation score blocked due to ineligibility.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/opportunities')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="bg-white/80 border-rose-200 text-rose-800 hover:bg-rose-100"
          >
            Explore Other Opportunities
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'MORE_INFO') {
    const missing = explanation?.missingFields || [];
    return (
      <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-3xl space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-amber-950">
              Additional Profile Information Required
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              {explanation?.summary ||
                'To evaluate your complete eligibility and compatibility, please complete the required sections in your profile.'}
            </p>
          </div>
        </div>

        {missing.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-amber-200/60">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Missing Profile Fields ({missing.length})
            </p>
            <div className="space-y-1.5">
              {missing.map((m, i) => (
                <div key={i} className="p-2.5 bg-white/80 border border-amber-100 rounded-xl text-xs text-amber-900 font-medium">
                  {m.reason || m.description || 'Missing profile data'}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-amber-200/60">
          <span className="text-xs text-amber-700 font-medium">
            Complete your profile to unlock compatibility scoring.
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/profile')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Update Profile Now
          </Button>
        </div>
      </div>
    );
  }

  // ELIGIBLE status: render children (the full match result UI)
  return (
    <div className="space-y-4">
      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>You meet 100% of the sponsor's mandatory eligibility requirements!</span>
      </div>
      {children}
    </div>
  );
};
