import { File, FileImage, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteDocument } from '@/features/documents/hooks/useDocuments';
import {
  type AppDocument,
  DOCUMENT_CATEGORY_LABELS,
} from '@/features/documents/types';
import { formatFileSize, parseTags } from '@/features/documents/utils';
import { useToast } from '@/hooks/useToast';

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType.startsWith('image/'))
    return <FileImage aria-hidden="true" className="size-5" />;
  if (fileType === 'application/pdf')
    return <FileText aria-hidden="true" className="size-5" />;
  return <File aria-hidden="true" className="size-5" />;
}

export interface DocumentCardProps {
  document: AppDocument;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const deleteDocument = useDeleteDocument();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const tags = parseTags(document.tags);

  const handleDelete = async () => {
    await deleteDocument.mutateAsync(document.id);
    setConfirmOpen(false);
    toast({ variant: 'success', title: 'Document deleted' });
  };

  return (
    <Card className="min-w-0 gap-2 p-4 flex flex-col">
      <div className="gap-2 flex items-start justify-between">
        <div className="min-w-0 gap-2 flex items-center">
          <div className="size-9 flex shrink-0 items-center justify-center rounded-lg bg-surface-raised text-foreground-tertiary">
            <FileIcon fileType={document.fileType} />
          </div>
          <div className="min-w-0 flex flex-col">
            <h3 className="font-semibold truncate text-body-sm text-foreground">
              {document.fileName}
            </h3>
            <p className="text-caption text-foreground-tertiary">
              {formatFileSize(document.sizeBytes)}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`More actions for ${document.fileName}`}
              className="size-8 flex shrink-0 items-center justify-center rounded-md text-foreground-tertiary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <MoreVertical aria-hidden="true" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {document.url && (
              <DropdownMenuItem asChild>
                <a href={document.url} download={document.fileName}>
                  Download
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem destructive onSelect={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="gap-1.5 flex flex-wrap">
        <Badge variant="neutral">
          {DOCUMENT_CATEGORY_LABELS[document.category]}
        </Badge>
        {tags.map((tag) => (
          <Badge key={tag} variant="brand">
            {tag}
          </Badge>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this document?"
        description={`"${document.fileName}" will be removed. This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteDocument.isPending}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
