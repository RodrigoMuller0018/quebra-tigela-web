export interface ResultadoVerificacao {
  verified: boolean;
  similarity: number;
  confidence: number;
  message: string;
  status: 'APPROVED' | 'REJECTED';
  timestamp: string;
  details?: {
    detectionMethod: string;
    threshold: number;
    timestamp: string;
  };
  artistId?: string;
}

export interface QualidadeImagem {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number;
  issues: string[];
  hasFace: boolean;
}

export interface DadosVerificacao {
  selfie: File;
  documento: File;
  artistId: string;
}
