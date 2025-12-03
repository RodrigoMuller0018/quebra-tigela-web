import { useState, useMemo } from "react";
import type { ScheduleEntry } from "../../tipos/schedule";
import { NOMES_MESES_CAPITALIZADOS, NOMES_DIAS_SEMANA_ABREVIADOS } from "../../constantes/agenda";
import { ehMesmoDia, dateParaString, extrairData } from "../../utilitarios/dataUtils";
import "./CalendarioAgenda.css";

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

    // Primeiro e último dia do mês
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    // Dia da semana do primeiro dia (0 = domingo)
    const diaSemanaInicio = primeiroDia.getDay();

    // Total de dias no mês
    const totalDias = ultimoDia.getDate();

    // Criar array de dias (incluindo espaços vazios do início)
    const dias: (Date | null)[] = [];

    // Adicionar espaços vazios antes do primeiro dia
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    // Adicionar todos os dias do mês
    for (let dia = 1; dia <= totalDias; dia++) {
      dias.push(new Date(ano, mes, dia));
    }

    return dias;
  }, [dataAtual]);

  // Agrupar horários por dia
  const horariosPorDia = useMemo(() => {
    const mapa = new Map<string, ScheduleEntry[]>();

    horarios.forEach((horario) => {
      const chave = extrairData(horario.date);

      if (!mapa.has(chave)) {
        mapa.set(chave, []);
      }
      mapa.get(chave)!.push(horario);
    });

    return mapa;
  }, [horarios]);

  function obterHorariosDoDia(dia: Date | null): ScheduleEntry[] {
    if (!dia) return [];
    const chave = dateParaString(dia);
    return horariosPorDia.get(chave) || [];
  }

  function mesAnterior() {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1));
  }

  function proximoMes() {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1));
  }

  function ehHoje(dia: Date | null): boolean {
    if (!dia) return false;
    return ehMesmoDia(dia, new Date());
  }

  return (
    <div className="calendario-agenda">
      <div className="calendario-header">
        <button onClick={mesAnterior} className="btn btn-ghost btn-icon">
          ←
        </button>
        <h3 className="calendario-titulo">
          {NOMES_MESES_CAPITALIZADOS[dataAtual.getMonth()]} {dataAtual.getFullYear()}
        </h3>
        <button onClick={proximoMes} className="btn btn-ghost btn-icon">
          →
        </button>
      </div>

      <div className="calendario-dias-semana">
        {NOMES_DIAS_SEMANA_ABREVIADOS.map((nome, index) => (
          <div key={index}>{nome}</div>
        ))}
      </div>

      <div className="calendario-grid">
        {diasDoMes.map((dia, index) => {
          const horariosNoDia = obterHorariosDoDia(dia);
          const temHorarios = horariosNoDia.length > 0;
          const disponivel = horariosNoDia.some((h) => h.status === "available");
          const reservado = horariosNoDia.some((h) => h.status === "booked");

          return (
            <div
              key={index}
              className={`calendario-dia ${!dia ? "vazio" : ""} ${ehHoje(dia) ? "hoje" : ""} ${temHorarios ? "com-horarios" : ""} ${disponivel ? "disponivel" : ""} ${reservado ? "reservado" : ""}`}
              onClick={() => dia && onDiaClick?.(dia)}
            >
              {dia && (
                <>
                  <span className="calendario-dia-numero">{dia.getDate()}</span>
                  {temHorarios && (
                    <div className="calendario-indicadores">
                      <span className="calendario-contador">{horariosNoDia.length}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
