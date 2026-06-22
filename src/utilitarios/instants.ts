/**
 * Helpers pra trabalhar com startInstant/endInstant (ISO 8601 com timezone).
 *
 * Forms manipulam (dateLocal, timeLocal) — strings tipo "2026-06-21" e "22:00".
 * Backend recebe/devolve ISO com timezone. Estes helpers ponteam os dois mundos.
 */

/**
 * Combina data local (YYYY-MM-DD) + hora local (HH:mm) em um instant ISO
 * usando o fuso do navegador. Resultado: string ISO em UTC pra enviar ao backend.
 */
export function composeInstant(dateLocal: string, timeLocal: string): string {
  // new Date("YYYY-MM-DDTHH:mm") interpreta como LOCAL → toISOString() converte pra UTC
  const d = new Date(`${dateLocal}T${timeLocal}:00`);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Data/hora inválida");
  }
  return d.toISOString();
}

/**
 * Extrai a parte de data local (YYYY-MM-DD) de um instant ISO.
 * Usa fuso do navegador.
 */
export function instantToDateLocal(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Extrai a parte de hora local (HH:mm) de um instant ISO. */
export function instantToTimeLocal(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** Verifica se dois instants são no mesmo dia local. */
export function ehMesmoDiaLocal(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Formata um instant pra UI: "21/06/2026 22:00"
 */
export function formatarInstant(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Só data: "21/06/2026" */
export function formatarDataLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Só hora: "22:00" */
export function formatarHoraLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Formata range completo "21/06/2026 22:00 → 22/06/2026 02:00"
 * (sempre mostra data completa de início e fim, atravesse ou não meia-noite).
 */
export function formatarRangeCompleto(startIso: string, endIso: string): string {
  return `${formatarInstant(startIso)} → ${formatarInstant(endIso)}`;
}

/**
 * Versão compacta: se mesmo dia, "21/06/2026 22:00 → 23:00".
 * Se multi-dia, igual ao formatarRangeCompleto.
 */
export function formatarRangeAdaptativo(
  startIso: string,
  endIso: string,
): string {
  if (ehMesmoDiaLocal(startIso, endIso)) {
    return `${formatarInstant(startIso)} → ${formatarHoraLocal(endIso)}`;
  }
  return formatarRangeCompleto(startIso, endIso);
}
