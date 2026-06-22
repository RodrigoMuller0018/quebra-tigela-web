import { http } from "./http";
import type { Artista, NovoArtista, AtualizaArtista } from "../tipos/artistas";

function normalizar(raw: any): Artista {
  return {
    ...raw,
    id: String(raw.id || raw._id),
    tiposArte: raw.tiposArte || [],
  };
}

export async function cadastrarArtista(dados: NovoArtista): Promise<Artista> {
  const res = await http.post("/api/autenticacao/registrar/artista", dados);
  return normalizar(res.data);
}

export interface DadosTornarSeArtista {
  bio?: string;
  tiposArte: string[];
  telefone: string;
  /** Opcional — backend auto-gera do nome se não vier. */
  handle?: string;
  nomeArtistico?: string;
  dataNascimento?: string;
  portfolio?: string;
  redesSociais?: string[];
}

/** Usuário logado vira artista. Backend cria Artista linkado ao Usuario do JWT. */
export async function tornarSeArtista(dados: DadosTornarSeArtista): Promise<Artista> {
  const res = await http.post("/api/artistas/tornar-se-artista", dados);
  return normalizar(res.data);
}

export interface FiltrosArtistas {
  estado?: string;
  cidade?: string;
  tipoArte?: string;
}

export async function listarArtistas(filtros?: FiltrosArtistas): Promise<Artista[]> {
  const params = new URLSearchParams();
  if (filtros?.estado) params.append("estado", filtros.estado);
  if (filtros?.cidade) params.append("cidade", filtros.cidade);
  if (filtros?.tipoArte) params.append("tipoArte", filtros.tipoArte);

  const queryString = params.toString();
  const url = queryString
    ? `/api/artistas/buscar?${queryString}`
    : "/api/artistas/buscar";

  const res = await http.get(url);
  return res.data.map(normalizar);
}

export async function obterArtistaPorId(id: string): Promise<Artista> {
  const res = await http.get(`/api/artistas/${id}/perfil`);
  const payload = res.data?.artista ?? res.data;
  return normalizar(payload);
}

/** Busca perfil completo pelo handle público (estilo @username). */
export async function obterArtistaPorHandle(handle: string): Promise<Artista> {
  const limpo = handle.replace(/^@/, "");
  const res = await http.get(`/api/artistas/por-handle/${limpo}/perfil`);
  const payload = res.data?.artista ?? res.data;
  return normalizar(payload);
}

/**
 * Registra uma visualização do perfil. Endpoint público (funciona deslogado);
 * backend ignora self-views automaticamente.
 */
export async function registrarVisualizacaoArtista(
  handle: string,
): Promise<{ visualizacoes: number; contou: boolean }> {
  const limpo = handle.replace(/^@/, "");
  const res = await http.post(`/api/artistas/por-handle/${limpo}/visualizar`);
  return res.data;
}

/** Check de disponibilidade pra UI mostrar verde/vermelho. */
export async function verificarHandleDisponivel(
  handle: string,
): Promise<{ disponivel: boolean; motivo?: string }> {
  const res = await http.get(`/api/artistas/por-handle/${handle}/disponivel`);
  return res.data;
}

/** Retorna o Artista do usuário logado (combinado com dados de Usuario). */
export async function obterMeuPerfil(): Promise<Artista> {
  const res = await http.get("/api/artistas/eu");
  return normalizar(res.data);
}

export async function atualizarArtista(
  id: string,
  dados: AtualizaArtista,
): Promise<Artista> {
  const res = await http.patch(`/api/artistas/${id}`, dados);
  return normalizar(res.data);
}

export async function excluirArtista(id: string): Promise<void> {
  await http.delete(`/api/artistas/${id}`);
}

/** Soft delete: pausa o perfil de artista sem apagar histórico. */
export async function pausarPerfilArtista(
  id: string,
): Promise<{ ativo: boolean; desativadoEm: string }> {
  const res = await http.patch(`/api/artistas/${id}/desativar`);
  return res.data;
}

export async function reativarPerfilArtista(
  id: string,
): Promise<{ ativo: boolean }> {
  const res = await http.patch(`/api/artistas/${id}/reativar`);
  return res.data;
}

export async function verificarIdentidadeArtista(
  id: string,
  selfie: File,
  documento: File,
): Promise<{ verificado: boolean; similaridade: number; mensagem: string }> {
  const formData = new FormData();
  formData.append("selfie", selfie);
  formData.append("documento", documento);

  const res = await http.post(`/api/artistas/${id}/verificar-identidade`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
