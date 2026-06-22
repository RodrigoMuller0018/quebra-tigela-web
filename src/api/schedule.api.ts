import { http } from "./http";
import type { ItemAgenda, NovoItemAgenda, FiltrosAgenda } from "../tipos/schedule";

function normalizar(item: any): ItemAgenda {
  return {
    ...item,
    id: String(item.id || item._id),
    artistaId: String(item.artistaId),
    clienteId: item.clienteId ? String(item.clienteId) : undefined,
  };
}

export async function listarHorarios(filtros?: FiltrosAgenda): Promise<ItemAgenda[]> {
  let url = "/api/agenda";
  const params = new URLSearchParams();

  if (filtros?.artistaId) {
    url = `/api/agenda/artista/${filtros.artistaId}`;
    if (filtros.de) params.append("de", filtros.de);
    if (filtros.ate) params.append("ate", filtros.ate);
    if (filtros.status) params.append("status", filtros.status);
  } else {
    if (filtros?.clienteId) params.append("clienteId", filtros.clienteId);
    if (filtros?.status) params.append("status", filtros.status);
    if (filtros?.de) params.append("de", filtros.de);
    if (filtros?.ate) params.append("ate", filtros.ate);
  }

  const queryString = params.toString();
  const urlFinal = queryString ? `${url}?${queryString}` : url;

  const res = await http.get(urlFinal);
  return res.data.map(normalizar);
}

export async function obterHorarioPorId(id: string): Promise<ItemAgenda> {
  const res = await http.get(`/api/agenda/${id}`);
  return normalizar(res.data);
}

export async function criarHorario(
  dados: NovoItemAgenda & { artistaId: string },
): Promise<ItemAgenda> {
  const res = await http.post("/api/agenda", dados);
  return normalizar(res.data);
}

export async function criarHorariosEmLote(
  itens: Array<NovoItemAgenda & { artistaId: string }>,
): Promise<ItemAgenda[]> {
  const res = await http.post("/api/agenda/lote", { itens });
  return res.data.map(normalizar);
}

export async function atualizarHorario(
  id: string,
  dados: Partial<NovoItemAgenda>,
): Promise<ItemAgenda> {
  const res = await http.patch(`/api/agenda/${id}`, dados);
  return normalizar(res.data);
}

export async function reservarHorario(
  id: string,
  dados?: { observacoes?: string; servicoId?: string },
): Promise<ItemAgenda> {
  const res = await http.post(`/api/agenda/${id}/reservar`, dados || {});
  return normalizar(res.data);
}

export async function cancelarHorario(id: string): Promise<ItemAgenda> {
  const res = await http.post(`/api/agenda/${id}/cancelar`);
  return normalizar(res.data);
}

export async function deletarHorario(id: string): Promise<{ removido: boolean }> {
  const res = await http.delete(`/api/agenda/${id}`);
  return res.data;
}

export async function obterHorariosDisponiveis(
  artistaId: string,
  de?: string,
  ate?: string,
): Promise<ItemAgenda[]> {
  return listarHorarios({
    artistaId,
    status: "disponivel",
    de,
    ate,
  });
}

export async function obterHorariosFuturos(artistaId: string): Promise<ItemAgenda[]> {
  const res = await http.get(`/api/agenda/artista/${artistaId}/futuros`);
  return res.data.map(normalizar);
}

export async function obterMinhasReservas(): Promise<ItemAgenda[]> {
  const res = await http.get("/api/agenda/minhas-reservas");
  return res.data.map(normalizar);
}
