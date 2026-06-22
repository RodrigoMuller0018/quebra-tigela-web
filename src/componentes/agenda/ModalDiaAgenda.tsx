import { useMemo } from "react";
import { Button, Card, CardContent } from "@heroui/react";
import { Clock, Plus, Trash2, X as XIcon } from "lucide-react";
import type { ItemAgenda } from "../../tipos/schedule";
import {
  NOMES_MESES,
  NOMES_DIAS_SEMANA,
  STATUS_LABELS,
} from "../../constantes/agenda";
import { dateParaString } from "../../utilitarios/dataUtils";
import {
  ehMesmoDiaLocal,
  formatarHoraLocal,
  formatarInstant,
} from "../../utilitarios/instants";
import { Dialogo } from "../ui/Dialogo";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  dia: Date | null;
  horarios: ItemAgenda[];
  podeCancelar?: boolean;
  podeDeletar?: boolean;
  onCancelar?: (id: string) => void;
  onDeletar?: (id: string) => void;
  onAdicionarHorario?: (dia: Date) => void;
  modo?: "artista" | "cliente";
}

const STATUS_TONE: Record<string, string> = {
  disponivel: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  pendente: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  reservada: "bg-[color:var(--secondary)]/15 text-[color:var(--secondary)]",
  cancelada: "bg-[color:var(--muted)]/15 text-[color:var(--muted)]",
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
    return horarios.filter((h) => {
      const start = new Date(h.inicio);
      const y = start.getFullYear();
      const m = String(start.getMonth() + 1).padStart(2, "0");
      const d = String(start.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}` === chave;
    });
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
                    <div className="flex flex-col gap-1 font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock
                          size={16}
                          className="text-[color:var(--muted)]"
                        />
                        {ehMesmoDiaLocal(h.inicio, h.fim) ? (
                          <>
                            <span>{formatarHoraLocal(h.inicio)}</span>
                            <span className="text-[color:var(--muted)]">→</span>
                            <span>{formatarHoraLocal(h.fim)}</span>
                          </>
                        ) : (
                          <span className="text-sm">
                            {formatarInstant(h.inicio)}{" "}
                            <span className="text-[color:var(--muted)]">→</span>{" "}
                            {formatarInstant(h.fim)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[h.status] || ""}`}
                    >
                      {STATUS_LABELS[h.status] || h.status}
                    </span>
                    <p className="text-xs text-[color:var(--muted)]">
                      {h.observacoes || "Sem observações"}
                    </p>
                  </div>
                  {modo === "artista" && (
                    <div className="flex shrink-0 gap-1">
                      {podeCancelar && h.status === "reservada" && onCancelar && (
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
                      {podeDeletar && h.status === "disponivel" && onDeletar && (
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
