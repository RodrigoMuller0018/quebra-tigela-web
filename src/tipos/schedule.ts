/**
 * Tipos para Sistema de Agenda
 */

export type StatusAgenda =
  | 'disponivel'
  | 'pendente'
  | 'reservada'
  | 'concluida'
  | 'cancelada';

export interface ItemAgenda {
  _id?: string;
  id?: string;
  artistaId: string;
  clienteId?: string;
  /** ISO 8601 com timezone (ex: 2026-06-21T22:00:00-03:00). Suporta eventos multi-dia. */
  inicio: string;
  /** ISO 8601 com timezone. Estritamente > inicio. */
  fim: string;
  status: StatusAgenda;
  observacoes?: string;
  servicoId?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface NovoItemAgenda {
  inicio: string;
  fim: string;
  status?: StatusAgenda;
  observacoes?: string;
  servicoId?: string;
}

export interface FiltrosAgenda {
  artistaId?: string;
  clienteId?: string;
  status?: StatusAgenda;
  /** ISO 8601 — filtra slots com inicio >= esse valor */
  de?: string;
  /** ISO 8601 — filtra slots com inicio <= esse valor */
  ate?: string;
}
