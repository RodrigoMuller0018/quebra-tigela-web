/**
 * CONSTANTES DA AGENDA
 * Centralizadas para evitar duplicação e facilitar manutenção
 */

/**
 * Nomes dos meses em português
 */
export const NOMES_MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

/**
 * Nomes dos meses em português (primeira letra maiúscula)
 */
export const NOMES_MESES_CAPITALIZADOS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/**
 * Nomes dos dias da semana em português
 */
export const NOMES_DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

/**
 * Nomes abreviados dos dias da semana
 */
export const NOMES_DIAS_SEMANA_ABREVIADOS = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
] as const;

/**
 * Labels de status de agendamento
 */
export const STATUS_LABELS: Record<string, string> = {
  available: "Disponível",
  booked: "Reservado",
  cancelled: "Cancelado",
} as const;

/**
 * Classes CSS para cada status
 */
export const STATUS_CSS_CLASSES: Record<string, string> = {
  available: "status-disponivel",
  booked: "status-reservado",
  cancelled: "status-cancelado",
} as const;

/**
 * Classes de badge Bootstrap para cada status
 */
export const STATUS_BADGE_CLASSES: Record<string, string> = {
  available: "badge bg-success",
  booked: "badge bg-warning",
  cancelled: "badge bg-secondary",
} as const;

/**
 * Configurações padrão de busca de horários
 */
export const CONFIG_BUSCA_HORARIOS = {
  /**
   * Número de meses no passado para buscar (para histórico)
   */
  MESES_PASSADO: 6,

  /**
   * Número de meses no futuro para buscar
   */
  MESES_FUTURO: 6,
} as const;
