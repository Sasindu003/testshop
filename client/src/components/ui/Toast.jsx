import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'border-success/30 bg-success/10 text-success',
  error:   'border-error/30   bg-error/10   text-error',
  info:    'border-accent/30  bg-accent/10  text-accent',
  warning: 'border-yellow-500/30 bg-yellow-50 text-yellow-700',
};

/**
 * Single toast item — rendered by ToastProvider.
 */
export function Toast({ id, message, type = 'info', onDismiss }) {
  const Icon = icons[type] || Info;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 px-4 py-3 rounded border shadow-lg font-sans text-sm max-w-sm w-full ${styles[type]}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
