export interface SolicitarSenhaPayload {
  email: string;
}

export interface ValidarCodigoPayload {
  email: string;
  code: string;
}

export interface RedefinirSenhaPayload {
  email: string;
  code: string;
  newPassword: string;
}
