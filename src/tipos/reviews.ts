export interface RespostaArtista {
  text: string;
  repliedAt: string;
}

export interface Review {
  id: string;
  _id?: string;
  /** ID da solicitação avaliada (1 review por request) */
  requestId: string;
  artistId: string;
  /** ID do usuário OU objeto populado `{ _id, name }` quando vem do backend */
  userId: string | { _id: string; name?: string };
  /** Nome do avaliador — extraído do populate de userId quando disponível */
  userName?: string;
  rating: number;
  comment?: string;
  artistReply?: RespostaArtista;
  createdAt?: string;
  updatedAt?: string;
}

export interface NovaReview {
  /** A solicitação que está sendo avaliada — backend deriva artistId dela */
  requestId: string;
  rating: number;
  comment?: string;
}

export interface AtualizaReview {
  rating?: number;
  comment?: string;
}
