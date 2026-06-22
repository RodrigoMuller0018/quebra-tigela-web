import { Button, Card, CardContent } from "@heroui/react";
import { Clock, Trash2, Calendar, Download } from "lucide-react";
import type { ItemAgenda } from "../../tipos/schedule";
import {
  gerarLinkGoogleCalendarDeSchedule,
  baixarICS,
  gerarICSDeSchedule,
} from "../../utilitarios/googleCalendar";
import { formatarRangeAdaptativo } from "../../utilitarios/instants";

interface Props {
  horarios: ItemAgenda[];
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
  disponivel: "Disponível",
  reservada: "Reservada",
  cancelada: "Cancelada",
};

const STATUS_TONE: Record<string, string> = {
  disponivel: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  reservada: "bg-[color:var(--secondary)]/15 text-[color:var(--secondary)]",
  cancelada: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
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
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(dataISO));
  }

  function formatarDiaSemana(dataISO: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      timeZone: "UTC",
    }).format(new Date(dataISO));
  }

  function handleCalendario(h: ItemAgenda, tipo: "google" | "ics") {
    if (tipo === "google") {
      window.open(gerarLinkGoogleCalendarDeSchedule(h, artistaNome), "_blank");
    } else {
      const ics = gerarICSDeSchedule(h, artistaNome, artistaEmail);
      const filename = `agendamento-${h.inicio.replace(/[:.]/g, "-")}.ics`;
      baixarICS(ics, filename);
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
      // Agrupa pelo dia LOCAL do inicio (eventos multi-dia agrupam no dia de início)
      const d = new Date(h.inicio);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const data = `${y}-${m}-${day}`;
      if (!acc[data]) acc[data] = [];
      acc[data].push(h);
      return acc;
    },
    {} as Record<string, ItemAgenda[]>
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
                      <span>
                        {formatarRangeAdaptativo(h.inicio, h.fim)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[h.status] || ""}`}
                      >
                        {STATUS_LABELS[h.status] || h.status}
                      </span>
                      {h.observacoes && (
                        <span className="text-xs text-[color:var(--muted)]">
                          {h.observacoes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {modo === "artista" && (
                      <>
                        {podeCancelar && h.status === "reservada" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => onCancelar?.(h._id || h.id!)}
                          >
                            Cancelar
                          </Button>
                        )}
                        {podeDeletar && h.status === "disponivel" && (
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
                        {h.status === "disponivel" && onReservar && (
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={() => onReservar(h._id || h.id!)}
                            className="bg-gradient-brand text-white"
                          >
                            Reservar
                          </Button>
                        )}
                        {h.status === "reservada" && (
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
