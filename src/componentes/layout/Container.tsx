import type { ReactNode } from "react";

/**
 * Container Component - Migrado para Bootstrap 5
 *
 * Usa as classes de container do Bootstrap com breakpoints responsivos.
 * Mantém a mesma API para compatibilidade com código existente.
 */

type Size = "small" | "medium" | "large" | "full";

interface ContainerProps {
  children: ReactNode;
  size?: Size;
  centered?: boolean;
  className?: string;
}

// Mapeamento de tamanhos customizados para classes Bootstrap
const sizeToBootstrapClass: Record<Size, string> = {
  small: "container-sm",   // Max 540px em SM breakpoint
  medium: "container-md",  // Max 720px em MD breakpoint
  large: "container-lg",   // Max 960px em LG breakpoint
  full: "container-fluid", // 100% width
};

export function Container({
  children,
  size = "medium",
  centered = true,
  className = ""
}: ContainerProps) {
  const containerClasses = [
    // Bootstrap container class baseado no tamanho
    sizeToBootstrapClass[size],
    // Centralizar horizontalmente com mx-auto do Bootstrap
    centered ? "mx-auto" : "",
    // Classes adicionais do usuário
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}