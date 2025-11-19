export interface ServiceMedia {
  type: "image" | "video";
  url: string;
}

export interface Service {
  _id: string;
  artistId: string;
  title: string;
  description?: string;
  media?: ServiceMedia[];
  active: boolean;
}

export interface NovoService {
  artistId: string;
  title: string;
  description?: string;
  media?: ServiceMedia[];
  active?: boolean;
}

export interface AtualizarService {
  title?: string;
  description?: string;
  media?: ServiceMedia[];
  active?: boolean;
}
