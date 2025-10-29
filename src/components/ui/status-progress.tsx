import React from 'react';
import { cn } from '@/lib/utils';

interface StatusProgressProps {
  currentStatus: string;
  onStatusChange?: (status: string) => void;
  isAdmin?: boolean;
}

const statusSteps = [
  { id: 'new', label: 'Новое', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-400' },
  { id: 'open', label: 'В работе', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-400' },
  { id: 'pending_customer', label: 'Ожидает ответа', color: 'bg-orange-500', hoverColor: 'hover:bg-orange-400' },
  { id: 'resolved', label: 'Решено', color: 'bg-green-500', hoverColor: 'hover:bg-green-400' },
  { id: 'closed', label: 'Закрыто', color: 'bg-gray-500', hoverColor: 'hover:bg-gray-400' }
];

export const StatusProgress: React.FC<StatusProgressProps> = ({ 
  currentStatus, 
  onStatusChange,
  isAdmin = false 
}) => {
  const currentIndex = statusSteps.findIndex(step => step.id === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="flex items-center gap-2 w-full max-w-3xl">
      {statusSteps.map((step, index) => {
        const isActive = index <= activeIndex;
        const isClickable = isAdmin && onStatusChange && index >= 0;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => isClickable && onStatusChange?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium text-white transition-all",
                "relative overflow-hidden",
                isActive ? step.color : "bg-gray-300",
                isClickable && "cursor-pointer",
                isClickable && step.hoverColor,
                !isClickable && "cursor-default"
              )}
              style={{
                flex: '1 1 0%',
                minWidth: 0
              }}
            >
              <span className="relative z-10">{step.label}</span>
              {isActive && index === activeIndex && (
                <div className="absolute inset-0 bg-black/10" />
              )}
            </button>
            {index < statusSteps.length - 1 && (
              <div className={cn(
                "flex-shrink-0 w-2 h-2 rounded-full transition-colors",
                index < activeIndex ? step.color : "bg-gray-300"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

