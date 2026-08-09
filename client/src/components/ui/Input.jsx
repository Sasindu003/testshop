import React from 'react';

/**
 * Input props extend all native <input> props, plus:
 *   label:   string
 *   error:   string — shows red border + message
 *   hint:    string — helper text below
 *   leading: ReactNode — icon slot left side
 *   trailing: ReactNode — icon slot right side
 */
const Input = React.forwardRef(function Input(
  { label, error, hint, leading, trailing, id, className = '', ...rest },
  ref,
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-sans font-semibold text-primary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leading && (
          <span className="absolute left-3 text-secondary pointer-events-none flex items-center">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full border rounded bg-background text-primary text-sm font-sans
            placeholder-secondary transition
            px-3 py-2
            ${leading  ? 'pl-9'  : ''}
            ${trailing ? 'pr-9'  : ''}
            ${error
              ? 'border-error focus:outline-none focus:ring-2 focus:ring-error/40'
              : 'border-border focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={!!error}
          {...rest}
        />
        {trailing && (
          <span className="absolute right-3 text-secondary flex items-center">
            {trailing}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-error font-sans">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-secondary font-sans">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
