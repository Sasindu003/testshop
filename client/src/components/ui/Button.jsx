import React from 'react';
import Spinner from './Spinner';

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variants = {
  primary:   'bg-primary text-surface hover:bg-accent',
  secondary: 'bg-surface text-primary border border-border hover:bg-background',
  ghost:     'bg-transparent text-primary hover:bg-background',
  danger:    'bg-error text-surface hover:opacity-90',
  accent:    'bg-accent text-surface hover:opacity-90',
};

const sizes = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-5 py-2.5 text-sm',
  lg:  'px-7 py-3 text-base',
};

/**
 * Button props:
 *   variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
 *   size:    'sm' | 'md' | 'lg'
 *   loading: bool — shows spinner, disables button
 *   fullWidth: bool
 */
const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, fullWidth = false, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
});

export default Button;
