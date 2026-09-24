import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { ShieldCheck, Database, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export const AdminReviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'review' | 'ingest'>('review');
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [actionReasoning, setActionReasoning] = useState('');

  // Manual Ingestion State
  const [sourceType, setSourceType] = useState('DEMO');
  const [manualTitle, setManualTitle] = useState('');
  const [manualOrg, setManualOrg] = useState('');
  const [manualCategory, setManualCategory] = useState('scholarship');
  const [manualDesc, setManualDesc] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const loadReviewList = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviewList();
      setReviewItems(data || []);
    } catch (err: any) {
      console.error('Failed to load review items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'review') {
      loadReviewList();
    }
  }, [activeTab]);

  const inspectItem = async (item: any) => {
    setSelectedItem(item);
    try {
      const det = await adminService.getVerificationDetails(item.id);
      setDetails(det);
    } catch (err: any) {
      console.error('Failed to load details:', err);
    }
  };

  const handleVerify = async (status: string) => {
    if (!selectedItem) return;
    try {
      await adminService.verifyAction(
        selectedItem.id,
        status,
        actionReasoning || `Admin verification action: set status to ${status}`
      );
      setSelectedItem(null);
      setDetails(null);
      setActionReasoning('');
      loadReviewList();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleTriggerIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIngestStatus('Running ingestion pipeline...');
    try {
      let payload: any = undefined;
      if (sourceType === 'MANUAL') {
        payload = {
          title: manualTitle,
          organizationName: manualOrg,
          category: manualCategory,
          description: manualDesc,
          officialUrl: manualUrl,
        };
      }
      const res = await adminService.triggerIngestion({ sourceType, payload });
      setIngestStatus(`Ingestion completed! Run ID: ${res.run.id}. Total: ${res.run.total_records}, Verified: ${res.run.successful_records}, Pending: ${res.run.verification_pending_records}`);
      if (sourceType === 'MANUAL') {
        setManualTitle('');
        setManualOrg('');
        setManualDesc('');
        setManualUrl('');
      }
    } catch (err: any) {
      setIngestStatus(`Ingestion failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-gray-100">
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            Scolify Admin Opportunity & Verification Control Panel
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Part 04 Controlled Ingestion, Evidence Audit & Verification Engine
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'review' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Review Catalog ({reviewItems.length})
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'ingest' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Ingestion Pipeline
          </button>
        </div>
      </div>

      {activeTab === 'review' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Item List */}
          <div className="lg:col-span-5 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Opportunity Catalog</h2>
              <button
                onClick={loadReviewList}
                className="p-1.5 text-gray-400 hover:text-white bg-gray-800 rounded-md"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400 py-4">Loading Catalog...</p>
            ) : reviewItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">No review items found.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {reviewItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => inspectItem(item)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedItem?.id === item.id
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono uppercase">
                        {item.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                          item.verification_status === 'verified'
                            ? 'bg-emerald-950 text-emerald-300'
                            : item.verification_status === 'partially_verified'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {item.verification_status}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.organization_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Verification Panel */}
          <div className="lg:col-span-7 bg-gray-900 border border-gray-800 rounded-xl p-6">
            {selectedItem ? (
              <div>
                <div className="border-b border-gray-800 pb-4 mb-4">
                  <h2 className="text-xl font-bold mb-1">{selectedItem.title}</h2>
                  <p className="text-sm text-gray-400">{selectedItem.organization_name}</p>
                  {selectedItem.official_url && (
                    <a
                      href={selectedItem.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-indigo-400 hover:underline mt-2 gap-1"
                    >
                      Official URL: {selectedItem.official_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {details?.verificationEvaluation && (
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-4">
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex-1">
                        <div className="text-xs text-gray-400">Confidence Score</div>
                        <div className="text-xl font-bold text-indigo-400">
                          {Math.round(details.verificationEvaluation.confidence * 100)}%
                        </div>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex-1">
                        <div className="text-xs text-gray-400">Duplicate Check</div>
                        <div className="text-sm font-semibold capitalize mt-1">
                          {details.duplicateCheck?.status || 'unique'}
                        </div>
                      </div>
                      <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 flex-1">
                        <div className="text-xs text-gray-400">Expiry Check</div>
                        <div className="text-sm font-semibold capitalize mt-1">
                          {details.expiryCheck?.status || 'active'}
                        </div>
                      </div>
                    </div>

                    {/* Verification Checks */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">
                        Deterministic Verification Engine Checks (8 Rules)
                      </h4>
                      <div className="space-y-2 bg-gray-950 p-3 rounded-lg border border-gray-800">
                        {details.verificationEvaluation.checks.map((check: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            {check.passed ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold">{check.name}: </span>
                              <span className="text-gray-300">{check.details}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="pt-4 border-t border-gray-800">
                      <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">
                        Admin Action Reasoning
                      </label>
                      <input
                        type="text"
                        value={actionReasoning}
                        onChange={(e) => setActionReasoning(e.target.value)}
                        placeholder="Enter audit reasoning for this status change..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 mb-3 focus:outline-none focus:border-indigo-500"
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVerify('verified')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleVerify('partially_verified')}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                        >
                          Partially Verify
                        </button>
                        <button
                          onClick={() => handleVerify('unverified')}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                        >
                          Reject / Flag
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select an opportunity record from the list to inspect source evidence and execute admin actions.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Ingestion Pipeline Tab */
        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Ingestion Pipeline Trigger
          </h2>

          <form onSubmit={handleTriggerIngestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Source Adapter Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="DEMO">Curated Demo Adapter (Hackathon Suite)</option>
                <option value="MANUAL">Manual Admin Entry Adapter</option>
              </select>
            </div>

            {sourceType === 'MANUAL' && (
              <div className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={manualOrg}
                    onChange={(e) => setManualOrg(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category *</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm"
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="internship">Internship</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="grant">Grant</option>
                    <option value="competition">Competition</option>
                    <option value="research">Research</option>
                    <option value="apprenticeship">Apprenticeship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Official URL *</label>
                  <input
                    type="url"
                    required
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={manualDesc}
                    onChange={(e) => setManualDesc(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Run Ingestion & Verification Pipeline
            </button>
          </form>

          {ingestStatus && (
            <div className="mt-4 p-3 bg-gray-950 border border-indigo-900 rounded-lg text-xs text-indigo-300 font-mono">
              {ingestStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
