export interface PayloadToken {
  /** Usuario._id sempre (identidade base) */
  sub: string;
  email: string;
  /** Papel base: 'cliente' (padrão) ou 'admin'. 'artista' agora é capability via temPerfilArtista. */
  papel: "cliente" | "admin";
  /** True se o user tem perfil de Artista linkado */
  temPerfilArtista?: boolean;
  /** Artista._id se temPerfilArtista=true */
  artistaId?: string;
  iat: number;
  exp: number;
}

export function decodificarToken(token: string): PayloadToken | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const payload = partes[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decoded) as PayloadToken;
  } catch {
    return null;
  }
}

export function obterIdDoToken(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = decodificarToken(token);
    return payload?.sub || null;
  } catch {
    return null;
  }
}
