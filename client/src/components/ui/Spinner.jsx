import React from 'react';

const sizeCls = {
  sm:  'w-4 h-4 border-2',
  md:  'w-7 h-7 border-2',
  lg:  'w-12 h-12 border-[3px]',
};

/**
 * Spinner props:
 *   size:  'sm' | 'md' | 'lg'
 *   label: string — aria-label (defaults to "Loading")
 */
export default function Spinner({ size = 'md', label = 'Loading', className = '' }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block rounded-full border-border border-t-accent animate-spin ${sizeCls[size]} ${className}`}
    />
  );
}
