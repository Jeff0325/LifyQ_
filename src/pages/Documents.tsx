import { Upload } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  DocumentFilterBar,
  DocumentsGrid,
  DocumentUploadDialog,
} from '@/features/documents';
import {
  DEFAULT_DOCUMENT_FILTERS,
  type DocumentFilters,
} from '@/features/documents/types';

export function Documents() {
  const [filters, setFilters] = useState<DocumentFilters>(
    DEFAULT_DOCUMENT_FILTERS,
  );
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <div className="gap-3 flex items-center justify-between">
        <h2 className="font-semibold text-h2 text-foreground">Documents</h2>
        <Button onClick={() => setUploadOpen(true)} size="sm">
          <Upload aria-hidden="true" />
          Upload
        </Button>
      </div>

      <DocumentFilterBar filters={filters} onChange={setFilters} />

      <DocumentsGrid filters={filters} onCreate={() => setUploadOpen(true)} />

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </PageContainer>
  );
}
