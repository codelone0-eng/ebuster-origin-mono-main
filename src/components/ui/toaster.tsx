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
        return <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
      default:
        return <Info className="h-5 w-5 text-white/60 flex-shrink-0" />
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
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(variant)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <ToastTitle className="font-semibold text-white mb-1">
                      {title}
                    </ToastTitle>
                  )}
                  {description && (
                    <ToastDescription className="text-sm text-white/70">
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