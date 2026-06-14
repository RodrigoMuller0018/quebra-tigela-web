import { http } from "./http";
import type { ScheduleEntry, NovoScheduleEntry, FiltrosSchedule } from "../tipos/schedule";

function normalizar(item: any): ScheduleEntry {
  return {
    ...item,
    id: String(item.id || item._id),
    artistId: String(item.artistId),
    clientId: item.clientId ? String(item.clientId) : undefined,
  };
}

/**
 * Listar horários com filtros
 */
export async function listarHorarios(filtros?: FiltrosSchedule): Promise<ScheduleEntry[]> {
  let url = "/api/schedule";
  const params = new URLSearchParams();

  if (filtros?.artistId) {
    url = `/api/schedule/artist/${filtros.artistId}`;
    if (filtros.dateFrom) params.append("from", filtros.dateFrom);
    if (filtros.dateTo) params.append("to", filtros.dateTo);
    if (filtros.status) params.append("status", filtros.status);
  } else {
    if (filtros?.clientId) params.append("clientId", filtros.clientId);
    if (filtros?.status) params.append("status", filtros.status);
    if (filtros?.dateFrom) params.append("dateFrom", filtros.dateFrom);
    if (filtros?.dateTo) params.append("dateTo", filtros.dateTo);
  }

  const queryString = params.toString();
  const urlFinal = queryString ? `${url}?${queryString}` : url;

  const res = await http.get(urlFinal);
  return res.data.map(normalizar);
}

/**
 * Obter horário específico por ID
 */
export async function obterHorarioPorId(id: string): Promise<ScheduleEntry> {
  const res = await http.get(`/api/schedule/${id}`);
  return normalizar(res.data);
}

/**
 * Criar novo horário (artista adiciona disponibilidade)
 */
export async function criarHorario(dados: NovoScheduleEntry & { artistId: string }): Promise<ScheduleEntry> {
  const res = await http.post("/api/schedule", dados);
  return normalizar(res.data);
}

/**
 * Criar múltiplos horários de uma vez
 */
export async function criarHorariosEmLote(
  horarios: Array<NovoScheduleEntry & { artistId: string }>
): Promise<ScheduleEntry[]> {
  const res = await http.post("/api/schedule/batch", { schedules: horarios });
  return res.data.map(normalizar);
}

/**
 * Atualizar horário (alterar status, notas, etc)
 */
export async function atualizarHorario(
  id: string,
  dados: Partial<NovoScheduleEntry>
): Promise<ScheduleEntry> {
  const res = await http.patch(`/api/schedule/${id}`, dados);
  return normalizar(res.data);
}

/**
 * Reservar horário (cliente faz booking)
 */
export async function reservarHorario(
  id: string,
  dados?: { notes?: string; serviceId?: string }
): Promise<ScheduleEntry> {
  const res = await http.post(`/api/schedule/${id}/book`, dados || {});
  return normalizar(res.data);
}

/**
 * Cancelar horário
 */
export async function cancelarHorario(id: string): Promise<ScheduleEntry> {
  const res = await http.post(`/api/schedule/${id}/cancel`);
  return normalizar(res.data);
}

/**
 * Deletar horário (apenas se não estiver reservado)
 */
export async function deletarHorario(id: string): Promise<{ deleted: boolean }> {
  const res = await http.delete(`/api/schedule/${id}`);
  return res.data;
}

/**
 * Obter horários disponíveis de um artista (apenas status: available)
 */
export async function obterHorariosDisponiveis(
  artistId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ScheduleEntry[]> {
  return listarHorarios({
    artistId,
    status: "available",
    dateFrom,
    dateTo,
  });
}

/**
 * Obter horários futuros de um artista (apenas datas >= hoje)
 */
export async function obterHorariosFuturos(artistId: string): Promise<ScheduleEntry[]> {
  const res = await http.get(`/api/schedule/artist/${artistId}/future`);
  return res.data.map(normalizar);
}

/**
 * Obter minhas reservas (como cliente)
 */
export async function obterMinhasReservas(): Promise<ScheduleEntry[]> {
  const res = await http.get("/api/schedule/my-bookings");
  return res.data.map(normalizar);
}
