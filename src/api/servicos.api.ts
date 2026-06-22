import { http } from "./http";
import type { Servico, NovoServico, AtualizarServico } from "../tipos/servicos";

function normalizar(s: any): Servico {
  return {
    ...s,
    _id: String(s._id || s.id),
    artistaId: String(s.artistaId),
  };
}

export async function criarServico(dados: NovoServico): Promise<Servico> {
  const response = await http.post("/api/servicos", dados);
  return normalizar(response.data);
}

/** Lista serviços ATIVOS de um artista (uso público: clientes vendo perfil). */
export async function listarServicosPorArtista(artistaId: string): Promise<Servico[]> {
  const response = await http.get(`/api/servicos/artista/${artistaId}`);
  return response.data.map(normalizar);
}

/** Lista TODOS os serviços do artista logado (incluindo inativos — pra dashboard). */
export async function listarMeusServicos(): Promise<Servico[]> {
  const response = await http.get(`/api/servicos/meus`);
  return response.data.map(normalizar);
}

export async function obterServico(id: string): Promise<Servico> {
  const { data } = await http.get(`/api/servicos/${id}`);
  return normalizar(data);
}

export async function atualizarServico(id: string, dados: AtualizarServico): Promise<Servico> {
  const { data } = await http.patch(`/api/servicos/${id}`, dados);
  return normalizar(data);
}

export async function deletarServico(id: string): Promise<void> {
  await http.delete(`/api/servicos/${id}`);
}

export async function alternarStatusServico(id: string, ativo: boolean): Promise<Servico> {
  const { data } = await http.patch(`/api/servicos/${id}`, { ativo });
  return normalizar(data);
}
