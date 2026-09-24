import React, { useEffect, useState } from 'react';
import { UploadCloud, FolderLock, Filter, Plus, ShieldCheck } from 'lucide-react';
import { DocumentRecord, CanonicalDocumentType, DOCUMENT_TYPE_LABELS } from '../types/documents';
import { documentService } from '../services/documentService';
import { DocumentCard } from './DocumentCard';
import { DocumentUploadModal } from './DocumentUploadModal';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/ui/LoadingState';

export const DocumentVault: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (newDoc: DocumentRecord) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteSuccess = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const filteredDocs =
    filterType === 'all'
      ? documents
      : documents.filter((d) => d.document_type === filterType);

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Student Document Vault</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely store and manage resumes, marksheets, and government certificates for verified applications.
            </p>
          </div>
        </div>

        <Button
          variant="gradient"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold shrink-0"
        >
          Upload Document
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none"
          >
            <option value="all">All Documents ({documents.length})</option>
            {(Object.keys(DOCUMENT_TYPE_LABELS) as CanonicalDocumentType[]).map((key) => {
              const count = documents.filter((d) => d.document_type === key).length;
              if (count === 0) return null;
              return (
                <option key={key} value={key}>
                  {DOCUMENT_TYPE_LABELS[key]} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Private End-to-End Isolated Storage</span>
        </div>
      </div>

      {/* Document Grid / Empty State */}
      {loading ? (
        <LoadingState message="Loading your Document Vault..." />
      ) : documents.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-100 text-center space-y-4 max-w-lg mx-auto my-8">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No documents uploaded yet.</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload your technical resume, academic marksheets, or community certificates to unlock automated application preparation.
          </p>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Your First Document
          </Button>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
          No documents found for selected category "{DOCUMENT_TYPE_LABELS[filterType as CanonicalDocumentType]}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};
