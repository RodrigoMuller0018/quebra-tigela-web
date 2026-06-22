import { http } from "./http";
import type { Usuario, NovoUsuario } from "../tipos/usuarios";

export async function cadastrarUsuario(dados: NovoUsuario): Promise<Usuario> {
  const res = await http.post("/api/autenticacao/registrar/usuario", dados);
  return res.data;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const res = await http.get("/api/usuarios");
  return res.data;
}

export async function obterUsuarioPorId(id: string): Promise<Usuario> {
  const res = await http.get(`/api/usuarios/${id}`);
  return res.data;
}

export async function atualizarUsuario(
  id: string,
  dados: Partial<NovoUsuario>,
): Promise<Usuario> {
  const res = await http.patch(`/api/usuarios/${id}`, dados);
  return res.data;
}

/**
 * Soft delete em cascata: marca a conta como desativada e propaga pro Artista linkado.
 * Reversível — basta fazer login com a senha pra reativar.
 */
export async function desativarConta(
  id: string,
): Promise<{ desativadaEm: string }> {
  const res = await http.patch(`/api/usuarios/${id}/desativar`);
  return res.data;
}
