import type { ScheduleEntry } from "../../tipos/schedule";
import { Botao } from "../ui";
import { gerarLinkGoogleCalendarDeSchedule, baixarICS, gerarICSDeSchedule } from "../../utilitarios/googleCalendar";
import "./ListaHorarios.css";

interface Props {
  horarios: ScheduleEntry[];
  artistaNome?: string;
  artistaEmail?: string;
  podeCancelar?: boolean;
  podeDeletar?: boolean;
  onCancelar?: (id: string) => void;
  onDeletar?: (id: string) => void;
  onReservar?: (id: string) => void;
  modo?: "artista" | "cliente";
}

export function ListaHorarios({
  horarios,
  artistaNome = "Artista",
  artistaEmail,
  podeCancelar,
  podeDeletar,
  onCancelar,
  onDeletar,
  onReservar,
  modo = "artista",
}: Props) {
  function formatarData(dataISO: string): string {
    // Se vier em formato YYYY-MM-DD, adiciona T00:00:00 para evitar problemas de timezone
    const dataStr = dataISO.includes('T') ? dataISO : dataISO + 'T00:00:00';
    const data = new Date(dataStr);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(data);
  }

  function formatarDiaSemana(dataISO: string): string {
    // Se vier em formato YYYY-MM-DD, adiciona T00:00:00 para evitar problemas de timezone
    const dataStr = dataISO.includes('T') ? dataISO : dataISO + 'T00:00:00';
    const data = new Date(dataStr);
    return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(data);
  }

  function obterStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: "Disponível",
      booked: "Reservado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  }

  function obterStatusClass(status: string): string {
    const classes: Record<string, string> = {
      available: "status-disponivel",
      booked: "status-reservado",
      cancelled: "status-cancelado",
    };
    return classes[status] || "";
  }

  function handleAdicionarCalendario(horario: ScheduleEntry, tipo: "google" | "ics") {
    if (tipo === "google") {
      const link = gerarLinkGoogleCalendarDeSchedule(horario, artistaNome);
      window.open(link, "_blank");
    } else {
      const ics = gerarICSDeSchedule(horario, artistaNome, artistaEmail);
      const nomeArquivo = `agendamento-${horario.date.split("T")[0]}-${horario.startTime}.ics`;
      baixarICS(ics, nomeArquivo);
    }
  }

  if (horarios.length === 0) {
    return (
      <div className="lista-horarios-vazia">
        <p>Nenhum horário encontrado</p>
      </div>
    );
  }

  // Agrupar por dia
  const horariosPorDia = horarios.reduce((acc, horario) => {
    const data = horario.date.split("T")[0];
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(horario);
    return acc;
  }, {} as Record<string, ScheduleEntry[]>);

  return (
    <div className="lista-horarios">
      {Object.entries(horariosPorDia).map(([data, horariosNoDia]) => (
        <div key={data} className="lista-horarios-dia">
          <div className="lista-horarios-dia-header">
            <h3 className="lista-horarios-data">{formatarData(data)}</h3>
            <span className="lista-horarios-dia-semana">{formatarDiaSemana(data)}</span>
          </div>

          <div className="lista-horarios-items">
            {horariosNoDia.map((horario) => (
              <div key={horario._id || horario.id} className="horario-item">
                <div className="horario-info">
                  <div className="horario-tempo">
                    <span className="horario-icone">🕐</span>
                    <span className="horario-hora">{horario.startTime || "00:00"}</span>
                    <span className="horario-separador">até</span>
                    <span className="horario-hora">{horario.endTime || "00:00"}</span>
                  </div>

                  <div className="horario-detalhes-wrapper">
                    <span className={`horario-status ${obterStatusClass(horario.status)}`}>
                      {obterStatusLabel(horario.status)}
                    </span>

                    {horario.notes ? (
                      <p className="horario-notas">
                        <span className="horario-notas-icone">📝</span>
                        {horario.notes}
                      </p>
                    ) : (
                      <p className="horario-sem-notas">Sem observações</p>
                    )}
                  </div>
                </div>

                <div className="horario-acoes">
                  {/* Artista pode cancelar/deletar */}
                  {modo === "artista" && (
                    <>
                      {podeCancelar && horario.status === "booked" && (
                        <Botao
                          variante="fantasma"
                          onClick={() => onCancelar?.(horario._id || horario.id!)}
                        >
                          Cancelar
                        </Botao>
                      )}
                      {podeDeletar && horario.status === "available" && (
                        <Botao
                          variante="perigo"
                          onClick={() => onDeletar?.(horario._id || horario.id!)}
                        >
                          Deletar
                        </Botao>
                      )}
                    </>
                  )}

                  {/* Cliente pode reservar ou adicionar ao calendário */}
                  {modo === "cliente" && (
                    <>
                      {horario.status === "available" && onReservar && (
                        <Botao
                          variante="primaria"
                          onClick={() => onReservar(horario._id || horario.id!)}
                        >
                          Reservar
                        </Botao>
                      )}

                      {horario.status === "booked" && (
                        <div className="horario-calendario-opcoes">
                          <Botao
                            variante="fantasma"
                            onClick={() => handleAdicionarCalendario(horario, "google")}
                          >
                            📅 Google Calendar
                          </Botao>
                          <Botao
                            variante="fantasma"
                            onClick={() => handleAdicionarCalendario(horario, "ics")}
                          >
                            📥 Baixar .ics
                          </Botao>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
