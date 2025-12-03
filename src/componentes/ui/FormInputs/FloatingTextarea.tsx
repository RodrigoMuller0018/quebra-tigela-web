import { forwardRef, TextareaHTMLAttributes } from 'react';

interface FloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  success?: string;
  helperText?: string;
}

/**
 * Textarea moderno com label flutuante
 */
export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, success, helperText, className = '', id, style, ...props }, ref) => {
    const textareaId = id || `floating-textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const validationClass = error
      ? 'is-invalid'
      : success
      ? 'is-valid'
      : '';

    return (
      <div className="form-floating mb-3">
        <textarea
          ref={ref}
          className={`form-control ${validationClass} ${className}`}
          id={textareaId}
          placeholder={label}
          style={{ minHeight: '100px', ...style }}
          {...props}
        />
        <label htmlFor={textareaId}>{label}</label>

        {helperText && !error && !success && (
          <div className="form-text">{helperText}</div>
        )}
        {error && <div className="invalid-feedback">{error}</div>}
        {success && <div className="valid-feedback">{success}</div>}
      </div>
    );
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';
