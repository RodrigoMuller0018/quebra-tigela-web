import { useMemo } from "react";
import { Button, Card, CardContent } from "@heroui/react";
import { Clock, Plus, Trash2, X as XIcon } from "lucide-react";
import type { ScheduleEntry } from "../../tipos/schedule";
import {
  NOMES_MESES,
  NOMES_DIAS_SEMANA,
  STATUS_LABELS,
} from "../../constantes/agenda";
import { dateParaString, extrairData } from "../../utilitarios/dataUtils";
import { Dialogo } from "../ui/Dialogo";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  dia: Date | null;
  horarios: ScheduleEntry[];
  podeCancelar?: boolean;
  podeDeletar?: boolean;
  onCancelar?: (id: string) => void;
  onDeletar?: (id: string) => void;
  onAdicionarHorario?: (dia: Date) => void;
  modo?: "artista" | "cliente";
}

const STATUS_TONE: Record<string, string> = {
  available: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  booked: "bg-[color:var(--secondary)]/15 text-[color:var(--secondary)]",
  cancelled: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
};

export function ModalDiaAgenda({
  aberto,
  aoFechar,
  dia,
  horarios,
  podeCancelar,
  podeDeletar,
  onCancelar,
  onDeletar,
  onAdicionarHorario,
  modo = "artista",
}: Props) {
  const horariosDoDia = useMemo(() => {
    if (!dia) return [];
    const chave = dateParaString(dia);
    return horarios.filter((h) => extrairData(h.date) === chave);
  }, [dia, horarios]);

  if (!dia) return null;

  const titulo = `${dia.getDate()} de ${NOMES_MESES[dia.getMonth()]} de ${dia.getFullYear()}`;
  const diaSemana = NOMES_DIAS_SEMANA[dia.getDay()];

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={() => aoFechar()}
      tamanho="lg"
      titulo={
        <div className="flex flex-col">
          <span className="font-display">{titulo}</span>
          <span className="text-xs font-normal text-[color:var(--muted)]">
            {diaSemana}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {modo === "artista" && onAdicionarHorario && (
          <Button
            variant="outline"
            fullWidth
            onPress={() => {
              aoFechar();
              onAdicionarHorario(dia);
            }}
          >
            <Plus size={16} className="mr-2" />
            Adicionar horário neste dia
          </Button>
        )}

        {horariosDoDia.length === 0 ? (
          <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-[color:var(--muted)]">
                Nenhum agendamento para este dia
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {horariosDoDia.map((h) => (
              <Card
                key={h._id || h.id}
                className="border border-[color:var(--border)] bg-[color:var(--surface-secondary)]"
              >
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock
                        size={16}
                        className="text-[color:var(--muted)]"
                      />
                      <span>{h.startTime}</span>
                      <span className="text-[color:var(--muted)]">→</span>
                      <span>{h.endTime}</span>
                    </div>
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[h.status] || ""}`}
                    >
                      {STATUS_LABELS[h.status] || h.status}
                    </span>
                    <p className="text-xs text-[color:var(--muted)]">
                      {h.notes || "Sem observações"}
                    </p>
                  </div>
                  {modo === "artista" && (
                    <div className="flex shrink-0 gap-1">
                      {podeCancelar && h.status === "booked" && onCancelar && (
                        <Button
                          variant="outline"
                          size="sm"
                          isIconOnly
                          onPress={() => onCancelar(h._id || h.id!)}
                          aria-label="Cancelar"
                        >
                          <XIcon size={14} />
                        </Button>
                      )}
                      {podeDeletar && h.status === "available" && onDeletar && (
                        <Button
                          variant="danger-soft"
                          size="sm"
                          isIconOnly
                          onPress={() => onDeletar(h._id || h.id!)}
                          aria-label="Deletar"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Dialogo>
  );
}
