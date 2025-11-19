import { http } from "./http";
import type { Service, NovoService, AtualizarService } from "../tipos/servicos";

export async function criarServico(dados: NovoService): Promise<Service> {
  const response = await http.post("/api/service-offerings", dados);

  return {
    ...response.data,
    _id: String(response.data._id || response.data.id),
    artistId: String(response.data.artistId)
  };
}

export async function listarServicosPorArtista(artistId: string): Promise<Service[]> {
  const response = await http.get(`/api/service-offerings/artist/${artistId}`);

  return response.data.map((servico: any) => ({
    ...servico,
    _id: String(servico._id || servico.id),
    artistId: String(servico.artistId)
  }));
}

export async function obterServico(id: string): Promise<Service> {
  const { data } = await http.get(`/api/service-offerings/${id}`);

  // Garante que IDs sejam strings
  return {
    ...data,
    _id: String(data._id || data.id),
    artistId: String(data.artistId)
  };
}

export async function atualizarServico(id: string, dados: AtualizarService): Promise<Service> {
  const { data } = await http.put(`/api/service-offerings/${id}`, dados);

  return {
    ...data,
    _id: String(data._id || data.id),
    artistId: String(data.artistId)
  };
}

export async function deletarServico(id: string): Promise<void> {
  try {
    await http.delete(`/api/service-offerings/${id}`);
  } catch (error: any) {
    console.error("Erro ao deletar serviço:", error);
    throw error;
  }
}

export async function alternarStatusServico(id: string, active: boolean): Promise<Service> {
  const { data } = await http.patch(`/api/service-offerings/${id}`, { active });

  return {
    ...data,
    _id: String(data._id || data.id),
    artistId: String(data.artistId)
  };
}
