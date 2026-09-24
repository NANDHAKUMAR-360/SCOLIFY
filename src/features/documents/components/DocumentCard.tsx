import React, { useState } from 'react';
import { FileText, ExternalLink, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { DocumentRecord, DOCUMENT_TYPE_LABELS } from '../types/documents';

import { DocumentStatusBadge } from './DocumentStatusBadge';
import { documentService } from '../services/documentService';
import { Button } from '../../../components/ui/Button';

interface DocumentCardProps {
  document: DocumentRecord;
  onDeleteSuccess: (documentId: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const handleView = async () => {
    if (document.viewUrl) {
      window.open(document.viewUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setIsLoadingUrl(true);
    try {
      const url = await documentService.getSignedUrl(document.id);
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert('Could not generate secure view URL for this document.');
      }
    } catch (err) {
      console.error('Failed to get signed URL', err);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove "${document.title}" from your vault?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      const success = await documentService.deleteDocument(document.id);
      if (success) {
        onDeleteSuccess(document.id);
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = document.created_at
    ? new Date(document.created_at).toLocaleDateString()
    : 'Unknown date';

  const typeLabel = DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-card-soft transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">{document.title}</h4>
            <p className="text-xs font-semibold text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded-md inline-block">
              {typeLabel}
            </p>
          </div>
        </div>
        <DocumentStatusBadge status={document.verification_status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Uploaded: {formattedDate}</span>
        </div>
        {document.expiry_date ? (
          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Expires: {new Date(document.expiry_date).toLocaleDateString()}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>No Expiry</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isDeleting ? 'Removing...' : 'Delete'}
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          isLoading={isLoadingUrl}
          rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          className="text-xs font-semibold"
        >
          View Secure Copy
        </Button>
      </div>
    </div>
  );
};
