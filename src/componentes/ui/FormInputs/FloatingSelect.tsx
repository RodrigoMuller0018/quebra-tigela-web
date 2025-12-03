import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';

interface FloatingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  success?: string;
  helperText?: string;
  children: ReactNode;
}

/**
 * Select moderno com label flutuante
 */
export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, success, helperText, className = '', id, children, ...props }, ref) => {
    const selectId = id || `floating-select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const validationClass = error
      ? 'is-invalid'
      : success
      ? 'is-valid'
      : '';

    return (
      <div className="form-floating mb-3">
        <select
          ref={ref}
          className={`form-select ${validationClass} ${className}`}
          id={selectId}
          {...props}
        >
          {children}
        </select>
        <label htmlFor={selectId}>{label}</label>

        {helperText && !error && !success && (
          <div className="form-text">{helperText}</div>
        )}
        {error && <div className="invalid-feedback">{error}</div>}
        {success && <div className="valid-feedback">{success}</div>}
      </div>
    );
  }
);

FloatingSelect.displayName = 'FloatingSelect';
