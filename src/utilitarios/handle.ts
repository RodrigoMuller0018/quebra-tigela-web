/**
 * Utilitários de handle público (@username) — mantém em sincronia com o backend
 * (regex e regras devem bater com src/common/handle.ts).
 */

export const REGEX_HANDLE = /^[a-z0-9_]{3,30}$/;

/**
 * Converte texto livre num candidato a handle (slug).
 * Usado pra dar sugestão automática conforme o usuário digita o nome.
 */
export function sugerirHandle(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 30);
}

/** Sanitiza input do usuário no campo handle (só passa chars válidos, lowercase). */
export function sanitizarHandle(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, 30);
}

/** Pré-validação de formato no client (não dispensa o check no backend). */
export function formatoHandleValido(handle: string): boolean {
  return REGEX_HANDLE.test(handle);
}
