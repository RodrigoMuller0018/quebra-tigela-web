import { http } from "./http";
import type { Service, NovoService, AtualizarService } from "../tipos/servicos";

function normalizar(s: any): Service {
  return {
    ...s,
    _id: String(s._id || s.id),
    artistId: String(s.artistId),
  };
}

export async function criarServico(dados: NovoService): Promise<Service> {
  const response = await http.post("/api/service-offerings", dados);
  return normalizar(response.data);
}

/** Lista serviços ATIVOS de um artista (uso público: clientes vendo perfil). */
export async function listarServicosPorArtista(artistId: string): Promise<Service[]> {
  const response = await http.get(`/api/service-offerings/artist/${artistId}`);
  return response.data.map(normalizar);
}

/** Lista TODOS os serviços do artista logado (incluindo inativos — pra dashboard). */
export async function listarMeusServicos(): Promise<Service[]> {
  const response = await http.get(`/api/service-offerings/mine`);
  return response.data.map(normalizar);
}

export async function obterServico(id: string): Promise<Service> {
  const { data } = await http.get(`/api/service-offerings/${id}`);
  return normalizar(data);
}

export async function atualizarServico(id: string, dados: AtualizarService): Promise<Service> {
  const { data } = await http.patch(`/api/service-offerings/${id}`, dados);
  return normalizar(data);
}

export async function deletarServico(id: string): Promise<void> {
  await http.delete(`/api/service-offerings/${id}`);
}

export async function alternarStatusServico(id: string, active: boolean): Promise<Service> {
  const { data } = await http.patch(`/api/service-offerings/${id}`, { active });
  return normalizar(data);
}
