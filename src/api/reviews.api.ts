import { http } from "./http";
import type { Review, NovaReview } from "../tipos/reviews";

function normalizar(r: any): Review {
  return {
    ...r,
    id: String(r.id || r._id),
    artistId: String(r.artistId),
    userId: String(r.userId),
  };
}

export async function criarReview(dados: NovaReview): Promise<Review> {
  const res = await http.post("/api/reviews", dados);
  return normalizar(res.data);
}

export async function listarReviewsPorArtista(
  artistId: string
): Promise<Review[]> {
  const res = await http.get(`/api/reviews/artist/${artistId}`);
  return res.data.map(normalizar);
}
