import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ArrowRight, Sparkles } from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../lib/apiClient';
import { LoadingState } from '../components/ui/LoadingState';
import { ApplicationPreparationWorkspace } from '../features/applications';

export interface ApplicationRecord {
  id: string;
  opportunity_id: string;
  status: string;
  human_approved: boolean;
  approved_at?: string | null;
  submitted_at?: string | null;
  created_at: string;
  opportunities?: {
    id: string;
    title: string;
    organization_name: string;
    application_deadline?: string;
  };
}

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient<ApplicationRecord[]>('/applications');
      if (res && res.data) {
        setApplications(res.data);
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleOpenWorkspace = (oppId: string) => {
    setSelectedOppId(oppId);
    setIsWorkspaceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card-soft space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <FolderKanban className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">Application Tracking & Human Control</h1>
        </div>
        <p className="text-xs text-slate-500">
          Review application drafts and track progress. Remember: Applications are ONLY submitted after your explicit human approval.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading your tracked applications..." />
      ) : applications.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-100 text-center space-y-4 max-w-lg mx-auto my-8">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Active Applications Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You haven't started or saved an application draft yet. Explore verified scholarships and tech internships to begin your application workflow.
          </p>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate('/opportunities')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Verified Opportunities
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const oppTitle = app.opportunities?.title || 'Verified Opportunity';
            const orgName = app.opportunities?.organization_name || 'Verified Sponsor';
            const deadline = app.opportunities?.application_deadline
              ? new Date(app.opportunities.application_deadline).toLocaleDateString()
              : 'No deadline';

            return (
              <Card
                key={app.id}
                isHoverable={false}
                className="border-l-4 border-l-brand-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={app.human_approved ? 'emerald' : 'amber'}>
                      {app.human_approved ? 'Approved & Ready' : 'Preparation Draft'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">Status: {app.status}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{oppTitle}</h3>
                  <p className="text-xs text-slate-500">{orgName} • Deadline: {deadline}</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto bg-white"
                    onClick={() => handleOpenWorkspace(app.opportunity_id)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                  >
                    Open Workspace
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Application Preparation Workspace Modal */}
      {selectedOppId && (
        <ApplicationPreparationWorkspace
          opportunityId={selectedOppId}
          isOpen={isWorkspaceOpen}
          onClose={() => {
            setIsWorkspaceOpen(false);
            loadApplications();
          }}
        />
      )}
    </div>
  );
};

