export interface RespostaArtista {
  texto: string;
  respondidaEm: string;
}

export interface Avaliacao {
  id: string;
  _id?: string;
  /** ID da solicitação avaliada (1 avaliação por solicitação) */
  solicitacaoId: string;
  artistaId: string;
  /** ID do usuário OU objeto populado `{ _id, nome }` quando vem do backend */
  usuarioId: string | { _id: string; nome?: string };
  /** Nome do avaliador — extraído do populate de usuarioId quando disponível */
  nomeUsuario?: string;
  nota: number;
  comentario?: string;
  respostaArtista?: RespostaArtista;
  criadaEm?: string;
  atualizadaEm?: string;
}

export interface NovaAvaliacao {
  solicitacaoId: string;
  nota: number;
  comentario?: string;
}

export interface AtualizaAvaliacao {
  nota?: number;
  comentario?: string;
}
