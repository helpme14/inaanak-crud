import { useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 12000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, message, type };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="flex-shrink-0 w-6 h-6 text-green-600" />;
      case "error":
        return <AlertCircle className="flex-shrink-0 w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="flex-shrink-0 w-6 h-6 text-amber-600" />;
      case "info":
      default:
        return <Info className="flex-shrink-0 w-6 h-6 text-blue-600" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-l-4 border-green-500";
      case "error":
        return "bg-red-50 border-l-4 border-red-500";
      case "warning":
        return "bg-amber-50 border-l-4 border-amber-500";
      case "info":
      default:
        return "bg-blue-50 border-l-4 border-blue-500";
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "text-green-900";
      case "error":
        return "text-red-900";
      case "warning":
        return "text-amber-900";
      case "info":
      default:
        return "text-blue-900";
    }
  };

  return (
    <div className="fixed z-50 max-w-md space-y-3 pointer-events-none bottom-4 left-4 sm:top-6 sm:right-6 sm:bottom-auto sm:left-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-4 p-4 rounded-lg ${getBgColor(
            toast.type
          )} shadow-xl animate-toast-enter`}
        >
          {getIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${getTextColor(toast.type)}`}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 p-1 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
