import React from 'react';
import { Download, File, Image, FileText, FileSpreadsheet, FileCode, X } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
  uploaded_by?: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return File;
  
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('text') || mimeType.includes('code')) return FileCode;
  
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onDelete,
  canDelete = false
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.mime_type);
        const isImage = attachment.mime_type?.startsWith('image/');
        
        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted transition-colors"
          >
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
              isImage ? "bg-blue-500/10" : "bg-gray-500/10"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isImage ? "text-blue-600" : "text-gray-600"
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.original_filename}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</span>
                {attachment.mime_type && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {attachment.mime_type.split('/')[1] || 'file'}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(attachment.file_path, '_blank')}
                className="h-8 w-8 p-0"
                title="Скачать"
              >
                <Download className="h-4 w-4" />
              </Button>
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(attachment.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Удалить"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

