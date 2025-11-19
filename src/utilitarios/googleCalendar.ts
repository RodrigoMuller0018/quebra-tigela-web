/**
 * Utilitários para integração com Google Calendar
 * Gera arquivos .ics (iCalendar) que podem ser importados em qualquer calendário
 */

import type { ScheduleEntry } from "../tipos/schedule";

/**
 * Formata data para formato iCalendar (YYYYMMDDTHHMMSS)
 */
function formatarDataICS(data: string, horario: string): string {
  const [ano, mes, dia] = data.split("-");
  const [hora, minuto] = horario.split(":");
  return `${ano}${mes}${dia}T${hora}${minuto}00`;
}

/**
 * Gera conteúdo do arquivo .ics para um evento
 */
export function gerarICS(evento: {
  titulo: string;
  descricao?: string;
  localizacao?: string;
  dataInicio: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  dataFim: string; // YYYY-MM-DD
  horaFim: string; // HH:mm
  organizador?: { nome: string; email: string };
}): string {
  const inicio = formatarDataICS(evento.dataInicio, evento.horaInicio);
  const fim = formatarDataICS(evento.dataFim, evento.horaFim);
  const agora = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Quebra Tigela//Agenda//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${agora}@quebra-tigela.com`,
    `DTSTAMP:${agora}`,
    `DTSTART:${inicio}`,
    `DTEND:${fim}`,
    `SUMMARY:${evento.titulo}`,
  ];

  if (evento.descricao) {
    linhas.push(`DESCRIPTION:${evento.descricao.replace(/\n/g, "\\n")}`);
  }

  if (evento.localizacao) {
    linhas.push(`LOCATION:${evento.localizacao}`);
  }

  if (evento.organizador) {
    linhas.push(`ORGANIZER;CN=${evento.organizador.nome}:mailto:${evento.organizador.email}`);
  }

  linhas.push(
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  return linhas.join("\r\n");
}

/**
 * Gera arquivo .ics a partir de ScheduleEntry
 */
export function gerarICSDeSchedule(
  schedule: ScheduleEntry,
  artistaNome: string,
  artistaEmail?: string
): string {
  return gerarICS({
    titulo: `Horário com ${artistaNome}`,
    descricao: schedule.notes || `Serviço agendado com ${artistaNome}`,
    localizacao: "A combinar",
    dataInicio: schedule.date.split("T")[0],
    horaInicio: schedule.startTime,
    dataFim: schedule.date.split("T")[0],
    horaFim: schedule.endTime,
    organizador: artistaEmail
      ? { nome: artistaNome, email: artistaEmail }
      : undefined,
  });
}

/**
 * Baixa arquivo .ics
 */
export function baixarICS(conteudo: string, nomeArquivo: string = "evento.ics"): void {
  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gera link para adicionar ao Google Calendar (via URL)
 * Alternativa ao arquivo .ics
 */
export function gerarLinkGoogleCalendar(evento: {
  titulo: string;
  descricao?: string;
  localizacao?: string;
  dataInicio: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  dataFim: string; // YYYY-MM-DD
  horaFim: string; // HH:mm
}): string {
  const inicio = formatarDataICS(evento.dataInicio, evento.horaInicio);
  const fim = formatarDataICS(evento.dataFim, evento.horaFim);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    dates: `${inicio}/${fim}`,
  });

  if (evento.descricao) {
    params.append("details", evento.descricao);
  }

  if (evento.localizacao) {
    params.append("location", evento.localizacao);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Gera link do Google Calendar para ScheduleEntry
 */
export function gerarLinkGoogleCalendarDeSchedule(
  schedule: ScheduleEntry,
  artistaNome: string
): string {
  return gerarLinkGoogleCalendar({
    titulo: `Horário com ${artistaNome}`,
    descricao: schedule.notes || `Serviço agendado com ${artistaNome}`,
    localizacao: "A combinar",
    dataInicio: schedule.date.split("T")[0],
    horaInicio: schedule.startTime,
    dataFim: schedule.date.split("T")[0],
    horaFim: schedule.endTime,
  });
}
