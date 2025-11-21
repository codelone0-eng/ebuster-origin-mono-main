import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, Plus, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
  variant?: 'default' | 'search' | 'filter';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
  variant = 'default'
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="h-12 w-12 text-muted-foreground/50" />;
      case 'filter':
        return <Filter className="h-12 w-12 text-muted-foreground/50" />;
      default:
        return <FileQuestion className="h-12 w-12 text-muted-foreground/50" />;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">{displayIcon}</div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
