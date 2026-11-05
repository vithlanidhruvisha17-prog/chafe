import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-ivory border border-sage/40 shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-forest shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-coffee shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sage-dark shrink-0" />}
              <p className="text-sm font-medium text-charcoal leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-charcoal/50 hover:text-charcoal p-1 rounded-full transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
