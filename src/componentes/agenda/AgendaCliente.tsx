import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, Spinner } from "@heroui/react";
import { Calendar as CalendarIcon } from "lucide-react";
import { CalendarioAgenda } from "./";
import type { ItemAgenda } from "../../tipos/schedule";
import { obterHorariosDisponiveis } from "../../api/schedule.api";
import { erro as avisoErro } from "../../utilitarios/avisos";
import {
  dateParaString,
  ehMesmoDia,
} from "../../utilitarios/dataUtils";
import {
  formatarHoraLocal,
  formatarRangeAdaptativo,
} from "../../utilitarios/instants";
import {
  NOMES_MESES,
  NOMES_DIAS_SEMANA,
} from "../../constantes/agenda";
import { SolicitarServicoModal } from "../requests/SolicitarServicoModal";

interface Props {
  artistaId: string;
  artistaNome: string;
  artistaEmail?: string;
}

export function AgendaCliente({ artistaId, artistaNome }: Props) {
  const [horarios, setHorarios] = useState<ItemAgenda[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [modalReserva, setModalReserva] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState<ItemAgenda | null>(
    null,
  );

  async function carregarHorarios() {
    setCarregando(true);
    try {
      const hoje = new Date();
      const fim = new Date();
      fim.setMonth(fim.getMonth() + 2);
      const dados = await obterHorariosDisponiveis(
        artistaId,
        hoje.toISOString().split("T")[0],
        fim.toISOString().split("T")[0],
      );
      setHorarios(dados);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar horários");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (artistaId) carregarHorarios();
  }, [artistaId]);

  // Helper: dia local do inicio (slot multi-dia aparece no dia de início)
  function diaLocalDoSlot(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Auto-seleciona o primeiro dia que tem slot disponível
  useEffect(() => {
    if (diaSelecionado || horarios.length === 0) return;
    const primeiroDia = [...horarios]
      .map((h) => diaLocalDoSlot(h.inicio))
      .sort()[0];
    if (primeiroDia) {
      const [y, m, d] = primeiroDia.split("-").map(Number);
      setDiaSelecionado(new Date(y, m - 1, d));
    }
  }, [horarios, diaSelecionado]);

  const slotsDoDia = useMemo(() => {
    if (!diaSelecionado) return [];
    const chave = dateParaString(diaSelecionado);
    return horarios
      .filter((h) => diaLocalDoSlot(h.inicio) === chave)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }, [diaSelecionado, horarios]);

  function abrirReserva(slot: ItemAgenda) {
    setSlotSelecionado(slot);
    setModalReserva(true);
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-8">
        <Spinner color="accent" />
      </div>
    );
  }

  if (horarios.length === 0) {
    return (
      <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm">
            Este artista não possui horários disponíveis no momento.
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h3 className="font-display text-xl font-bold">Horários disponíveis</h3>
        <p className="text-xs text-[color:var(--muted)]">
          Escolha um dia no calendário pra ver os horários
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,480px)_1fr]">
        {/* Calendário (capado em 480px mesmo em telas largas) */}
        <div className="mx-auto w-full max-w-[480px] lg:mx-0">
          <CalendarioAgenda
            horarios={horarios}
            diaSelecionado={diaSelecionado}
            onDiaClick={setDiaSelecionado}
          />
        </div>

        {/* Painel de slots do dia selecionado */}
        <div>
          {diaSelecionado ? (
            <CardSlotsDoDia
              dia={diaSelecionado}
              slots={slotsDoDia}
              onReservar={abrirReserva}
            />
          ) : (
            <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
              <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                <CalendarIcon
                  size={32}
                  className="text-[color:var(--muted)]"
                />
                <p className="text-sm text-[color:var(--muted)]">
                  Selecione uma data no calendário ao lado
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SolicitarServicoModal
        aberto={modalReserva}
        aoFechar={(open) => {
          setModalReserva(open);
          if (!open) setSlotSelecionado(null);
        }}
        artistaId={artistaId}
        artistaNome={artistaNome}
        slot={slotSelecionado}
        onSucesso={() => {
          setSlotSelecionado(null);
          carregarHorarios();
        }}
      />
    </div>
  );
}

interface CardSlotsDoDiaProps {
  dia: Date;
  slots: ItemAgenda[];
  onReservar: (slot: ItemAgenda) => void;
}

type Periodo = "manha" | "tarde" | "noite";

const PERIODO_LABEL: Record<Periodo, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

function classificarPeriodo(inicio: string): Periodo {
  const h = new Date(inicio).getHours();
  if (h < 12) return "manha";
  if (h < 18) return "tarde";
  return "noite";
}

function CardSlotsDoDia({ dia, slots, onReservar }: CardSlotsDoDiaProps) {
  const hojeMesmoDia = ehMesmoDia(dia, new Date());
  const titulo = `${dia.getDate()} de ${NOMES_MESES[dia.getMonth()]}`;
  const subtitulo = hojeMesmoDia ? "Hoje" : NOMES_DIAS_SEMANA[dia.getDay()];
  const disponiveis = slots.filter((s) => s.status === "disponivel");

  const porPeriodo: Record<Periodo, ItemAgenda[]> = {
    manha: [],
    tarde: [],
    noite: [],
  };
  for (const s of disponiveis) {
    porPeriodo[classificarPeriodo(s.inicio)].push(s);
  }

  const ordemPeriodos: Periodo[] = ["manha", "tarde", "noite"];

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h4 className="font-display text-lg font-bold">{titulo}</h4>
            <p className="text-xs text-[color:var(--muted)]">{subtitulo}</p>
          </div>
          <span className="text-xs text-[color:var(--muted)]">
            {disponiveis.length}{" "}
            {disponiveis.length === 1 ? "horário" : "horários"}
          </span>
        </div>

        {disponiveis.length === 0 ? (
          <p className="py-6 text-center text-sm text-[color:var(--muted)]">
            Nenhum horário disponível neste dia
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {ordemPeriodos.map((p) => {
              const items = porPeriodo[p];
              if (items.length === 0) return null;
              return (
                <div key={p} className="flex flex-col gap-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                    {PERIODO_LABEL[p]}
                  </h5>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {items.map((s) => (
                      <button
                        key={s._id || s.id}
                        type="button"
                        onClick={() => onReservar(s)}
                        title={formatarRangeAdaptativo(
                          s.inicio,
                          s.fim,
                        )}
                        className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] py-2.5 text-sm font-semibold transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)] active:scale-95"
                      >
                        {formatarHoraLocal(s.inicio)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
