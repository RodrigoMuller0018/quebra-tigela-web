export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cidade?: string;
  estado?: string;
  /** Data URL base64 ou URL de CDN no futuro */
  fotoPerfil?: string | null;
}

export interface NovoUsuario {
  nome: string;
  email: string;
  senha: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string | null;
}
