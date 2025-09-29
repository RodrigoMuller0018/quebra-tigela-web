import { http } from "./http";
import type { Artista, NovoArtista, AtualizaArtista } from "../tipos/artistas";

export async function cadastrarArtista(dados: NovoArtista): Promise<Artista> {
  const res = await http.post("/api/auth/register/artist", dados);
  return res.data;
}

export async function listarArtistas(): Promise<Artista[]> {
  const res = await http.get("/api/artists/search");
  return res.data;
}

export async function obterArtistaPorId(id: string): Promise<Artista> {
  const res = await http.get(`/api/artists/${id}/profile`);
  return res.data;
}

export async function atualizarArtista(id: string, dados: AtualizaArtista): Promise<Artista> {
  const res = await http.patch(`/api/artists/${id}`, dados);
  return res.data;
}

export async function excluirArtista(id: string): Promise<void> {
  await http.delete(`/api/artists/${id}`);
}
