type Tamanho = "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarPerfilProps {
  /** Data URL base64 ou URL pública. Se undefined, mostra iniciais. */
  foto?: string;
  /** Nome usado pra gerar iniciais quando não há foto */
  nome: string;
  tamanho?: Tamanho;
  /** Classes extras (border, etc.) */
  className?: string;
  /** Alt text custom — default é "Foto de {nome}" */
  alt?: string;
}

const TAMANHOS: Record<Tamanho, { wrapper: string; texto: string }> = {
  sm: { wrapper: "h-8 w-8", texto: "text-xs" },
  md: { wrapper: "h-12 w-12", texto: "text-sm" },
  lg: { wrapper: "h-16 w-16", texto: "text-lg" },
  xl: { wrapper: "h-24 w-24", texto: "text-3xl" },
  "2xl": { wrapper: "h-32 w-32", texto: "text-4xl" },
};

function gerarIniciais(nome: string): string {
  return (
    nome
      ?.split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function AvatarPerfil({
  foto,
  nome,
  tamanho = "md",
  className = "",
  alt,
}: AvatarPerfilProps) {
  const { wrapper, texto } = TAMANHOS[tamanho];

  if (foto) {
    return (
      <img
        src={foto}
        alt={alt ?? `Foto de ${nome}`}
        className={`${wrapper} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${wrapper} shrink-0 flex items-center justify-center rounded-full bg-gradient-brand font-display font-bold text-white ${texto} ${className}`}
      aria-label={alt ?? `Foto de ${nome}`}
    >
      {gerarIniciais(nome)}
    </div>
  );
}
