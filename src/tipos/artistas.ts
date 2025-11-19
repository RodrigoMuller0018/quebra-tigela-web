export interface Artista {
  id: string;
  name: string;
  email: string;
  bio?: string;
  city: string;
  state: string;
  verified: boolean;
  artTypes: string[];
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
