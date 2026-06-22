/**
 * Detecta a plataforma a partir de uma URL de rede social.
 * Útil pra exibir ícone certo no perfil público.
 */

export type PlataformaRedeSocial =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "linkedin"
  | "twitch"
  | "soundcloud"
  | "spotify"
  | "behance"
  | "dribbble"
  | "artstation"
  | "vimeo"
  | "whatsapp"
  | "telegram"
  | "outro";

interface PlatformaInfo {
  id: PlataformaRedeSocial;
  label: string;
  /** Padrões de domínio que casam (sem www, lowercase) */
  dominios: string[];
}

const PLATAFORMAS: PlatformaInfo[] = [
  { id: "instagram", label: "Instagram", dominios: ["instagram.com"] },
  { id: "youtube", label: "YouTube", dominios: ["youtube.com", "youtu.be"] },
  { id: "tiktok", label: "TikTok", dominios: ["tiktok.com"] },
  { id: "twitter", label: "Twitter / X", dominios: ["twitter.com", "x.com"] },
  { id: "facebook", label: "Facebook", dominios: ["facebook.com", "fb.com"] },
  { id: "linkedin", label: "LinkedIn", dominios: ["linkedin.com"] },
  { id: "twitch", label: "Twitch", dominios: ["twitch.tv"] },
  { id: "soundcloud", label: "SoundCloud", dominios: ["soundcloud.com"] },
  { id: "spotify", label: "Spotify", dominios: ["spotify.com", "open.spotify.com"] },
  { id: "behance", label: "Behance", dominios: ["behance.net"] },
  { id: "dribbble", label: "Dribbble", dominios: ["dribbble.com"] },
  { id: "artstation", label: "ArtStation", dominios: ["artstation.com"] },
  { id: "vimeo", label: "Vimeo", dominios: ["vimeo.com"] },
  { id: "whatsapp", label: "WhatsApp", dominios: ["wa.me", "whatsapp.com"] },
  { id: "telegram", label: "Telegram", dominios: ["t.me", "telegram.me"] },
];

export function detectarPlataforma(url: string): {
  id: PlataformaRedeSocial;
  label: string;
} {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    const match = PLATAFORMAS.find((p) =>
      p.dominios.some((d) => host === d || host.endsWith("." + d)),
    );
    if (match) return { id: match.id, label: match.label };
  } catch {
    // URL inválida — cai no fallback
  }
  return { id: "outro", label: "Link" };
}
