/**
 * Utilitários de telefone celular BR e integração wa.me.
 * - Formato armazenado/transmitido: só dígitos com DDI 55 (ex: "5511999998888")
 * - Formato display: "(11) 99999-8888"
 */

const REGEX_TELEFONE_BR = /^55\d{2}9\d{8}$/;

/** Remove tudo que não é dígito. */
export function soDigitos(valor: string): string {
  return valor.replace(/\D+/g, "");
}

/**
 * Normaliza pro formato persistido. Aceita entrada com máscara, sem DDI, etc.
 * - "(11) 99999-8888" → "5511999998888"
 * - "11 99999-8888"   → "5511999998888"
 * - "+55 11 99999-8888" → "5511999998888"
 * - já normalizado: mantém.
 */
export function normalizarTelefone(valor: string): string {
  const so = soDigitos(valor);
  if (so.startsWith("55") && so.length === 13) return so;
  if (so.length === 11) return "55" + so;
  return so;
}

/** Valida se o telefone normalizado segue o formato BR aceito. */
export function ehTelefoneValidoBR(valor: string): boolean {
  return REGEX_TELEFONE_BR.test(valor);
}

/**
 * Aplica máscara de digitação progressiva: "(XX) 9XXXX-XXXX".
 * Usado no onChange do input — recebe valor digitado, devolve string formatada.
 */
export function aplicarMascaraTelefone(valor: string): string {
  const so = soDigitos(valor).slice(-11); // sem DDI 55 (input só DDD + número)
  if (so.length === 0) return "";
  if (so.length <= 2) return `(${so}`;
  if (so.length <= 7) return `(${so.slice(0, 2)}) ${so.slice(2)}`;
  return `(${so.slice(0, 2)}) ${so.slice(2, 7)}-${so.slice(7)}`;
}

/** Pega telefone normalizado e devolve string com máscara visual. */
export function formatarTelefoneExibicao(normalizado: string): string {
  const so = soDigitos(normalizado);
  const semDDI = so.startsWith("55") ? so.slice(2) : so;
  return aplicarMascaraTelefone(semDDI);
}

/**
 * Monta link wa.me com mensagem pré-preenchida.
 * O backend retorna telefone já normalizado, então só usa direto.
 *
 * @example
 * montarLinkWhatsApp("5511999998888", "Olá!")
 * → "https://wa.me/5511999998888?text=Ol%C3%A1!"
 */
export function montarLinkWhatsApp(telefone: string, mensagem?: string): string {
  const numero = soDigitos(telefone);
  const base = `https://wa.me/${numero}`;
  if (!mensagem) return base;
  return `${base}?text=${encodeURIComponent(mensagem)}`;
}
