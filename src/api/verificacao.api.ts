import { http } from "./http";
import type { ResultadoVerificacao, QualidadeImagem } from "../tipos/verificacao";

/**
 * Envia fotos para verificação de identidade do artista
 */
export async function verificarIdentidadeArtista(
  selfie: File,
  documento: File,
  artistId: string
): Promise<ResultadoVerificacao> {
  const formData = new FormData();
  formData.append('photos', selfie);
  formData.append('photos', documento);
  formData.append('artistId', artistId);

  console.log("📤 VERIFICACAO API - Enviando fotos para verificação:", {
    selfieSize: selfie.size,
    documentoSize: documento.size,
    artistId,
  });

  const { data } = await http.post<ResultadoVerificacao>(
    '/api/face-comparison/verify-artist',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 segundos
    }
  );

  console.log("✅ VERIFICACAO API - Resposta recebida:", data);

  return data;
}

/**
 * Analisa a qualidade de uma foto antes de enviar
 * (opcional, para dar feedback em tempo real)
 */
export async function analisarQualidadeImagem(
  imagem: File
): Promise<QualidadeImagem> {
  const formData = new FormData();
  formData.append('image', imagem);

  console.log("📤 VERIFICACAO API - Analisando qualidade da imagem:", {
    size: imagem.size,
    type: imagem.type,
  });

  const { data } = await http.post<QualidadeImagem>(
    '/api/face-comparison/analyze-quality',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 10000, // 10 segundos
    }
  );

  console.log("✅ VERIFICACAO API - Qualidade analisada:", data);

  return data;
}
