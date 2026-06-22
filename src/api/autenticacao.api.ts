import { http } from "./http";
import { decodificarToken } from "../utilitarios/jwt";

interface RespostaAuth {
  token: string;
  payload: ReturnType<typeof decodificarToken>;
  temPerfilArtista: boolean;
}

function processarTokenResponse(data: any): RespostaAuth {
  const token: string | undefined =
    data?.access_token ?? data?.jwt ?? data?.token;

  if (!token) {
    throw new Error("Token não encontrado na resposta do servidor");
  }

  localStorage.setItem("token", token);
  const payload = decodificarToken(token);

  return {
    token,
    payload,
    temPerfilArtista: !!payload?.temPerfilArtista,
  };
}

/**
 * Login unificado. Se a conta estiver desativada, o backend devolve 409 com
 * `{ contaDesativada: true }` no body — o caller deve capturar e oferecer reativação.
 */
export async function autenticar(email: string, senha: string) {
  const { data } = await http.post("/api/autenticacao/login", { email, senha });
  return processarTokenResponse(data);
}

/**
 * Reativa a conta desativada com as mesmas credenciais e já devolve o token.
 * Chamado depois do usuário confirmar no diálogo de reativação.
 */
export async function reativarConta(email: string, senha: string) {
  const { data } = await http.post("/api/autenticacao/reativar", { email, senha });
  return processarTokenResponse(data);
}

export function sair() {
  localStorage.removeItem("token");
}

export function obterToken() {
  return localStorage.getItem("token");
}
