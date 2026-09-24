import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { Button } from '../../../components/ui/Button';

interface HumanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  opportunityTitle: string;
  officialUrl?: string;
  onApprovalSuccess: () => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  opportunityTitle,
  officialUrl,
  onApprovalSuccess,
}) => {
  const [confirmedTruth, setConfirmedTruth] = useState(false);
  const [confirmedDocs, setConfirmedDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!confirmedTruth || !confirmedDocs) {
      setError('Please review and check all confirmation acknowledgements.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await applicationService.approveApplication(applicationId);
      onApprovalSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record approval. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-card-hover space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Student Final Human Approval
              </h3>
              <p className="text-xs text-slate-500">
                Explicit student consent & integrity verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            You are approving your prepared application package for{' '}
            <strong className="text-slate-900">{opportunityTitle}</strong>.
          </p>
          {officialUrl && (
            <p className="text-[11px] text-slate-500">
              Official destination portal:{' '}
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 font-bold inline-flex items-center gap-1 hover:underline"
              >
                <span>{officialUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          )}
          <p className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <strong>CRITICAL TRUST NOTICE:</strong> Scolify does not silently submit external
            applications. By approving, your preparation workspace is finalized and marked ready.
            You will use the official organization portal to complete official external submission.
          </p>
        </div>


        {/* Verification Checkboxes */}
        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedTruth}
              onChange={(e) => setConfirmedTruth(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              I have reviewed all drafted text and confirm that all academic, skill, and personal
              information represents authentic student facts.
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedDocs}
              onChange={(e) => setConfirmedDocs(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>
              I confirm that all attached documents from my vault are valid, up-to-date, and genuine.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel & Return to Editing
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleApprove}
            isLoading={isSubmitting}
            disabled={!confirmedTruth || !confirmedDocs}
            leftIcon={<CheckCircle className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            Approve & Mark Ready
          </Button>
        </div>
      </div>
    </div>
  );
};
