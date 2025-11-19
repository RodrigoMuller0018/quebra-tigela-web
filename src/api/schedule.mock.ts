import type { ScheduleEntry } from "../tipos/schedule";

// Dados mock para desenvolvimento/demonstração
// Usado quando o backend não está disponível

// Pegar ID do artista logado do localStorage
const getArtistaId = (): string => {
  try {
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const parsed = JSON.parse(usuario);
      return parsed.id || parsed._id || "mock-artista-id";
    }
  } catch {
    // ignore
  }
  return "mock-artista-id";
};

// Gerar horários mock para os próximos 3 meses
const gerarHorariosMock = (): ScheduleEntry[] => {
  const horarios: ScheduleEntry[] = [];
  const hoje = new Date();
  const artistId = getArtistaId();

  // Gerar alguns horários para os próximos 90 dias
  for (let dia = 1; dia < 90; dia += 3) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + dia);
    data.setHours(0, 0, 0, 0);

    // Adicionar 2-3 horários por dia
    const quantidadeHorarios = Math.floor(Math.random() * 2) + 2;

    for (let h = 0; h < quantidadeHorarios; h++) {
      const horaInicio = 9 + (h * 2);
      const horaFim = horaInicio + 1;

      // Status aleatório: 60% available, 30% booked, 10% cancelled
      let status: "available" | "booked" | "cancelled" = "available";
      const rand = Math.random();
      if (rand > 0.6 && rand < 0.9) status = "booked";
      else if (rand >= 0.9) status = "cancelled";

      horarios.push({
        id: `mock-${dia}-${h}`,
        _id: `mock-${dia}-${h}`,
        artistId,
        clientId: status === "booked" ? "mock-client-id" : undefined,
        date: data.toISOString(),
        startTime: `${String(horaInicio).padStart(2, "0")}:00`,
        endTime: `${String(horaFim).padStart(2, "0")}:00`,
        status,
        notes: status === "booked" ? "Horário reservado via sistema mock" : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return horarios;
};

// Armazenamento em memória
let horariosMock: ScheduleEntry[] = gerarHorariosMock();
let proximoId = horariosMock.length + 1;

// Simula delay de rede (50-200ms)
const simularDelay = () => new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

// API Mock
export const scheduleMockAPI = {
  /**
   * Listar horários com filtros
   */
  async listar(filtros?: {
    artistId?: string;
    clientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ScheduleEntry[]> {
    await simularDelay();

    let resultado = [...horariosMock];

    if (filtros?.artistId) {
      resultado = resultado.filter(h => h.artistId === filtros.artistId);
    }

    if (filtros?.clientId) {
      resultado = resultado.filter(h => h.clientId === filtros.clientId);
    }

    if (filtros?.status) {
      resultado = resultado.filter(h => h.status === filtros.status);
    }

    if (filtros?.dateFrom) {
      const dataInicio = new Date(filtros.dateFrom);
      resultado = resultado.filter(h => new Date(h.date) >= dataInicio);
    }

    if (filtros?.dateTo) {
      const dataFim = new Date(filtros.dateTo);
      resultado = resultado.filter(h => new Date(h.date) <= dataFim);
    }

    return resultado;
  },

  /**
   * Obter horário por ID
   */
  async obterPorId(id: string): Promise<ScheduleEntry> {
    await simularDelay();

    const horario = horariosMock.find(h => h.id === id || h._id === id);
    if (!horario) {
      throw new Error("Horário não encontrado");
    }

    return horario;
  },

  /**
   * Criar novo horário
   */
  async criar(dados: any): Promise<ScheduleEntry> {
    console.log("🎭 MOCK - criar horário chamado");
    console.log("Dados recebidos:", dados);
    console.log("Total de horários mock antes:", horariosMock.length);

    await simularDelay();

    const novoHorario: ScheduleEntry = {
      artistId: dados.artistId || getArtistaId(),
      clientId: dados.clientId,
      date: dados.date,
      startTime: dados.startTime,
      endTime: dados.endTime,
      status: dados.status || "available",
      notes: dados.notes,
      serviceId: dados.serviceId,
      id: `mock-created-${proximoId}`,
      _id: `mock-created-${proximoId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Novo horário criado:", novoHorario);

    proximoId++;
    horariosMock.push(novoHorario);

    console.log("Total de horários mock depois:", horariosMock.length);
    console.log("Horário adicionado com ID:", novoHorario.id);

    return novoHorario;
  },

  /**
   * Criar múltiplos horários
   */
  async criarEmLote(horarios: any[]): Promise<ScheduleEntry[]> {
    console.log("🎭 MOCK - criarEmLote chamado");
    console.log("Quantidade recebida:", horarios.length);
    console.log("Dados recebidos:", horarios);
    console.log("Total de horários mock antes:", horariosMock.length);

    await simularDelay();

    const novosHorarios: ScheduleEntry[] = horarios.map(dados => ({
      artistId: dados.artistId || getArtistaId(),
      clientId: dados.clientId,
      date: dados.date,
      startTime: dados.startTime,
      endTime: dados.endTime,
      status: dados.status || "available",
      notes: dados.notes,
      serviceId: dados.serviceId,
      id: `mock-created-${proximoId++}`,
      _id: `mock-created-${proximoId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    console.log("Novos horários criados:", novosHorarios);

    horariosMock.push(...novosHorarios);

    console.log("Total de horários mock depois:", horariosMock.length);
    console.log("IDs adicionados:", novosHorarios.map(h => h.id));

    return novosHorarios;
  },

  /**
   * Atualizar horário
   */
  async atualizar(id: string, dados: Partial<ScheduleEntry>): Promise<ScheduleEntry> {
    await simularDelay();

    const index = horariosMock.findIndex(h => h.id === id || h._id === id);
    if (index === -1) {
      throw new Error("Horário não encontrado");
    }

    horariosMock[index] = {
      ...horariosMock[index],
      ...dados,
      updatedAt: new Date().toISOString(),
    };

    return horariosMock[index];
  },

  /**
   * Reservar horário
   */
  async reservar(id: string, dados?: { notes?: string }): Promise<ScheduleEntry> {
    await simularDelay();

    const index = horariosMock.findIndex(h => h.id === id || h._id === id);
    if (index === -1) {
      throw new Error("Horário não encontrado");
    }

    if (horariosMock[index].status !== "available") {
      throw new Error("Horário não está disponível");
    }

    horariosMock[index] = {
      ...horariosMock[index],
      status: "booked",
      clientId: "mock-client-id",
      notes: dados?.notes,
      updatedAt: new Date().toISOString(),
    };

    return horariosMock[index];
  },

  /**
   * Cancelar horário
   */
  async cancelar(id: string): Promise<ScheduleEntry> {
    await simularDelay();

    const index = horariosMock.findIndex(h => h.id === id || h._id === id);
    if (index === -1) {
      throw new Error("Horário não encontrado");
    }

    horariosMock[index] = {
      ...horariosMock[index],
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    return horariosMock[index];
  },

  /**
   * Deletar horário
   */
  async deletar(id: string): Promise<{ deleted: boolean }> {
    await simularDelay();

    const index = horariosMock.findIndex(h => h.id === id || h._id === id);
    if (index === -1) {
      throw new Error("Horário não encontrado");
    }

    // Só pode deletar se não estiver reservado
    if (horariosMock[index].status === "booked") {
      throw new Error("Não é possível deletar horário reservado");
    }

    horariosMock.splice(index, 1);

    return { deleted: true };
  },

  /**
   * Obter minhas reservas (como cliente)
   */
  async obterMinhasReservas(): Promise<ScheduleEntry[]> {
    await simularDelay();

    // Retorna horários reservados pelo cliente mock
    return horariosMock.filter(h => h.status === "booked" && h.clientId === "mock-client-id");
  },
};
