import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
  type?: NotificationType;
  title: string;
  message: string;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  onClose?: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: "text-neutral-300",
  error: "text-neutral-400",
  info: "text-neutral-300",
  warning: "text-neutral-400",
};

export const Notification = ({
  type = "info",
  title,
  message,
  actions,
  onClose,
}: NotificationProps) => {
  const Icon = iconMap[type];

  return (
    <div className="glass-effect rounded-lg p-4 max-w-md animate-fade-in">
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", colorMap[type])} />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{message}</p>
          
          {actions && actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className="h-8 px-3 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export const NotificationContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed top-20 right-4 z-toast flex flex-col gap-2 max-w-md">
      {children}
    </div>
  );
};
