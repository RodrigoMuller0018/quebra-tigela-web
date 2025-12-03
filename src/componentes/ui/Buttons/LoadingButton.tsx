import { forwardRef, ButtonHTMLAttributes } from 'react';

/**
 * LoadingButton Component
 *
 * Botão com estado de loading integrado.
 * Mostra um spinner enquanto uma ação assíncrona está em andamento.
 *
 * @example
 * ```tsx
 * <LoadingButton
 *   variant="primary"
 *   loading={isSubmitting}
 *   onClick={handleSubmit}
 * >
 *   Save Changes
 * </LoadingButton>
 *
 * <LoadingButton
 *   variant="success"
 *   loading={isSaving}
 *   loadingText="Saving..."
 * >
 *   Confirm
 * </LoadingButton>
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

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: ButtonSize;
  /** Se true, mostra spinner e desabilita o botão */
  loading?: boolean;
  /** Texto alternativo exibido durante o loading */
  loadingText?: string;
  /** Se true, botão ocupa toda a largura disponível */
  fullWidth?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    fullWidth = false,
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
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
        )}
        {loading && loadingText ? loadingText : children}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
