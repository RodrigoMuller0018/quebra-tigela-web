import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button Component
 *
 * Componente de botão moderno e versátil compatível com Bootstrap 5.
 * Suporta múltiplas variantes, tamanhos e estados.
 *
 * @example
 * ```tsx
 * // Botão primário básico
 * <Button variant="primary">Click me</Button>
 *
 * // Botão com ícone
 * <Button variant="success">
 *   <i className="bi bi-check-lg"></i>
 *   Confirm
 * </Button>
 *
 * // Botão outline
 * <Button variant="outline-primary" size="lg">
 *   Large Outline
 * </Button>
 *
 * // Botão full width
 * <Button variant="danger" fullWidth>
 *   Delete Account
 * </Button>
 * ```
 */

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'ghost'
  | 'link'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: ButtonSize;
  /** Se true, botão ocupa toda a largura disponível */
  fullWidth?: boolean;
  /** Ícone a ser exibido à esquerda do texto */
  leftIcon?: ReactNode;
  /** Ícone a ser exibido à direita do texto */
  rightIcon?: ReactNode;
  /** Se true, botão fica desabilitado e mostra estado de loading */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    loading = false,
    className = '',
    children,
    disabled,
    ...props
  }, ref) => {
    const classes = [
      'btn',
      `btn-${variant}`,
      size !== 'md' ? `btn-${size}` : '',
      fullWidth ? 'w-100' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && <span className="me-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ms-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
