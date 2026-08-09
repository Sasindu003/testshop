import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal props:
 *   open:       bool
 *   onClose:    () => void
 *   title:      string
 *   size:       'sm' | 'md' | 'lg' | 'xl'
 *   children
 */
const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, size = 'md', children }) {
  const dialogRef = useRef(null);
  const prevFocus = useRef(null);

  // Trap focus and restore on close
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      dialogRef.current?.focus();
    } else {
      prevFocus.current?.focus();
    }
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    const handle = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} bg-surface rounded-lg border border-border shadow-xl focus:outline-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {title && (
            <h2 id="modal-title" className="font-serif text-xl text-primary">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="ml-auto text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
