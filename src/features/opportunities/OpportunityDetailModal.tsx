import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, MapPin, CheckCircle, Building2, Sparkles, AlertCircle } from 'lucide-react';
import { Opportunity, OpportunitySource, OpportunityRequirement } from '../../types/opportunity';
import { VerificationBadge } from './VerificationBadge';
import { OpportunityTypeBadge } from './OpportunityTypeBadge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import {
  matchingService,
  MatchResultData,
  MatchScoreCard,
  MatchFactorBreakdown,
  SkillGapList,
  MatchExplanation,
  EligibilityGate,
} from '../matching';
import {
  documentService,
  DocumentGapAnalysis,
  CertificateGuidanceResult,
  ApplicationReadinessResult,
  ApplicationReadiness,
  DocumentGapPanel,
  CertificateGuidance,
} from '../documents';
import { ApplicationPreparationWorkspace } from '../applications';

export interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({ opportunity, onClose }) => {
  const { isAuthenticated } = useAuthStore();
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState<boolean>(false);
  const [isCalculatingMatch, setIsCalculatingMatch] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Document Intelligence & Readiness State
  const [readiness, setReadiness] = useState<ApplicationReadinessResult | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<DocumentGapAnalysis | null>(null);
  const [guidance, setGuidance] = useState<CertificateGuidanceResult | null>(null);
  const [isLoadingDocIntelligence, setIsLoadingDocIntelligence] = useState<boolean>(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);

  // Auto-fetch latest match and document intelligence when modal opens
  useEffect(() => {
    if (!opportunity?.id || !isAuthenticated) {
      setMatchResult(null);
      setReadiness(null);
      setGapAnalysis(null);
      setGuidance(null);
      return;
    }

    let isMounted = true;
    const fetchOpportunityIntelligence = async () => {
      setIsLoadingMatch(true);
      setIsLoadingDocIntelligence(true);
      setMatchError(null);
      try {
        const [latestMatch, readinessRes, gapRes, guidanceRes] = await Promise.allSettled([
          matchingService.getLatestMatch(opportunity.id),
          documentService.getApplicationReadiness(opportunity.id),
          documentService.getDocumentGap(opportunity.id),
          documentService.getCertificateGuidance(opportunity.id),
        ]);

        if (isMounted) {
          if (latestMatch.status === 'fulfilled') setMatchResult(latestMatch.value);
          if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value);
          if (gapRes.status === 'fulfilled') setGapAnalysis(gapRes.value);
          if (guidanceRes.status === 'fulfilled') setGuidance(guidanceRes.value);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Could not load opportunity intelligence:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoadingMatch(false);
          setIsLoadingDocIntelligence(false);
        }
      }
    };

    fetchOpportunityIntelligence();
    return () => {
      isMounted = false;
    };
  }, [opportunity?.id, isAuthenticated]);


  const handleRunMatch = async () => {
    if (!opportunity?.id) return;
    setIsCalculatingMatch(true);
    setMatchError(null);
    try {
      const result = await matchingService.runMatch(opportunity.id);
      setMatchResult(result);
    } catch (err: any) {
      setMatchError(err?.message || 'Failed to calculate deterministic match.');
    } finally {
      setIsCalculatingMatch(false);
    }
  };

  if (!opportunity) return null;

  const isVerified = opportunity.verificationStatus === 'verified';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-card-hover max-h-[90vh] overflow-y-auto space-y-6"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <OpportunityTypeBadge category={opportunity.category} />
                <VerificationBadge status={opportunity.verificationStatus} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{opportunity.title}</h2>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {opportunity.organizationName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-brand-50/60 border border-brand-100 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Reward / Funding</p>
              <p className="text-base font-extrabold text-brand-900 mt-0.5">
                {formatCurrency(opportunity.rewardAmount, opportunity.currency)}
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Application Deadline</p>
              <p className="text-xs font-extrabold text-amber-900 mt-1">
                {formatDate(opportunity.applicationDeadline)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location / Work Mode</p>
              <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {opportunity.location || 'Global'} {opportunity.isRemote && '(Remote)'}
              </p>
            </div>
          </div>

          {/* Verification Reasoning Banner */}
          {opportunity.verificationReasoning && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Scolify Verification Audit
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {opportunity.verificationReasoning}
              </p>
            </div>
          )}

          {/* DETERMINISTIC MATCH & COMPATIBILITY ENGINE SECTION */}
          {isVerified && (
            <div className="border border-slate-200/80 rounded-3xl p-5 bg-gradient-to-b from-white to-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-brand-100 text-brand-700 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Match & Compatibility Intelligence
                  </h3>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    Sign in to calculate your deterministic compatibility score
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Scolify analyzes your verified academic credentials and skills against this opportunity.
                  </p>
                </div>
              ) : isLoadingMatch ? (
                <div className="p-6 text-center space-y-2 animate-pulse">
                  <div className="h-6 w-40 bg-slate-200 rounded-lg mx-auto" />
                  <p className="text-xs text-slate-400">Loading your stored match data...</p>
                </div>
              ) : matchResult ? (
                <div className="space-y-4">
                  <EligibilityGate
                    status={matchResult.eligibilityStatus}
                    explanation={matchResult.explanation}
                    gaps={matchResult.gaps}
                    warnings={matchResult.warnings}
                  >
                    <MatchScoreCard
                      score={matchResult.overallScore}
                      scoreVersion={matchResult.scoreVersion}
                      isStale={matchResult.isStale}
                      generatedAt={matchResult.generatedAt}
                      onRecalculate={handleRunMatch}
                      isRecalculating={isCalculatingMatch}
                    />
                    <MatchFactorBreakdown factorScores={matchResult.factorScores} />
                    <SkillGapList
                      matchedSkills={matchResult.matchedSkills}
                      missingSkills={matchResult.missingSkills}
                    />
                    <MatchExplanation
                      explanation={matchResult.explanation}
                      aiExplanation={matchResult.aiExplanation}
                      strengths={matchResult.strengths}
                      gaps={matchResult.gaps}
                    />
                  </EligibilityGate>
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-brand-50/60 to-indigo-50/60 border border-brand-100 rounded-2xl text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-brand-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Evaluate Your Compatibility
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Execute Scolify's deterministic compatibility engine to verify mandatory eligibility, skill alignment, and personalized fit.
                    </p>
                  </div>
                  {matchError && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{matchError}</span>
                    </div>
                  )}
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={handleRunMatch}
                    isLoading={isCalculatingMatch}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="font-bold px-6 shadow-md shadow-brand-500/20"
                  >
                    Check My Match
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* DETERMINISTIC DOCUMENT INTELLIGENCE & READINESS SECTION (PART 07) */}
          {isVerified && isAuthenticated && (
            <div className="space-y-4 pt-2">
              <ApplicationReadiness
                readiness={readiness}
                isLoading={isLoadingDocIntelligence}
                onPrepareClick={() => setIsWorkspaceOpen(true)}
              />
              <DocumentGapPanel
                gapAnalysis={gapAnalysis}
                isLoading={isLoadingDocIntelligence}
              />
              <CertificateGuidance
                guidance={guidance}
                isLoading={isLoadingDocIntelligence}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Opportunity Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Structured Requirements List */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-600" />
                Eligibility Criteria & Requirements
              </h3>
              <div className="space-y-2">
                {opportunity.requirements.map((req: OpportunityRequirement, idx: number) => {
                  const typeStr = req.requirementType || req.requirement_type || 'criteria';
                  const cJson = req.criteriaJson || req.criteria_json || {};
                  const isMandatory = req.isMandatory !== undefined ? req.isMandatory : req.is_mandatory;
                  return (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between items-center">
                      <span className="font-semibold text-slate-800 capitalize">
                        {typeStr}: {cJson.description || `${cJson.field || ''} ${cJson.operator || ''} ${cJson.value || ''}`}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isMandatory ? 'bg-rose-50 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                        {isMandatory ? 'Mandatory' : 'Preferred'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Data Provenance Sources */}
          {opportunity.sources && opportunity.sources.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Provenance & Verified Sources</h3>
              <div className="space-y-1.5">
                {opportunity.sources.map((src: OpportunitySource, idx: number) => {
                  const sName = src.sourceName || src.source_name || 'Official Portal';
                  const sUrl = src.sourceUrl || src.source_url || '#';
                  return (
                    <a
                      key={idx}
                      href={sUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-brand-700 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>{sName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-3">
            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => setIsWorkspaceOpen(true)}
                  leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
                  className="w-full sm:w-auto font-bold border-brand-200 text-brand-700 hover:bg-brand-50"
                >
                  Prepare Application
                </Button>
              )}
              <a href={opportunity.officialUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button variant="gradient" rightIcon={<ExternalLink className="w-4 h-4" />} className="w-full">
                  Apply via Official Portal
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Application Preparation Workspace Modal */}
      {opportunity?.id && (
        <ApplicationPreparationWorkspace
          opportunityId={opportunity.id}
          isOpen={isWorkspaceOpen}
          onClose={() => setIsWorkspaceOpen(false)}
        />
      )}
    </AnimatePresence>
  );
};

