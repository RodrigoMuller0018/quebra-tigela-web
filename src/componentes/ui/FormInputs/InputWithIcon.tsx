import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: string; // Bootstrap icon class (e.g., "bi-envelope")
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: string;
  endButton?: ReactNode;
}

/**
 * Input moderno com ícone (Bootstrap Icons)
 * Pode ter ícone à esquerda ou direita, e botão de ação opcional
 */
export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({
    icon,
    iconPosition = 'left',
    error,
    success,
    endButton,
    className = '',
    ...props
  }, ref) => {
    const validationClass = error
      ? 'is-invalid'
      : success
      ? 'is-valid'
      : '';

    return (
      <div className="mb-3">
        <div className="input-group">
          {iconPosition === 'left' && (
            <span className="input-group-text">
              <i className={`bi ${icon}`}></i>
            </span>
          )}

          <input
            ref={ref}
            className={`form-control ${validationClass} ${className}`}
            {...props}
          />

          {iconPosition === 'right' && !endButton && (
            <span className="input-group-text">
              <i className={`bi ${icon}`}></i>
            </span>
          )}

          {endButton}
        </div>

        {error && <div className="invalid-feedback d-block">{error}</div>}
        {success && <div className="valid-feedback d-block">{success}</div>}
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';
