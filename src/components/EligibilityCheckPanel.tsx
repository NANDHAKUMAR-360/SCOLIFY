import React, { useState } from 'react';
import { eligibilityService, EligibilityData } from '../services/eligibilityService';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  opportunityId: string;
  opportunityTitle: string;
}

export const EligibilityCheckPanel: React.FC<Props> = ({ opportunityId, opportunityTitle }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EligibilityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eligibilityService.getEligibility(opportunityId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate eligibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-4 text-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Deterministic Eligibility Check
          </h4>
          <p className="text-xs text-gray-400">{opportunityTitle}</p>
        </div>
        <button
          onClick={checkEligibility}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5" />
          )}
          {data ? 'Re-Evaluate' : 'Check My Eligibility'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-900 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-800">
          {/* Status Badge Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              data.status === 'ELIGIBLE'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : data.status === 'INELIGIBLE'
                ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                : 'bg-amber-950/40 border-amber-800 text-amber-200'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block mb-1">
                Evaluation Result
              </span>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                {data.status === 'ELIGIBLE' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {data.status === 'INELIGIBLE' && <XCircle className="w-5 h-5 text-rose-400" />}
                {data.status === 'MORE_INFO' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {data.status === 'ELIGIBLE'
                  ? 'ELIGIBLE'
                  : data.status === 'INELIGIBLE'
                  ? 'INELIGIBLE'
                  : 'INFORMATION NEEDED (MORE INFO)'}
              </h3>
              <p className="text-xs mt-1 opacity-90">{data.summary}</p>
            </div>
            <div className="text-right shrink-0 font-mono text-xs">
              <span className="block font-semibold">
                ✓ {data.passedRequirements} Passed
              </span>
              <span className="block font-semibold">
                ✕ {data.failedRequirements} Failed
              </span>
              <span className="block font-semibold">
                ⚠ {data.missingInformation} Needed
              </span>
            </div>
          </div>

          {/* AI Advisor Explanation */}
          {data.aiExplanation && (
            <div className="bg-indigo-950/30 border border-indigo-900/50 p-3 rounded-lg text-xs text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5 text-indigo-200">AI Opportunity Advisor Explanation:</span>
                {data.aiExplanation}
              </div>
            </div>
          )}

          {/* Detailed Requirements Checklist */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Requirement Evidence Breakdown ({data.requirements.length})
            </h5>
            <div className="space-y-2 bg-gray-950 p-3 rounded-lg border border-gray-800">
              {data.requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs p-2 rounded bg-gray-900/50 border border-gray-800/80">
                  {req.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {req.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  {req.status === 'MORE_INFO' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-200">
                        {req.description}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                          req.status === 'PASS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                            : req.status === 'FAIL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-900'
                            : 'bg-amber-950 text-amber-400 border border-amber-900'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 mt-1">
                      <span className="font-mono text-gray-300">Evidence:</span> {req.evidence}
                    </div>

                    {req.reason && (
                      <div className="text-[11px] text-amber-300 mt-0.5 italic">
                        Note: {req.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
