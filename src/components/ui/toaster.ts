/**
 * Toaster API - Chakra UI style
 * Simple API for creating and managing toast notifications
 * 
 * Usage:
 *   toaster.create({ description: "File saved successfully", type: "info" })
 *   toaster.dismiss()
 */

import { toast as baseToast } from "@/hooks/use-toast";
import { dispatch } from "@/hooks/use-toast";

export type ToastType = "success" | "error" | "warning" | "info" | "default";

export interface ToastOptions {
  description: string;
  type?: ToastType;
  title?: string;
  duration?: number;
}

const mapTypeToVariant = (type?: ToastType): "default" | "destructive" | "success" | "warning" | "info" => {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "destructive";
    case "warning":
      return "warning";
    case "info":
      return "info";
    default:
      return "default";
  }
};

class Toaster {
  /**
   * Create a new toast notification
   */
  create(options: ToastOptions) {
    const { description, type = "default", title, duration = 3000 } = options;
    
    return baseToast({
      title: title || this.getDefaultTitle(type),
      description,
      variant: mapTypeToVariant(type),
      duration,
    });
  }

  /**
   * Dismiss all toast notifications
   */
  dismiss() {
    dispatch({ type: "DISMISS_TOAST" });
  }

  /**
   * Get default title based on type
   */
  private getDefaultTitle(type: ToastType): string {
    switch (type) {
      case "success":
        return "Успешно";
      case "error":
        return "Ошибка";
      case "warning":
        return "Предупреждение";
      case "info":
        return "Информация";
      default:
        return "";
    }
  }
}

// Export singleton instance
export const toaster = new Toaster();

// Re-export Toaster component from toaster.tsx
export { Toaster } from './toaster.tsx';

