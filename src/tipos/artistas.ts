export interface Artista {
  id: string;
  name: string;
  email: string;
  bio?: string;
  city: string;
  state: string;
  verified: boolean;
  artTypes: string[];
  /** Data URL base64 (data:image/jpeg;base64,...) ou URL de CDN no futuro */
  profilePicture?: string;
  /** Média das avaliações (vem do backend no /search e /profile). null se sem reviews. */
  ratingAvg?: number | null;
  /** Total de avaliações */
  ratingCount?: number;
}

export interface NovoArtista {
  name: string;
  email: string;
  password: string;
  bio?: string;
  city?: string;
  state?: string;
  artTypes: string[];
}

export type AtualizaArtista = Partial<Omit<NovoArtista, "password" | "email">>;
