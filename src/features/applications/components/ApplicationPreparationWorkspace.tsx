import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { applicationService, PreparationWorkspaceData } from '../services/applicationService';

import { documentService } from '../../documents/services/documentService';
import { DocumentRecord } from '../../documents/types/documents';
import { ReadinessChecklist } from './ReadinessChecklist';
import { ApplicationDraftPanel } from './ApplicationDraftPanel';
import { HumanApprovalModal } from './HumanApprovalModal';
import { DocumentGapPanel } from '../../documents/components/DocumentGapPanel';
import { CertificateGuidance } from '../../documents/components/CertificateGuidance';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';

interface ApplicationPreparationWorkspaceProps {
  opportunityId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationPreparationWorkspace: React.FC<ApplicationPreparationWorkspaceProps> = ({
  opportunityId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<PreparationWorkspaceData | null>(null);
  const [studentDocs, setStudentDocs] = useState<DocumentRecord[]>([]);
  const [guidance, setGuidance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      const [workspaceRes, docsRes, guidanceRes] = await Promise.all([
        applicationService.prepareApplication(opportunityId),
        documentService.getDocuments(),
        documentService.getCertificateGuidance(opportunityId),
      ]);
      setData(workspaceRes);
      setStudentDocs(docsRes);
      setGuidance(guidanceRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize application workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && opportunityId) {
      loadWorkspace();
    }
  }, [isOpen, opportunityId]);

  if (!isOpen) return null;

  const handleAttachDocument = async (docId: string, purpose: string) => {
    if (!data?.application?.id) return;
    setIsAttaching(true);
    try {
      await applicationService.attachDocument(data.application.id, docId, purpose);
      await loadWorkspace();
    } catch (err: any) {
      alert(err?.message || 'Failed to attach document.');
    } finally {
      setIsAttaching(false);
    }
  };

  const handleDetachDocument = async (docId: string) => {
    if (!data?.application?.id) return;
    try {
      await applicationService.detachDocument(data.application.id, docId);
      await loadWorkspace();
    } catch (err: any) {
      alert(err?.message || 'Failed to detach document.');
    }
  };

  const opp = data?.opportunity;
  const app = data?.application;
  const readiness = data?.readiness;
  const attachedDocs = data?.attachedDocuments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-card-hover my-8 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700">
                Application Preparation Workspace
              </span>
              {app?.human_approved ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Human Approved & Ready
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  Preparation Draft
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
              {opp?.title || 'Application Preparation'}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{opp?.organizationName || (opp as any)?.organization_name}</span>
              {(opp?.applicationDeadline || (opp as any)?.application_deadline) && (
                <>
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Deadline:{' '}
                    {new Date(
                      opp?.applicationDeadline || (opp as any)?.application_deadline
                    ).toLocaleDateString()}
                  </span>
                </>
              )}
            </p>
          </div>


          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <LoadingState message="Loading your preparation workspace..." />
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="text-sm font-bold text-rose-900">Workspace Unavailable</h4>
            <p className="text-xs text-rose-700">{error}</p>
            <Button variant="outline" size="sm" onClick={loadWorkspace}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Readiness Audit Checklist */}
            {readiness?.checklist && (
              <ReadinessChecklist checklist={readiness.checklist} />
            )}

            {/* 2. Document Gap Analysis */}
            {readiness?.documentGap && (
              <DocumentGapPanel gapAnalysis={readiness.documentGap} />
            )}

            {/* 3. Certificate Guidance */}
            {guidance && (
              <CertificateGuidance guidance={guidance} />
            )}

            {/* 4. Attached Application Documents Manager */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Application Document Package ({attachedDocs.length} Attached)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Select verified documents from your vault to bundle with this application.
                  </p>
                </div>
              </div>

              {/* Attached List */}
              {attachedDocs.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  No documents attached yet. Attach your resume and marksheets from your vault below.
                </div>
              ) : (
                <div className="space-y-2">
                  {attachedDocs.map((item: any) => {
                    const doc = item.documents;
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-600" />
                          <span className="font-bold text-slate-900">{doc?.title || 'Attached Document'}</span>
                          <span className="text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-semibold">
                            {item.purpose || doc?.document_type}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDetachDocument(item.document_id)}
                          className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Detach
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attach from Vault Picker */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 mb-2">Available Vault Documents:</p>
                {studentDocs.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Your vault is currently empty. Go to Document Vault to upload your documents.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentDocs.map((doc) => {
                      const isAttached = attachedDocs.some((a: any) => a.document_id === doc.id);
                      return (
                        <div
                          key={doc.id}
                          className="p-2.5 bg-slate-50/60 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="truncate mr-2">
                            <p className="font-bold text-slate-800 truncate">{doc.title}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{doc.document_type}</p>
                          </div>
                          {isAttached ? (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Attached
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAttachDocument(doc.id, doc.document_type)}
                              disabled={isAttaching}
                              leftIcon={<Plus className="w-3 h-3" />}
                              className="text-[11px] px-2 py-1 h-7"
                            >
                              Attach
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 5. AI Writing Assistant Panel */}
            {app?.id && (
              <ApplicationDraftPanel
                applicationId={app.id}
                opportunityTitle={opp?.title || ''}
                initialDrafts={app.draft_content || {}}
                onDraftSaved={loadWorkspace}
              />
            )}

            {/* 6. Human Approval & Portal Submission Footer */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Human-In-The-Loop Decision Gate
                  </h4>
                </div>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  Review your readiness checklist, attached documents, and tailored drafts. When you
                  are satisfied, approve your preparation package and proceed to the official portal.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {!app?.human_approved ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsApprovalOpen(true)}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                  >
                    Review & Approve Application
                  </Button>
                ) : (
                  <a
                    href={opp?.officialUrl || (opp as any)?.official_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto"
                  >
                    <Button
                      variant="gradient"
                      size="md"
                      rightIcon={<ExternalLink className="w-4 h-4" />}
                      className="w-full font-bold shadow-md shadow-brand-500/20"
                    >
                      Apply on Official Portal
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Human Approval Modal */}
        {app?.id && opp?.title && (
          <HumanApprovalModal
            isOpen={isApprovalOpen}
            onClose={() => setIsApprovalOpen(false)}
            applicationId={app.id}
            opportunityTitle={opp.title}
            officialUrl={opp?.officialUrl || (opp as any)?.official_url}
            onApprovalSuccess={loadWorkspace}
          />
        )}
      </div>
    </div>
  );
};

