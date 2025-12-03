/**
 * UTILITÁRIOS DE DATA
 * Funções auxiliares para manipulação e formatação de datas
 */

import { NOMES_MESES, NOMES_MESES_CAPITALIZADOS, NOMES_DIAS_SEMANA } from "../constantes/agenda";

/**
 * Formata uma data ISO para formato brasileiro (DD de mês de YYYY)
 * @param dataISO - Data no formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
 * @returns Data formatada (ex: "19 de novembro de 2025")
 *
 * @example
 * formatarDataPorExtenso("2025-11-19") // "19 de novembro de 2025"
 * formatarDataPorExtenso("2025-11-19T10:00:00") // "19 de novembro de 2025"
 */
export function formatarDataPorExtenso(dataISO: string): string {
  // Se vier em formato YYYY-MM-DD, adiciona T00:00:00 para evitar problemas de timezone
  const dataStr = dataISO.includes('T') ? dataISO : dataISO + 'T00:00:00';
  const data = new Date(dataStr);

  const dia = data.getDate();
  const mes = NOMES_MESES[data.getMonth()];
  const ano = data.getFullYear();

  return `${dia} de ${mes} de ${ano}`;
}

/**
 * Formata uma data ISO usando Intl.DateTimeFormat
 * @param dataISO - Data no formato ISO
 * @returns Data formatada (ex: "19 de novembro de 2025")
 *
 * @example
 * formatarData("2025-11-19") // "19 de novembro de 2025"
 */
export function formatarData(dataISO: string): string {
  const dataStr = dataISO.includes('T') ? dataISO : dataISO + 'T00:00:00';
  const data = new Date(dataStr);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(data);
}

/**
 * Retorna o nome do dia da semana de uma data ISO
 * @param dataISO - Data no formato ISO
 * @returns Nome do dia da semana (ex: "Quarta-feira")
 *
 * @example
 * obterNomeDiaSemana("2025-11-19") // "Quarta-feira"
 */
export function obterNomeDiaSemana(dataISO: string): string {
  const dataStr = dataISO.includes('T') ? dataISO : dataISO + 'T00:00:00';
  const data = new Date(dataStr);

  return NOMES_DIAS_SEMANA[data.getDay()];
}

/**
 * Formata dia da semana usando Intl.DateTimeFormat
 * @param dataISO - Data no formato ISO
 * @returns Nome do dia da semana
 *
 * @example
 * formatarDiaSemana("2025-11-19") // "quarta-feira"
 */
export function formatarDiaSemana(dataISO: string): string {
  const dataStr = dataISO.includes('T') ? dataISO : dataISO + 'T00:00:00';
  const data = new Date(dataStr);

  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(data);
}

/**
 * Converte um objeto Date para string no formato YYYY-MM-DD
 * @param data - Objeto Date
 * @returns String no formato YYYY-MM-DD
 *
 * @example
 * const hoje = new Date(2025, 10, 19);
 * dateParaString(hoje) // "2025-11-19"
 */
export function dateParaString(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

/**
 * Verifica se duas datas representam o mesmo dia
 * @param data1 - Primeira data
 * @param data2 - Segunda data
 * @returns true se as datas são do mesmo dia
 *
 * @example
 * const d1 = new Date(2025, 10, 19, 10, 30);
 * const d2 = new Date(2025, 10, 19, 15, 45);
 * ehMesmoDia(d1, d2) // true
 */
export function ehMesmoDia(data1: Date, data2: Date): boolean {
  return (
    data1.getDate() === data2.getDate() &&
    data1.getMonth() === data2.getMonth() &&
    data1.getFullYear() === data2.getFullYear()
  );
}

/**
 * Obtém data de X meses atrás ou no futuro
 * @param meses - Número de meses (positivo = futuro, negativo = passado)
 * @returns Nova data
 *
 * @example
 * obterDataRelativa(-6) // 6 meses atrás
 * obterDataRelativa(3)  // 3 meses no futuro
 */
export function obterDataRelativa(meses: number): Date {
  const data = new Date();
  data.setMonth(data.getMonth() + meses);
  return data;
}

/**
 * Formata o nome do mês e ano (ex: "Novembro 2025")
 * @param data - Objeto Date
 * @returns String formatada
 *
 * @example
 * formatarMesAno(new Date(2025, 10, 19)) // "Novembro 2025"
 */
export function formatarMesAno(data: Date): string {
  const mes = NOMES_MESES_CAPITALIZADOS[data.getMonth()];
  const ano = data.getFullYear();

  return `${mes} ${ano}`;
}

/**
 * Extrai a parte de data de uma string ISO (YYYY-MM-DD)
 * @param dataISO - Data no formato ISO completo ou parcial
 * @returns Parte da data (YYYY-MM-DD)
 *
 * @example
 * extrairData("2025-11-19T10:30:00") // "2025-11-19"
 * extrairData("2025-11-19") // "2025-11-19"
 */
export function extrairData(dataISO: string): string {
  return dataISO.includes('T') ? dataISO.split('T')[0] : dataISO;
}
