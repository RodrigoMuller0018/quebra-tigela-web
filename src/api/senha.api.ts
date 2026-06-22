import { http } from "./http";

export async function solicitarRedefinicaoSenha(email: string): Promise<void> {
  await http.post("/api/autenticacao/recuperar-senha/solicitar", { email });
}

export async function validarCodigoRedefinicao(email: string, code: string): Promise<void> {
  await http.post("/api/autenticacao/recuperar-senha/validar", { email, code });
}

export async function redefinirSenha(email: string, code: string, newPassword: string): Promise<void> {
  await http.post("/api/autenticacao/recuperar-senha/redefinir", { email, code, newPassword });
}
