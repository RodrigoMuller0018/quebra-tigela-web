import { Button, Card, CardContent } from "@heroui/react";
import { Clock, Trash2, Calendar, Download } from "lucide-react";
import type { ScheduleEntry } from "../../tipos/schedule";
import {
  gerarLinkGoogleCalendarDeSchedule,
  baixarICS,
  gerarICSDeSchedule,
} from "../../utilitarios/googleCalendar";

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

const STATUS_LABELS: Record<string, string> = {
  available: "Disponível",
  booked: "Reservado",
  cancelled: "Cancelado",
};

const STATUS_TONE: Record<string, string> = {
  available: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  booked: "bg-[color:var(--secondary)]/15 text-[color:var(--secondary)]",
  cancelled: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
};

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
    const dataStr = dataISO.includes("T") ? dataISO : dataISO + "T00:00:00";
    const data = new Date(dataStr);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(data);
  }

  function formatarDiaSemana(dataISO: string): string {
    const dataStr = dataISO.includes("T") ? dataISO : dataISO + "T00:00:00";
    return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(
      new Date(dataStr)
    );
  }

  function handleCalendario(h: ScheduleEntry, tipo: "google" | "ics") {
    if (tipo === "google") {
      window.open(gerarLinkGoogleCalendarDeSchedule(h, artistaNome), "_blank");
    } else {
      const ics = gerarICSDeSchedule(h, artistaNome, artistaEmail);
      baixarICS(
        ics,
        `agendamento-${h.date.split("T")[0]}-${h.startTime}.ics`
      );
    }
  }

  if (horarios.length === 0) {
    return (
      <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <CardContent className="py-8 text-center text-[color:var(--muted)]">
          Nenhum horário encontrado
        </CardContent>
      </Card>
    );
  }

  const horariosPorDia = horarios.reduce(
    (acc, h) => {
      const data = h.date.split("T")[0];
      if (!acc[data]) acc[data] = [];
      acc[data].push(h);
      return acc;
    },
    {} as Record<string, ScheduleEntry[]>
  );

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(horariosPorDia).map(([data, horariosNoDia]) => (
        <div key={data} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3 border-b border-[color:var(--border)] pb-2">
            <h3 className="font-display text-lg font-bold">
              {formatarData(data)}
            </h3>
            <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
              {formatarDiaSemana(data)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {horariosNoDia.map((h) => (
              <Card
                key={h._id || h.id}
                className="border border-[color:var(--border)] bg-[color:var(--surface)]"
              >
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <Clock
                        size={16}
                        className="text-[color:var(--muted)]"
                      />
                      <span>{h.startTime || "00:00"}</span>
                      <span className="text-[color:var(--muted)]">→</span>
                      <span>{h.endTime || "00:00"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[h.status] || ""}`}
                      >
                        {STATUS_LABELS[h.status] || h.status}
                      </span>
                      {h.notes && (
                        <span className="text-xs text-[color:var(--muted)]">
                          {h.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {modo === "artista" && (
                      <>
                        {podeCancelar && h.status === "booked" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => onCancelar?.(h._id || h.id!)}
                          >
                            Cancelar
                          </Button>
                        )}
                        {podeDeletar && h.status === "available" && (
                          <Button
                            variant="danger-soft"
                            size="sm"
                            onPress={() => onDeletar?.(h._id || h.id!)}
                          >
                            <Trash2 size={14} className="mr-1" />
                            Deletar
                          </Button>
                        )}
                      </>
                    )}
                    {modo === "cliente" && (
                      <>
                        {h.status === "available" && onReservar && (
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={() => onReservar(h._id || h.id!)}
                            className="bg-gradient-brand text-white"
                          >
                            Reservar
                          </Button>
                        )}
                        {h.status === "booked" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => handleCalendario(h, "google")}
                            >
                              <Calendar size={14} className="mr-1" />
                              Google
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onPress={() => handleCalendario(h, "ics")}
                            >
                              <Download size={14} className="mr-1" />
                              .ics
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
