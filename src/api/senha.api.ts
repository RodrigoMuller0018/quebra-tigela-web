import { http } from "./http";

export async function solicitarRedefinicaoSenha(email: string): Promise<void> {
  await http.post("/api/auth/password-reset/request", { email });
}

export async function validarCodigoRedefinicao(email: string, code: string): Promise<void> {
  await http.post("/api/auth/password-reset/validate", { email, code });
}

export async function redefinirSenha(email: string, code: string, newPassword: string): Promise<void> {
  await http.post("/api/auth/password-reset/reset", { email, code, newPassword });
}
