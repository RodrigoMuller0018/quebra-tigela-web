export interface Artista {
  id: string;
  nome: string;
  email: string;
  bio?: string;
  cidade?: string;
  estado?: string;
  /** Handle público estilo @username — usado em URLs (/artistas/@:handle) */
  handle: string;
  verificado: boolean;
  tiposArte: string[];
  /** Telefone normalizado (55 + DDD + 9 + 8 dígitos). Pode vir vazio em listagens públicas. */
  telefone?: string;
  /** Data URL base64 ou URL de CDN no futuro */
  fotoPerfil?: string | null;
  /** Nome artístico / stage name */
  nomeArtistico?: string;
  /** Data de nascimento ISO (yyyy-mm-dd) */
  dataNascimento?: string;
  /** URL externa pro portfólio */
  portfolio?: string;
  /** Lista de URLs de redes sociais */
  redesSociais?: string[];
  /** Média das avaliações. null se sem avaliações. */
  notaMedia?: number | null;
  /** Total de avaliações */
  totalAvaliacoes?: number;
  /** Soft delete: true=visível, false=pausado pelo dono */
  ativo?: boolean;
  /** Quando o perfil foi pausado (ISO string) */
  desativadoEm?: string;
  /** FK pro Usuario base (composition) */
  usuarioId?: string;
  /** Contador de visualizações do perfil público (self-views ignoradas) */
  visualizacoes?: number;
}

export interface NovoArtista {
  nome: string;
  email: string;
  senha: string;
  bio?: string;
  cidade?: string;
  estado?: string;
  tiposArte: string[];
  telefone: string;
  /** Opcional — se não vier, backend auto-gera baseado no nome. */
  handle?: string;
  /** Permite pular fluxo de verificação manual em seeds/dev. Ignorado em registro público real. */
  verificado?: boolean;
  fotoPerfil?: string | null;
  nomeArtistico?: string;
  dataNascimento?: string;
  portfolio?: string;
  redesSociais?: string[];
}

export type AtualizaArtista = Partial<Omit<NovoArtista, "senha" | "email">>;
