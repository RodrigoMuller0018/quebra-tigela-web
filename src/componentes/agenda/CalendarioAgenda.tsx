import { useState, useMemo } from "react";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScheduleEntry } from "../../tipos/schedule";
import {
  NOMES_MESES_CAPITALIZADOS,
  NOMES_DIAS_SEMANA_ABREVIADOS,
} from "../../constantes/agenda";
import {
  ehMesmoDia,
  dateParaString,
  extrairData,
} from "../../utilitarios/dataUtils";

interface Props {
  horarios: ScheduleEntry[];
  mesAno?: Date;
  onDiaClick?: (dia: Date) => void;
  onHorarioClick?: (horario: ScheduleEntry) => void;
}

export function CalendarioAgenda({ horarios, mesAno, onDiaClick }: Props) {
  const [dataAtual, setDataAtual] = useState(mesAno || new Date());

  const diasDoMes = useMemo(() => {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diaSemanaInicio = primeiroDia.getDay();
    const totalDias = ultimoDia.getDate();
    const dias: (Date | null)[] = [];
    for (let i = 0; i < diaSemanaInicio; i++) dias.push(null);
    for (let dia = 1; dia <= totalDias; dia++)
      dias.push(new Date(ano, mes, dia));
    return dias;
  }, [dataAtual]);

  const horariosPorDia = useMemo(() => {
    const mapa = new Map<string, ScheduleEntry[]>();
    horarios.forEach((h) => {
      const chave = extrairData(h.date);
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave)!.push(h);
    });
    return mapa;
  }, [horarios]);

  function obterHorariosDoDia(dia: Date | null): ScheduleEntry[] {
    if (!dia) return [];
    return horariosPorDia.get(dateParaString(dia)) || [];
  }

  function ehHoje(dia: Date | null): boolean {
    return dia ? ehMesmoDia(dia, new Date()) : false;
  }

  const mesAnterior = () =>
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1));
  const proximoMes = () =>
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1));

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          isIconOnly
          onPress={mesAnterior}
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </Button>
        <h3 className="font-display text-xl font-bold text-gradient-brand">
          {NOMES_MESES_CAPITALIZADOS[dataAtual.getMonth()]}{" "}
          {dataAtual.getFullYear()}
        </h3>
        <Button
          variant="ghost"
          isIconOnly
          onPress={proximoMes}
          aria-label="Próximo mês"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
        {NOMES_DIAS_SEMANA_ABREVIADOS.map((nome) => (
          <div key={nome}>{nome}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {diasDoMes.map((dia, index) => {
          const horariosNoDia = obterHorariosDoDia(dia);
          const temHorarios = horariosNoDia.length > 0;
          const disponivel = horariosNoDia.some(
            (h) => h.status === "available"
          );
          const reservado = horariosNoDia.some((h) => h.status === "booked");
          const hoje = ehHoje(dia);

          if (!dia) {
            return <div key={index} className="aspect-square" />;
          }

          let classes =
            "relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg text-sm font-medium transition";

          if (hoje) {
            classes += " bg-gradient-brand text-white shadow-lg";
          } else if (disponivel) {
            classes +=
              " bg-[color:var(--accent)]/15 text-[color:var(--accent)] border border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/25";
          } else if (reservado) {
            classes +=
              " bg-[color:var(--secondary)]/15 text-[color:var(--secondary)] border border-[color:var(--secondary)]/40 hover:bg-[color:var(--secondary)]/25";
          } else {
            classes +=
              " text-[color:var(--foreground)] hover:bg-[color:var(--surface-secondary)]";
          }

          return (
            <div
              key={index}
              className={classes}
              onClick={() => onDiaClick?.(dia)}
            >
              <span>{dia.getDate()}</span>
              {temHorarios && (
                <span className="absolute bottom-1 rounded-full bg-current px-1.5 text-[10px] font-bold text-white opacity-80">
                  {horariosNoDia.length}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
