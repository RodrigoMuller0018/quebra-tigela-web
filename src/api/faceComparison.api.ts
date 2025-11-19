import { http } from "./http";

/**
 * API de Comparação Facial
 * Usa MediaPipe para reconhecimento facial
 */

export interface FaceComparisonResult {
  similarity: number; // 0-100
  confidence: number; // 0-1
  isMatch: boolean;
  message: string;
}

export interface QualityAnalysisResult {
  quality: "good" | "fair" | "poor";
  issues: string[];
  recommendations: string[];
  canProceed: boolean;
}

/**
 * Comparar duas imagens quaisquer
 */
export async function compararFaces(
  image1: File,
  image2: File
): Promise<FaceComparisonResult> {
  const formData = new FormData();
  formData.append("image1", image1);
  formData.append("image2", image2);

  const res = await http.post("/api/face-comparison/compare", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/**
 * Verificar identidade com selfie e documento
 */
export async function verificarIdentidade(
  selfie: File,
  documento: File
): Promise<FaceComparisonResult> {
  const formData = new FormData();
  formData.append("selfie", selfie);
  formData.append("document", documento);

  const res = await http.post("/api/face-comparison/verify-identity", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/**
 * Verificar identidade de artista específico
 */
export async function verificarArtista(
  artistId: string,
  selfie: File
): Promise<FaceComparisonResult> {
  const formData = new FormData();
  formData.append("selfie", selfie);

  const res = await http.post(`/api/face-comparison/verify-artist/${artistId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

/**
 * Analisar qualidade da foto antes de enviar
 */
export async function analisarQualidade(
  image: File
): Promise<QualityAnalysisResult> {
  const formData = new FormData();
  formData.append("image", image);

  const res = await http.post("/api/face-comparison/analyze-quality", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
