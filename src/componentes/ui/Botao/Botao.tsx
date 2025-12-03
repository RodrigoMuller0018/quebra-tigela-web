import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

/**
 * Botao Component - Migrado para Bootstrap 5
 *
 * Usa as classes .btn do Bootstrap com variantes customizadas.
 * Mantém a mesma API para compatibilidade com código existente.
 */

type Variante = "primaria" | "fantasma" | "perigo";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: Variante;
    primaria?: boolean;
    grande?: boolean;
  }
>;

export function Botao({
  variante,
  primaria,
  grande,
  className = "",
  children,
  ...rest
}: Props) {
  const modo: Variante =
    variante ?? (primaria === false ? "fantasma" : "primaria");

  // Mapear variantes customizadas para classes Bootstrap
  const variantClasses = {
    primaria: "btn-primary",
    fantasma: "btn-outline-primary",  // Botão fantasma usa outline do Bootstrap
    perigo: "btn-danger",
  };

  const classes = [
    "btn",                              // Classe base do Bootstrap
    variantClasses[modo],               // Variante mapeada
    grande ? "w-100" : "",             // w-100 = width 100% do Bootstrap (equivalente ao btn-big)
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
