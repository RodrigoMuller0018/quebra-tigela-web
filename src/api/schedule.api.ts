import { http } from "./http";
import type { ScheduleEntry, NovoScheduleEntry, FiltrosSchedule } from "../tipos/schedule";
import { scheduleMockAPI } from "./schedule.mock";

// Flag para usar dados mock quando backend não estiver disponível
const usarMock = import.meta.env.VITE_USE_MOCK_DATA === "true" || false;

/**
 * Listar horários com filtros
 */
export async function listarHorarios(filtros?: FiltrosSchedule): Promise<ScheduleEntry[]> {
  console.log("📋 API - listarHorarios chamado com filtros:", filtros);

  try {
    let url = "/api/schedule";
    const params = new URLSearchParams();

    // Se tem artistId, usar rota específica do artista
    if (filtros?.artistId) {
      url = `/api/schedule/artist/${filtros.artistId}`;
      // Query params para essa rota: from, to, status, limit
      if (filtros.dateFrom) params.append("from", filtros.dateFrom);
      if (filtros.dateTo) params.append("to", filtros.dateTo);
      if (filtros.status) params.append("status", filtros.status);
    } else {
      // Rota genérica com query params diferentes
      if (filtros?.clientId) params.append("clientId", filtros.clientId);
      if (filtros?.status) params.append("status", filtros.status);
      if (filtros?.dateFrom) params.append("dateFrom", filtros.dateFrom);
      if (filtros?.dateTo) params.append("dateTo", filtros.dateTo);
    }

    const queryString = params.toString();
    const urlFinal = queryString ? `${url}?${queryString}` : url;

    console.log("🌐 URL final:", urlFinal);

    const res = await http.get(urlFinal);
    console.log("✅ Resposta do backend:", res.data);

    // Garante que IDs sejam strings
    return res.data.map((item: any) => ({
      ...item,
      id: String(item.id || item._id),
      artistId: String(item.artistId),
      clientId: item.clientId ? String(item.clientId) : undefined,
    }));
  } catch (error: any) {
    console.error("❌ Erro ao listar:", error);

    // Se backend não estiver disponível, usar dados mock silenciosamente
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot GET") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("⚠️ Backend indisponível, usando dados mock");
      return scheduleMockAPI.listar(filtros);
    }
    throw error;
  }
}

/**
 * Obter horário específico por ID
 */
export async function obterHorarioPorId(id: string): Promise<ScheduleEntry> {
  try {
    const res = await http.get(`/api/schedule/${id}`);
    // Garante que IDs sejam strings
    return {
      ...res.data,
      id: String(res.data.id || res.data._id),
      artistId: String(res.data.artistId),
      clientId: res.data.clientId ? String(res.data.clientId) : undefined,
    };
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot GET") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return scheduleMockAPI.obterPorId(id);
    }
    throw error;
  }
}

/**
 * Criar novo horário (artista adiciona disponibilidade)
 */
export async function criarHorario(dados: NovoScheduleEntry): Promise<ScheduleEntry> {
  try {
    const res = await http.post("/api/schedule", dados);
    return {
      ...res.data,
      id: String(res.data.id || res.data._id),
      artistId: String(res.data.artistId),
      clientId: res.data.clientId ? String(res.data.clientId) : undefined,
    };
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return await scheduleMockAPI.criar(dados);
    }

    throw error;
  }
}

/**
 * Criar múltiplos horários de uma vez
 */
export async function criarHorariosEmLote(horarios: NovoScheduleEntry[]): Promise<ScheduleEntry[]> {
  try {
    const res = await http.post("/api/schedule/batch", { schedules: horarios });
    return res.data.map((item: any) => ({
      ...item,
      id: String(item.id || item._id),
      artistId: String(item.artistId),
      clientId: item.clientId ? String(item.clientId) : undefined,
    }));
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return scheduleMockAPI.criarEmLote(horarios);
    }
    throw error;
  }
}

/**
 * Atualizar horário (alterar status, notas, etc)
 */
export async function atualizarHorario(
  id: string,
  dados: Partial<NovoScheduleEntry>
): Promise<ScheduleEntry> {
  try {
    const res = await http.patch(`/api/schedule/${id}`, dados);
    // Garante que IDs sejam strings
    return {
      ...res.data,
      id: String(res.data.id || res.data._id),
      artistId: String(res.data.artistId),
      clientId: res.data.clientId ? String(res.data.clientId) : undefined,
    };
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return scheduleMockAPI.atualizar(id, dados);
    }
    throw error;
  }
}

/**
 * Reservar horário (cliente faz booking)
 */
export async function reservarHorario(id: string, dados?: { notes?: string }): Promise<ScheduleEntry> {
  try {
    const res = await http.post(`/api/schedule/${id}/book`, dados || {});
    // Garante que IDs sejam strings
    return {
      ...res.data,
      id: String(res.data.id || res.data._id),
      artistId: String(res.data.artistId),
      clientId: res.data.clientId ? String(res.data.clientId) : undefined,
    };
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("⚠️ Backend indisponível, usando dados mock");
      return scheduleMockAPI.reservar(id, dados);
    }
    throw error;
  }
}

/**
 * Cancelar horário
 */
export async function cancelarHorario(id: string): Promise<ScheduleEntry> {
  try {
    const res = await http.post(`/api/schedule/${id}/cancel`);
    // Garante que IDs sejam strings
    return {
      ...res.data,
      id: String(res.data.id || res.data._id),
      artistId: String(res.data.artistId),
      clientId: res.data.clientId ? String(res.data.clientId) : undefined,
    };
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return scheduleMockAPI.cancelar(id);
    }
    throw error;
  }
}

/**
 * Deletar horário (apenas se não estiver reservado)
 */
export async function deletarHorario(id: string): Promise<{ deleted: boolean }> {
  try {
    const res = await http.delete(`/api/schedule/${id}`);
    return res.data;
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return scheduleMockAPI.deletar(id);
    }
    throw error;
  }
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
  try {
    const res = await http.get(`/api/schedule/artist/${artistId}/future`);
    // Garante que IDs sejam strings
    return res.data.map((item: any) => ({
      ...item,
      id: String(item.id || item._id),
      artistId: String(item.artistId),
      clientId: item.clientId ? String(item.clientId) : undefined,
    }));
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      const hoje = new Date();
      const todosHorarios = await scheduleMockAPI.listar({ artistId });
      return todosHorarios.filter(h => new Date(h.date) >= hoje);
    }
    throw error;
  }
}

/**
 * Obter minhas reservas (como cliente)
 */
export async function obterMinhasReservas(): Promise<ScheduleEntry[]> {
  try {
    const res = await http.get("/api/schedule/my-bookings");
    // Garante que IDs sejam strings
    return res.data.map((item: any) => ({
      ...item,
      id: String(item.id || item._id),
      artistId: String(item.artistId),
      clientId: item.clientId ? String(item.clientId) : undefined,
    }));
  } catch (error: any) {
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message?.includes("Network Error") ||
      error.message?.includes("Cannot") ||
      !error.response;

    if (usarMock || isNetworkError) {
      console.warn("Backend indisponível, usando dados mock");
      return scheduleMockAPI.obterMinhasReservas();
    }
    throw error;
  }
}
