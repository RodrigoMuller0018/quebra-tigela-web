import { http } from "./http";
import type { Avaliacao, NovaAvaliacao, AtualizaAvaliacao } from "../tipos/reviews";

function normalizar(r: any): Avaliacao {
  // Backend faz populate de usuarioId com { _id, nome }. Extrai pro nomeUsuario flat.
  const populado =
    r.usuarioId && typeof r.usuarioId === "object" && r.usuarioId.nome
      ? r.usuarioId
      : null;
  const usuarioIdStr = populado
    ? String(populado._id)
    : typeof r.usuarioId === "string"
      ? r.usuarioId
      : String(r.usuarioId?._id ?? r.usuarioId);

  return {
    ...r,
    id: String(r.id || r._id),
    solicitacaoId: String(r.solicitacaoId),
    artistaId: String(r.artistaId),
    usuarioId: usuarioIdStr,
    nomeUsuario: populado?.nome ?? r.nomeUsuario,
  };
}

export async function criarAvaliacao(dados: NovaAvaliacao): Promise<Avaliacao> {
  const res = await http.post("/api/avaliacoes", dados);
  return normalizar(res.data);
}

export async function listarAvaliacoesPorArtista(
  artistaId: string,
): Promise<Avaliacao[]> {
  const res = await http.get(`/api/avaliacoes/artista/${artistaId}`);
  return res.data.map(normalizar);
}

export async function listarMinhasAvaliacoes(): Promise<Avaliacao[]> {
  const res = await http.get("/api/avaliacoes/minhas");
  return res.data.map(normalizar);
}

export async function atualizarAvaliacao(
  id: string,
  dados: AtualizaAvaliacao,
): Promise<Avaliacao> {
  const res = await http.patch(`/api/avaliacoes/${id}`, dados);
  return normalizar(res.data);
}

export async function excluirAvaliacao(id: string): Promise<{ removida: boolean }> {
  const res = await http.delete(`/api/avaliacoes/${id}`);
  return res.data;
}

export async function responderAvaliacao(
  id: string,
  texto: string,
): Promise<Avaliacao> {
  const res = await http.post(`/api/avaliacoes/${id}/resposta`, { texto });
  return normalizar(res.data);
}

export async function excluirRespostaAvaliacao(id: string): Promise<Avaliacao> {
  const res = await http.delete(`/api/avaliacoes/${id}/resposta`);
  return normalizar(res.data);
}
