import { http } from "./http";
import type { Usuario, NovoUsuario } from "../tipos/usuarios";

export async function cadastrarUsuario(dados: NovoUsuario): Promise<Usuario> {
  const res = await http.post("/api/auth/register/user", dados);
  return res.data;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const res = await http.get("/api/users/");
  return res.data;
}

export async function obterUsuarioPorId(id: string): Promise<Usuario> {
  const res = await http.get(`/api/users/${id}`);
  return res.data;
}