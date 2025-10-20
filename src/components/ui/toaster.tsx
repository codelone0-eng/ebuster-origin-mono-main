import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertTriangle, Info, AlertCircle, XCircle } from "lucide-react"
import { useEffect, useMemo } from "react"
import { createPortal } from "react-dom"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Debug: log toasts
  console.log('Toaster rendered with toasts:', toasts);

  // Auto-dismiss toasts after 3 seconds
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.open) {
        const timer = setTimeout(() => {
          dismiss(toast.id);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dismiss]);

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return <XCircle className="h-5 w-5 text-destructive-foreground flex-shrink-0" />
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-50 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-50 flex-shrink-0" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-50 flex-shrink-0" />
      default:
        return <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
    }
  }

  const toastRoot = useMemo(() => {
    if (typeof document === 'undefined') return null
    const id = 'toast-portal-root'
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('div')
      el.id = id
      document.body.appendChild(el)
    }
    return el
  }, [])

  if (!toastRoot) return null

  return createPortal(
    (
      <ToastProvider>
        {toasts.map(function ({ id, title, description, action, variant, ...props }) {
          return (
            <Toast 
              key={id} 
              {...props} 
              duration={3000}
              variant={variant}
            >
              <div className="flex items-start gap-3 w-full">
                {/* Animated icon with subtle pulse */}
                <div className="relative">
                  {getIcon(variant)}
                  <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <ToastTitle className="font-semibold text-foreground mb-1">
                      {title}
                    </ToastTitle>
                  )}
                  {description && (
                    <ToastDescription className="text-sm text-muted-foreground">
                      {description}
                    </ToastDescription>
                  )}
                </div>
              </div>
              
              {/* Action button */}
              {action && (
                <div className="flex-shrink-0 ml-2">
                  {action}
                </div>
              )}
              
              {/* Close button */}
              <ToastClose className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Toast>
          )
        })}
        <ToastViewport />
      </ToastProvider>
    ),
    toastRoot
  )
}