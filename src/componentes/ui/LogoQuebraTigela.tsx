interface Props {
  /** Tamanho em pixels (width = height). Default 32. */
  size?: number;
  /** Classes extras (ex: bordas arredondadas, sombra) */
  className?: string;
}

/**
 * Logo da marca Quebra Tigela. Lê /public/logo.svg (vetorial real, ~51KB).
 * Usar nos pontos de identidade visual da marca: sidebar header, topbar mobile,
 * login/registro. Pra ícones decorativos genéricos continuar usando lucide-react.
 */
export function LogoQuebraTigela({ size = 32, className = "" }: Props) {
  return (
    <img
      src="/logo.svg"
      alt="Quebra Tigela"
      width={size}
      height={size}
      className={`select-none ${className}`}
      draggable={false}
    />
  );
}
