import React from 'react';
import { DocumentVault } from '../features/documents';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <DocumentVault />
    </div>
  );
};

