import { http } from "./http";
import type {
  Solicitacao,
  NovaSolicitacao,
  StatusSolicitacao,
} from "../tipos/requests";

function normalizar(s: any): Solicitacao {
  return {
    ...s,
    id: String(s.id || s._id),
    usuarioId: String(s.usuarioId),
    artistaId: String(s.artistaId),
    servicoId: String(s.servicoId),
  };
}

export async function criarSolicitacao(
  dados: NovaSolicitacao,
): Promise<Solicitacao> {
  const res = await http.post("/api/solicitacoes", dados);
  return normalizar(res.data);
}

export async function atualizarStatusSolicitacao(
  id: string,
  status: Exclude<StatusSolicitacao, "pendente">,
): Promise<Solicitacao> {
  const res = await http.patch(`/api/solicitacoes/${id}/status`, { status });
  return normalizar(res.data);
}

export async function listarSolicitacoesPorUsuario(
  usuarioId: string,
): Promise<Solicitacao[]> {
  const res = await http.get(`/api/solicitacoes/usuario/${usuarioId}`);
  return res.data.map(normalizar);
}

export async function listarSolicitacoesPorArtista(
  artistaId: string,
): Promise<Solicitacao[]> {
  const res = await http.get(`/api/solicitacoes/artista/${artistaId}`);
  return res.data.map(normalizar);
}
