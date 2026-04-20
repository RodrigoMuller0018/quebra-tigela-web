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
    userId: String(s.userId),
    artistId: String(s.artistId),
    serviceId: String(s.serviceId),
  };
}

export async function criarSolicitacao(
  dados: NovaSolicitacao
): Promise<Solicitacao> {
  const res = await http.post("/api/requests", dados);
  return normalizar(res.data);
}

export async function atualizarStatusSolicitacao(
  id: string,
  status: Exclude<StatusSolicitacao, "pending">
): Promise<Solicitacao> {
  const res = await http.patch(`/api/requests/${id}/status`, { status });
  return normalizar(res.data);
}

export async function listarSolicitacoesPorUsuario(
  userId: string
): Promise<Solicitacao[]> {
  const res = await http.get(`/api/requests/user/${userId}`);
  return res.data.map(normalizar);
}

export async function listarSolicitacoesPorArtista(
  artistId: string
): Promise<Solicitacao[]> {
  const res = await http.get(`/api/requests/artist/${artistId}`);
  return res.data.map(normalizar);
}
