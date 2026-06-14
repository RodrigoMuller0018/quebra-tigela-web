export type StatusSolicitacao =
  | "pending"
  | "accepted"
  | "awaiting_confirmation"
  | "completed"
  | "rejected"
  | "cancelled";

export interface Solicitacao {
  id: string;
  _id?: string;
  userId: string;
  artistId: string;
  serviceId: string;
  /** Slot ancorado (Caminho A: reserva direta). Undefined para solicitação livre. */
  scheduleId?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  details?: string;
  status: StatusSolicitacao;
  requestedAt?: string;
  updatedAt?: string;
}

export interface NovaSolicitacao {
  artistId: string;
  serviceId: string;
  /** Se vier de um slot da agenda do artista, preenche este campo. */
  scheduleId?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  details?: string;
}

export const STATUS_LABELS: Record<StatusSolicitacao, string> = {
  pending: "Aguardando resposta",
  accepted: "Aceita",
  awaiting_confirmation: "Aguardando confirmação",
  completed: "Concluída",
  rejected: "Recusada",
  cancelled: "Cancelada",
};

export const STATUS_TONE: Record<StatusSolicitacao, string> = {
  pending: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  accepted: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  awaiting_confirmation: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  completed: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  rejected: "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
  cancelled: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
};
