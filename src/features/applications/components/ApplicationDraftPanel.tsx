import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Mail,
  PenTool,
  Check,
  Copy,
  AlertCircle,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { AIDraftType } from '../../documents/types/readiness';
import { applicationService } from '../services/applicationService';
import { Button } from '../../../components/ui/Button';


interface ApplicationDraftPanelProps {
  applicationId: string;
  opportunityTitle: string;
  initialDrafts?: Record<string, any>;
  onDraftSaved?: () => void;
}

const DRAFT_TYPE_OPTIONS: { id: AIDraftType; label: string; icon: any; placeholder: string }[] = [
  {
    id: 'resume_tailoring',
    label: 'Resume Tailoring',
    icon: FileText,
    placeholder: 'Generate tailored resume bullet points and summary matching opportunity requirements...',
  },
  {
    id: 'statement_of_purpose',
    label: 'Statement of Purpose',
    icon: PenTool,
    placeholder: 'Draft an authentic academic or career statement based on your verified skills and goals...',
  },
  {
    id: 'scholarship_essay',
    label: 'Scholarship Essay',
    icon: FileText,
    placeholder: 'Draft a structured essay highlighting academic achievements and financial need...',
  },
  {
    id: 'internship_email',
    label: 'Inquiry / Cover Email',
    icon: Mail,
    placeholder: 'Draft a professional cover letter / email to the hiring manager or selection committee...',
  },
  {
    id: 'application_answer',
    label: 'Question Response',
    icon: Sparkles,
    placeholder: 'Draft answers for custom application prompts or behavioral questions...',
  },
];

export const ApplicationDraftPanel: React.FC<ApplicationDraftPanelProps> = ({
  applicationId,
  opportunityTitle,
  initialDrafts = {},
  onDraftSaved,
}) => {
  const [activeType, setActiveType] = useState<AIDraftType>('resume_tailoring');
  const [promptGuidance, setPromptGuidance] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [draftContent, setDraftContent] = useState<string>(
    initialDrafts[activeType]?.content || ''
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Switch tab
  const handleTabChange = (type: AIDraftType) => {
    setActiveType(type);
    setDraftContent(initialDrafts[type]?.content || '');
    setError(null);
    setSavedSuccess(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSavedSuccess(false);
    try {
      const res = await applicationService.generateAIDraft(applicationId, activeType, {
        promptGuidance: promptGuidance.trim() || undefined,
        questionText: questionText.trim() || undefined,
      });

      setDraftContent(res.content);
    } catch (err: any) {
      setError(
        err?.message ||
          'AI drafting failed. Check your Groq connection or complete your profile skills.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!draftContent) return;
    setIsSaving(true);
    setError(null);
    try {
      await applicationService.updateDraftContent(applicationId, activeType, draftContent);
      setSavedSuccess(true);
      if (onDraftSaved) onDraftSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save draft edits.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!draftContent) return;
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeOption = DRAFT_TYPE_OPTIONS.find((o) => o.id === activeType)!;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              AI Application Writing Assistant
            </h4>
            <p className="text-xs text-slate-500">
              Assists with drafting and tailoring. Uses ONLY verified student facts. Requires your review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No Fabricated Facts</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {DRAFT_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleTabChange(opt.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Guidance Input Form */}
      <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 text-xs">
        {activeType === 'application_answer' && (
          <div className="space-y-1">
            <label className="font-bold text-slate-800">Application Prompt / Question</label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Describe a technical challenge you solved and what you learned..."
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="font-bold text-slate-800">
            Specific Focus or Additional Context (Optional)
          </label>
          <input
            type="text"
            value={promptGuidance}
            onChange={(e) => setPromptGuidance(e.target.value)}
            placeholder="e.g. Emphasize my React open-source contributions and algorithmic coursework..."
            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-500">
            Tailoring for: <span className="font-bold text-slate-700">{opportunityTitle}</span>
          </p>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleGenerate}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            {draftContent ? 'Regenerate Draft' : 'Generate AI Draft'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Draft Editor Workspace */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span>Draft Workspace ({activeOption.label})</span>
            {savedSuccess && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Changes Saved!
              </span>
            )}
          </div>

          {draftContent && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 p-1 hover:bg-slate-100 rounded"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Save Edits
              </Button>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          rows={10}
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder={activeOption.placeholder}
          className="w-full text-xs font-mono p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Human In The Loop Notice */}
        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
          <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-700">
            Mandatory Student Review Notice
          </span>
          <p className="leading-relaxed">
            Every draft is an AI-assisted proposal. You are responsible for reviewing, verifying, and customizing details before finalizing. Replace any bracketed placeholders like <code className="bg-amber-100 px-1 rounded">[Add your project details]</code> with your actual accomplishments.
          </p>
        </div>
      </div>
    </div>
  );
};
