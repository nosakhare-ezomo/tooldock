"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgMap: Record<ToastType, string> = {
    success: "bg-emerald-500/90 border-emerald-400/50",
    error: "bg-red-500/90 border-red-400/50",
    info: "bg-blue-500/90 border-blue-400/50",
  };

  const iconMap: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl text-white font-semibold text-sm backdrop-blur-md transition-all duration-300 ${bgMap[toast.type]} ${
        exiting ? "opacity-0 translate-x-8" : "opacity-100 animate-slide-in-right"
      }`}
      style={{ WebkitBackdropFilter: "blur(12px)" }}
      role="alert"
    >
      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black flex-shrink-0">
        {iconMap[toast.type]}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="ml-2 text-white/60 hover:text-white transition-colors text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
