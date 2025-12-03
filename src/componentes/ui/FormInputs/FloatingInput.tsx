import { forwardRef, InputHTMLAttributes } from 'react';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
}

/**
 * Input moderno com label flutuante (floating label)
 * Estilo inspirado no Tailwind CSS adaptado para tema dark
 */
export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, success, className = '', id, ...props }, ref) => {
    const inputId = id || `floating-${label.toLowerCase().replace(/\s+/g, '-')}`;

    const validationClass = error
      ? 'is-invalid'
      : success
      ? 'is-valid'
      : '';

    return (
      <div className="form-floating mb-3">
        <input
          ref={ref}
          type="text"
          className={`form-control ${validationClass} ${className}`}
          id={inputId}
          placeholder={label}
          {...props}
        />
        <label htmlFor={inputId}>{label}</label>

        {error && <div className="invalid-feedback">{error}</div>}
        {success && <div className="valid-feedback">{success}</div>}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
