import React, { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './Toast';

const ToastContext = createContext(null);

let _id = 0;

/**
 * Wrap your app (inside main.jsx) with <ToastProvider>.
 * Then call useToast() anywhere to get { toast }.
 *
 * toast('message')                      → info
 * toast('message', 'success')
 * toast('message', 'error')
 * toast('message', 'warning')
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info') => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end"
        >
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
