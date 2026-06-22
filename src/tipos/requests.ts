export type StatusSolicitacao =
  | "pendente"
  | "aceita"
  | "aguardando_confirmacao"
  | "concluida"
  | "recusada"
  | "cancelada";

export interface Solicitacao {
  id: string;
  _id?: string;
  usuarioId: string;
  artistaId: string;
  servicoId: string;
  /** Slot ancorado (Caminho A: reserva direta). Undefined para solicitação livre. */
  agendaId?: string;
  /** ISO 8601 com timezone. Suporta eventos multi-dia. */
  inicio: string;
  /** ISO 8601 com timezone. */
  fim: string;
  local: string;
  detalhes?: string;
  status: StatusSolicitacao;
  marcadaConcluidaEm?: string;
  solicitadaEm?: string;
  atualizadaEm?: string;
}

export interface NovaSolicitacao {
  artistaId: string;
  servicoId: string;
  agendaId?: string;
  inicio: string;
  fim: string;
  local: string;
  detalhes?: string;
}

export const STATUS_LABELS: Record<StatusSolicitacao, string> = {
  pendente: "Aguardando resposta",
  aceita: "Aceita",
  aguardando_confirmacao: "Aguardando confirmação",
  concluida: "Concluída",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

export const STATUS_TONE: Record<StatusSolicitacao, string> = {
  pendente: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  aceita: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  aguardando_confirmacao:
    "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  concluida: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  recusada: "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
  cancelada: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
};
