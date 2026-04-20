export type StatusSolicitacao =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export interface Solicitacao {
  id: string;
  _id?: string;
  userId: string;
  artistId: string;
  serviceId: string;
  eventDate: string;
  location: string;
  details?: string;
  status: StatusSolicitacao;
  requestedAt?: string;
  updatedAt?: string;
}

export interface NovaSolicitacao {
  userId: string;
  artistId: string;
  serviceId: string;
  eventDate: string;
  location: string;
  details?: string;
}

export const STATUS_LABELS: Record<StatusSolicitacao, string> = {
  pending: "Aguardando resposta",
  accepted: "Aceita",
  rejected: "Recusada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export const STATUS_TONE: Record<StatusSolicitacao, string> = {
  pending: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  accepted: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  rejected: "bg-[color:var(--danger)]/15 text-[color:var(--danger)]",
  completed: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  cancelled: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
};
