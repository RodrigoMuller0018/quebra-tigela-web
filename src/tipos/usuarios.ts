export interface Usuario {
  id: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
}

export interface NovoUsuario {
  name: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
}