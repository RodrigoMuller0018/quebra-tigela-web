/**
 * Janela em que cliente pode editar/excluir avaliação e artista pode excluir resposta.
 * Bate com o backend (reviews.service.ts > JANELA_EDICAO_MS). Trocou aqui, troca lá.
 */
export const JANELA_EDICAO_MS = 15 * 60_000;

export function dentroDaJanelaEdicao(isoTimestamp?: string): boolean {
  if (!isoTimestamp) return false;
  return Date.now() - new Date(isoTimestamp).getTime() <= JANELA_EDICAO_MS;
}
