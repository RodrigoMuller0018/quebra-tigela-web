import type { HTMLAttributes, PropsWithChildren } from "react";

/**
 * Cartao Component - Migrado para Bootstrap 5
 *
 * Usa a classe .card do Bootstrap com customizações do tema.
 * Mantém compatibilidade com o código existente.
 */

export function Cartao({
  className = "",
  children,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      {...rest}
      className={[
        "card",              // Bootstrap card class
        "shadow-custom-md",  // Shadow customizada do tema
        "p-4",              // Padding do Bootstrap (1.5rem)
        "rounded-custom",   // Border radius customizado
        className
      ].join(" ").trim()}
    >
      {children}
    </div>
  );
}
