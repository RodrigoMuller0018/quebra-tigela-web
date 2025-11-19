import { http } from "./http";
import type { Artista, NovoArtista, AtualizaArtista } from "../tipos/artistas";

export async function cadastrarArtista(dados: NovoArtista): Promise<Artista> {
  const res = await http.post("/api/auth/register/artist", dados);
  // Transformar _id para id se necessário e garantir artTypes é array
  // Força conversão para string para garantir compatibilidade
  return {
    ...res.data,
    id: String(res.data.id || res.data._id),
    artTypes: res.data.artTypes || [],
  };
}

export interface FiltrosArtistas {
  state?: string;
  city?: string;
  artType?: string;
}

export async function listarArtistas(filtros?: FiltrosArtistas): Promise<Artista[]> {
  // Montar query string com filtros
  const params = new URLSearchParams();
  if (filtros?.state) params.append("state", filtros.state);
  if (filtros?.city) params.append("city", filtros.city);
  if (filtros?.artType) params.append("artType", filtros.artType);

  const queryString = params.toString();
  const url = queryString ? `/api/artists/search?${queryString}` : "/api/artists/search";

  const res = await http.get(url);
  // Transformar _id para id se necessário e garantir artTypes é array
  // Força conversão para string para garantir compatibilidade
  return res.data.map((artista: any) => ({
    ...artista,
    id: String(artista.id || artista._id),
    artTypes: artista.artTypes || [],
  }));
}

export async function obterArtistaPorId(id: string): Promise<Artista> {
  console.log("🔍 API - obterArtistaPorId chamado com ID:", id);
  const res = await http.get(`/api/artists/${id}/profile`);
  console.log("📥 API - Resposta recebida:", res.data);

  // Transformar _id para id se necessário e garantir artTypes é array
  // Força conversão para string para garantir compatibilidade
  const artistaFinal = {
    ...res.data,
    id: String(res.data.id || res.data._id),
    artTypes: res.data.artTypes || [],
  };

  console.log("✅ API - Artista processado com ID:", artistaFinal.id);
  return artistaFinal;
}

export async function obterMeuPerfil(): Promise<Artista> {
  // Obter ID do token JWT
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token não encontrado");

  // Decodificar token para obter ID
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    const meuId = decoded.sub;

    // Buscar perfil usando ID real (sem /profile pois não precisa verificar verified)
    const res = await http.get(`/api/artists/${meuId}`);
    console.log("obterMeuPerfil - ID extraído do token:", meuId);
    console.log("obterMeuPerfil - dados recebidos:", res.data);
    console.log("obterMeuPerfil - res.data.id:", res.data.id);
    console.log("obterMeuPerfil - res.data._id:", res.data._id);

    const idFinal = String(res.data.id || res.data._id);
    console.log("obterMeuPerfil - ID FINAL usado (string):", idFinal);
    console.log("obterMeuPerfil - tipo do ID:", typeof idFinal);

    // Transformar _id para id se necessário e garantir artTypes é array
    // Força conversão para string para garantir compatibilidade
    return {
      ...res.data,
      id: idFinal,
      artTypes: res.data.artTypes || [],
    };
  } catch (error) {
    throw new Error("Erro ao decodificar token");
  }
}

export async function atualizarArtista(id: string, dados: AtualizaArtista): Promise<Artista> {
  console.log("📝 API - atualizarArtista chamado:", { id, dados });
  const res = await http.patch(`/api/artists/${id}`, dados);
  console.log("✅ API - Artista atualizado:", res.data);

  // Transformar _id para id se necessário e garantir artTypes é array
  // Força conversão para string para garantir compatibilidade
  return {
    ...res.data,
    id: String(res.data.id || res.data._id),
    artTypes: res.data.artTypes || [],
  };
}

export async function excluirArtista(id: string): Promise<void> {
  await http.delete(`/api/artists/${id}`);
}

/**
 * Verificar identidade do artista com foto e documento
 * Usa reconhecimento facial para validar identidade
 */
export async function verificarIdentidadeArtista(
  id: string,
  selfie: File,
  documento: File
): Promise<{ verified: boolean; similarity: number; message: string }> {
  const formData = new FormData();
  formData.append("selfie", selfie);
  formData.append("document", documento);

  const res = await http.post(`/api/artists/${id}/verify-identity`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
