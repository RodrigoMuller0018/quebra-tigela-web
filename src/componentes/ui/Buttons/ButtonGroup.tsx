import { ReactNode } from 'react';

/**
 * ButtonGroup Component
 *
 * Agrupa botões relacionados em uma única unidade visual.
 * Útil para toggles, toolbars e conjuntos de ações relacionadas.
 *
 * @example
 * ```tsx
 * // Horizontal group (default)
 * <ButtonGroup>
 *   <button className="btn btn-outline-primary">Left</button>
 *   <button className="btn btn-outline-primary active">Center</button>
 *   <button className="btn btn-outline-primary">Right</button>
 * </ButtonGroup>
 *
 * // Vertical group
 * <ButtonGroup vertical>
 *   <button className="btn btn-primary">Top</button>
 *   <button className="btn btn-primary">Middle</button>
 *   <button className="btn btn-primary">Bottom</button>
 * </ButtonGroup>
 *
 * // Small size
 * <ButtonGroup size="sm">
 *   <button className="btn btn-outline-secondary"><i className="bi bi-type-bold"></i></button>
 *   <button className="btn btn-outline-secondary"><i className="bi bi-type-italic"></i></button>
 *   <button className="btn btn-outline-secondary"><i className="bi bi-type-underline"></i></button>
 * </ButtonGroup>
 * ```
 */

export interface ButtonGroupProps {
  /** Botões a serem agrupados */
  children: ReactNode;
  /** Se true, os botões são empilhados verticalmente */
  vertical?: boolean;
  /** Tamanho dos botões no grupo */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Classes CSS adicionais */
  className?: string;
  /** Role ARIA para acessibilidade */
  role?: string;
  /** Label ARIA para acessibilidade */
  'aria-label'?: string;
}

export function ButtonGroup({
  children,
  vertical = false,
  size,
  className = '',
  role = 'group',
  'aria-label': ariaLabel,
}: ButtonGroupProps) {
  const classes = [
    vertical ? 'btn-group-vertical' : 'btn-group',
    size && size !== 'md' ? `btn-group-${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

/**
 * ButtonToolbar Component
 *
 * Agrupa múltiplos ButtonGroups em uma toolbar.
 *
 * @example
 * ```tsx
 * <ButtonToolbar aria-label="Text formatting toolbar">
 *   <ButtonGroup className="me-2">
 *     <button className="btn btn-outline-secondary"><i className="bi bi-type-bold"></i></button>
 *     <button className="btn btn-outline-secondary"><i className="bi bi-type-italic"></i></button>
 *   </ButtonGroup>
 *   <ButtonGroup>
 *     <button className="btn btn-outline-secondary"><i className="bi bi-justify-left"></i></button>
 *     <button className="btn btn-outline-secondary"><i className="bi bi-justify"></i></button>
 *   </ButtonGroup>
 * </ButtonToolbar>
 * ```
 */

export interface ButtonToolbarProps {
  /** Grupos de botões a serem exibidos na toolbar */
  children: ReactNode;
  /** Classes CSS adicionais */
  className?: string;
  /** Role ARIA para acessibilidade */
  role?: string;
  /** Label ARIA para acessibilidade */
  'aria-label'?: string;
}

export function ButtonToolbar({
  children,
  className = '',
  role = 'toolbar',
  'aria-label': ariaLabel,
}: ButtonToolbarProps) {
  const classes = ['btn-toolbar', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
