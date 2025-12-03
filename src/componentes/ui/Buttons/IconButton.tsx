import { forwardRef, ButtonHTMLAttributes } from 'react';

/**
 * IconButton Component
 *
 * Botão circular/quadrado contendo apenas um ícone.
 * Ideal para actions compactas como editar, deletar, favoritar, etc.
 *
 * @example
 * ```tsx
 * <IconButton variant="primary" size="sm" aria-label="Edit">
 *   <i className="bi bi-pencil"></i>
 * </IconButton>
 *
 * <IconButton variant="danger" size="lg" aria-label="Delete">
 *   <i className="bi bi-trash"></i>
 * </IconButton>
 * ```
 */

export type IconButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'ghost'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: IconButtonVariant;
  /** Tamanho do botão */
  size?: IconButtonSize;
  /** Se true, botão terá bordas arredondadas (circular) */
  rounded?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    rounded = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const classes = [
      'btn',
      'btn-icon',
      `btn-${variant}`,
      size !== 'md' ? `btn-${size}` : '',
      rounded ? 'rounded-circle' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
