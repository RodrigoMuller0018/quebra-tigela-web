import { http } from "./http";
import type { Review, NovaReview, AtualizaReview } from "../tipos/reviews";

function normalizar(r: any): Review {
  // Backend faz populate de userId com { _id, name }. Extrai pro userName flat.
  const populated =
    r.userId && typeof r.userId === "object" && r.userId.name
      ? r.userId
      : null;
  const userIdStr = populated
    ? String(populated._id)
    : typeof r.userId === "string"
      ? r.userId
      : String(r.userId?._id ?? r.userId);

  return {
    ...r,
    id: String(r.id || r._id),
    requestId: String(r.requestId),
    artistId: String(r.artistId),
    userId: userIdStr,
    userName: populated?.name ?? r.userName,
  };
}

export async function criarReview(dados: NovaReview): Promise<Review> {
  const res = await http.post("/api/reviews", dados);
  return normalizar(res.data);
}

export async function listarReviewsPorArtista(
  artistId: string,
): Promise<Review[]> {
  const res = await http.get(`/api/reviews/artist/${artistId}`);
  return res.data.map(normalizar);
}

/** Lista todas as reviews que o cliente logado já fez. */
export async function listarMinhasReviews(): Promise<Review[]> {
  const res = await http.get("/api/reviews/mine");
  return res.data.map(normalizar);
}

export async function atualizarReview(
  id: string,
  dados: AtualizaReview,
): Promise<Review> {
  const res = await http.patch(`/api/reviews/${id}`, dados);
  return normalizar(res.data);
}

export async function excluirReview(id: string): Promise<{ deleted: boolean }> {
  const res = await http.delete(`/api/reviews/${id}`);
  return res.data;
}

export async function responderReview(
  id: string,
  text: string,
): Promise<Review> {
  const res = await http.post(`/api/reviews/${id}/reply`, { text });
  return normalizar(res.data);
}

export async function excluirRespostaReview(id: string): Promise<Review> {
  const res = await http.delete(`/api/reviews/${id}/reply`);
  return normalizar(res.data);
}
