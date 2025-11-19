/**
 * Tipos para Sistema de Agendamento
 */

export type ScheduleStatus = 'available' | 'booked' | 'cancelled';

export interface ScheduleEntry {
  _id?: string;
  id?: string;
  artistId: string;
  clientId?: string;
  date: string; // ISO 8601 date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: ScheduleStatus;
  notes?: string;
  serviceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NovoScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  status?: ScheduleStatus;
  notes?: string;
  serviceId?: string;
}

export interface FiltrosSchedule {
  artistId?: string;
  clientId?: string;
  status?: ScheduleStatus;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Tipo para agrupar horários por dia no calendário
 */
export interface DiaAgenda {
  data: string; // YYYY-MM-DD
  horarios: ScheduleEntry[];
}

/**
 * Tipo para slot de horário disponível para seleção
 */
export interface SlotHorario {
  inicio: string; // HH:mm
  fim: string; // HH:mm
  disponivel: boolean;
  scheduleId?: string;
}
