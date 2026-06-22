export interface MidiaServico {
  tipo: "imagem" | "video";
  url: string;
}

export interface Servico {
  _id: string;
  artistaId: string;
  titulo: string;
  descricao?: string;
  midia?: MidiaServico[];
  ativo: boolean;
}

export interface NovoServico {
  titulo: string;
  descricao?: string;
  midia?: MidiaServico[];
  ativo?: boolean;
}

export interface AtualizarServico {
  titulo?: string;
  descricao?: string;
  midia?: MidiaServico[];
  ativo?: boolean;
}
