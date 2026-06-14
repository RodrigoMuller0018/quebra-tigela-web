export interface Usuario {
  id: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
  /** Data URL base64 (data:image/jpeg;base64,...) ou URL de CDN no futuro */
  profilePicture?: string;
}

export interface NovoUsuario {
  name: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
  profilePicture?: string;
}
