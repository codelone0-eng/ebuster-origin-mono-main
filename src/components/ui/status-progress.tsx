import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, MailQuestion, MessageSquare, X } from 'lucide-react';

interface StatusProgressProps {
  currentStatus: string;
  onStatusChange?: (status: string) => void;
  isAdmin?: boolean;
}

const statusSteps = [
  { id: 'new', label: 'Новый', icon: MessageSquare, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'open', label: 'В работе', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'pending_customer', label: 'Ожидает ответа', icon: MailQuestion, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { id: 'resolved', label: 'Решен', icon: Check, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
  { id: 'closed', label: 'Закрыт', icon: X, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' }
];

export const StatusProgress: React.FC<StatusProgressProps> = ({ 
  currentStatus, 
  onStatusChange,
  isAdmin = false 
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {statusSteps.map((step) => {
        const isActive = step.id === currentStatus;
        const isClickable = isAdmin && onStatusChange;

        return (
          <Badge
            key={step.id}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => isClickable && onStatusChange?.(step.id)}
            className={cn(
              'py-2 px-4 text-sm font-medium transition-all',
              isClickable && 'cursor-pointer hover:bg-accent',
              isActive && `${step.color.replace('text-', 'bg-').replace('/10', '/20')} text-white`,
              !isActive && 'border-dashed'
            )}
          >
            <step.icon className="h-4 w-4 mr-2" />
            {step.label}
          </Badge>
        );
      })}
    </div>
  );
};

