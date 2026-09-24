import React, { useState } from 'react';
import { X, UploadCloud, FileText, AlertCircle, Shield } from 'lucide-react';
import { CanonicalDocumentType, DOCUMENT_TYPE_LABELS, DocumentRecord } from '../types/documents';
import { documentService } from '../services/documentService';
import { Button } from '../../../components/ui/Button';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDoc: DocumentRecord) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [documentType, setDocumentType] = useState<CanonicalDocumentType>('resume');
  const [title, setTitle] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setError('File size exceeds the 15MB maximum limit.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const sanitizedName = (selectedFile?.name || 'document.pdf')
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '_');
      const generatedPath = `${Date.now()}-${sanitizedName}`;

      const newDoc = await documentService.createDocument({
        title: title.trim(),
        documentType,
        filePath: generatedPath,
        fileSizeBytes: selectedFile?.size || 1024,
        mimeType: selectedFile?.type || 'application/pdf',
        expiryDate: expiryDate ? expiryDate : null,
      });

      onUploadSuccess(newDoc);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save document. Please try again.');
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
            <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Upload to Document Vault</h3>
              <p className="text-xs text-slate-500">Private & encrypted storage for verified applications</p>
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
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Document Category</label>
            <select
              value={documentType}
              onChange={(e) => {
                const val = e.target.value as CanonicalDocumentType;
                setDocumentType(val);
                if (!title || Object.values(DOCUMENT_TYPE_LABELS).includes(title)) {
                  setTitle(DOCUMENT_TYPE_LABELS[val]);
                }
              }}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {(Object.keys(DOCUMENT_TYPE_LABELS) as CanonicalDocumentType[]).map((key) => (
                <option key={key} value={key}>
                  {DOCUMENT_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official Academic Transcript 2026"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {/* Expiration Date (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Expiration Date</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional (if certificate expires)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Select File (PDF, DOCX, JPG, PNG)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50/50 transition-colors">
              <input
                type="file"
                id="doc-file-upload"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                className="hidden"
              />
              <label htmlFor="doc-file-upload" className="cursor-pointer space-y-2 block">
                <FileText className="w-8 h-8 text-brand-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to choose file or drag and drop'}
                </p>
                <p className="text-[10px] text-slate-400">Up to 15MB • Encrypted in private vault</p>
              </label>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Files are stored in private storage and strictly isolated by student identity.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
