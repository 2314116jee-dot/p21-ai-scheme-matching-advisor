import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast(message, 'success', title),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast(message, 'error', title, 6000),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast(message, 'info', title),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', title, 5000),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}

      {/* Floating Accessible Toast Viewport */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
              error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
              info: <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />,
              warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
            };

            const borderColors = {
              success: 'border-emerald-200 bg-emerald-50/95 text-emerald-950',
              error: 'border-rose-200 bg-rose-50/95 text-rose-950',
              info: 'border-sky-200 bg-sky-50/95 text-sky-950',
              warning: 'border-amber-200 bg-amber-50/95 text-amber-950',
            };

            return (
              <motion.div
                key={toast.id}
                role="status"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-lg border shadow-lg backdrop-blur-xs text-xs font-medium ${
                  borderColors[toast.type]
                }`}
              >
                <div className="flex items-start space-x-2.5 mr-2">
                  {icons[toast.type]}
                  <div>
                    {toast.title && (
                      <p className="font-bold text-[13px] leading-tight mb-0.5">{toast.title}</p>
                    )}
                    <p className="leading-relaxed opacity-90">{toast.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="opacity-60 hover:opacity-100 transition-opacity p-0.5 text-stone-500 hover:text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 rounded shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
