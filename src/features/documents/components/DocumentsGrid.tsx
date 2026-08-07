import { FolderOpen } from 'lucide-react';
import { useMemo } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StaggerItem, StaggerList } from '@/components/shared/motion';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/features/documents/components/DocumentCard';
import { DocumentsSkeleton } from '@/features/documents/components/DocumentsSkeleton';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import type { AppDocument, DocumentFilters } from '@/features/documents/types';

function matchesFilters(
  document: AppDocument,
  filters: DocumentFilters,
): boolean {
  if (filters.category !== 'all' && document.category !== filters.category)
    return false;
  if (filters.search.trim()) {
    const needle = filters.search.trim().toLowerCase();
    const haystack = `${document.fileName} ${document.tags}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export interface DocumentsGridProps {
  filters: DocumentFilters;
  onCreate: () => void;
}

export function DocumentsGrid({ filters, onCreate }: DocumentsGridProps) {
  const { data: documents, isLoading, isError, refetch } = useDocuments();

  const visible = useMemo(() => {
    if (!documents) return [];
    return [...documents]
      .filter((document) => matchesFilters(document, filters))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [documents, filters]);

  if (isLoading) return <DocumentsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your documents"
        onRetry={() => void refetch()}
      />
    );
  }

  if (documents && documents.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents yet"
        description="Upload a receipt, contract, or certificate to keep it somewhere findable."
        module="documents"
        action={<Button onClick={onCreate}>Upload document</Button>}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No documents match your filters"
        description="Try a different search or category."
      />
    );
  }

  return (
    <StaggerList className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
      {visible.map((document) => (
        <StaggerItem key={document.id}>
          <DocumentCard document={document} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
