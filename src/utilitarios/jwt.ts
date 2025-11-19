export interface TokenPayload {
  sub: string;
  email: string;
  role: "client" | "artist" | "admin";
  iat: number;
  exp: number;
}

export function decodificarToken(token: string): TokenPayload | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const payload = partes[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

export function obterRoleDoToken(): "client" | "artist" | "admin" | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = decodificarToken(token);
    return payload?.role || null;
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