import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import type { NovoItemAgenda } from "../../tipos/schedule";
import { Caixa } from "../ui/Campo";
import { composeInstant, formatarRangeAdaptativo } from "../../utilitarios/instants";

interface Props {
  diaInicial?: Date;
  onSubmit: (horarios: NovoItemAgenda[]) => Promise<void>;
  onCancelar?: () => void;
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30";
const INPUT_CLASS =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30";

function dateToInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function FormularioHorario({
  diaInicial,
  onSubmit,
  onCancelar,
}: Props) {
  const agora = new Date();
  const dataMinima = dateToInput(agora);
  const hoje = diaInicial && diaInicial >= agora ? diaInicial : agora;
  const dataInicial = dateToInput(hoje);

  const [dataInicio, setDataInicio] = useState(dataInicial);
  const [dataFim, setDataFim] = useState(dataInicial);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("10:00");
  const [multiDia, setMultiDia] = useState(false);
  const [intervalo, setIntervalo] = useState(60);
  const [modoLote, setModoLote] = useState(false);
  const [notas, setNotas] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Quando desliga multi-dia, sincroniza dataFim com dataInicio
  function handleToggleMultiDia(checked: boolean) {
    setMultiDia(checked);
    if (!checked) setDataFim(dataInicio);
  }
  function handleDataInicioChange(novaData: string) {
    setDataInicio(novaData);
    if (!multiDia) setDataFim(novaData);
  }

  function gerarUm(): NovoItemAgenda {
    return {
      inicio: composeInstant(dataInicio, horaInicio),
      fim: composeInstant(multiDia ? dataFim : dataInicio, horaFim),
      status: "disponivel",
      observacoes: notas || undefined,
    };
  }

  function gerarHorariosEmLote(): NovoItemAgenda[] {
    // Modo lote só faz sentido com mesmo dia
    const horarios: NovoItemAgenda[] = [];
    const [hi, mi] = horaInicio.split(":").map(Number);
    const [hf, mf] = horaFim.split(":").map(Number);
    let atual = hi * 60 + mi;
    const final = hf * 60 + mf;
    while (atual + intervalo <= final) {
      const inicioHHmm = `${String(Math.floor(atual / 60)).padStart(2, "0")}:${String(atual % 60).padStart(2, "0")}`;
      const fimMinutos = atual + intervalo;
      const fimHHmm = `${String(Math.floor(fimMinutos / 60)).padStart(2, "0")}:${String(fimMinutos % 60).padStart(2, "0")}`;
      horarios.push({
        inicio: composeInstant(dataInicio, inicioHHmm),
        fim: composeInstant(dataInicio, fimHHmm),
        status: "disponivel",
        observacoes: notas || undefined,
      });
      atual += intervalo;
    }
    return horarios;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (modoLote) {
        await onSubmit(gerarHorariosEmLote());
      } else {
        await onSubmit([gerarUm()]);
      }
      setHoraInicio("09:00");
      setHoraFim("10:00");
      setNotas("");
    } finally {
      setSalvando(false);
    }
  }

  const horariosGerados = useMemo(
    () => (modoLote ? gerarHorariosEmLote() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modoLote, dataInicio, horaInicio, horaFim, intervalo],
  );

  const previewSingle = !modoLote
    ? (() => {
        try {
          return formatarRangeAdaptativo(
            composeInstant(dataInicio, horaInicio),
            composeInstant(multiDia ? dataFim : dataInicio, horaFim),
          );
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="data-h" className="text-sm font-medium">
          Data {multiDia ? "de início" : ""}{" "}
          <span className="text-danger">*</span>
        </label>
        <input
          id="data-h"
          type="date"
          className={INPUT_CLASS}
          value={dataInicio}
          onChange={(e) => handleDataInicioChange(e.target.value)}
          required
          min={dataMinima}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hi" className="text-sm font-medium">
            Hora início <span className="text-danger">*</span>
          </label>
          <input
            id="hi"
            type="time"
            className={INPUT_CLASS}
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hf" className="text-sm font-medium">
            Hora fim <span className="text-danger">*</span>
          </label>
          <input
            id="hf"
            type="time"
            className={INPUT_CLASS}
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            required
          />
        </div>
      </div>

      {!modoLote && (
        <Caixa isSelected={multiDia} onChange={handleToggleMultiDia}>
          Termina em outro dia (ex: show das 22h até 02h da madrugada)
        </Caixa>
      )}

      {multiDia && !modoLote && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="df" className="text-sm font-medium">
            Data de fim <span className="text-danger">*</span>
          </label>
          <input
            id="df"
            type="date"
            className={INPUT_CLASS}
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
            min={dataInicio}
          />
        </div>
      )}

      {!modoLote && previewSingle && (
        <p className="text-xs text-[color:var(--muted)]">
          Preview: <span className="font-medium">{previewSingle}</span>
        </p>
      )}

      <Caixa isSelected={modoLote} onChange={setModoLote}>
        Criar múltiplos horários (modo lote — mesmo dia)
      </Caixa>

      {modoLote && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="intv" className="text-sm font-medium">
              Intervalo
            </label>
            <div className="relative">
              <select
                id="intv"
                className={SELECT_CLASS}
                value={intervalo}
                onChange={(e) => setIntervalo(Number(e.target.value))}
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
                ▼
              </span>
            </div>
          </div>

          {horariosGerados.length > 0 && (
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] p-3">
              <p className="mb-2 text-sm font-bold">
                Serão criados {horariosGerados.length} horários:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {horariosGerados.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[color:var(--accent)]/10 px-2 py-1 text-xs text-[color:var(--accent)]"
                  >
                    {formatarRangeAdaptativo(h.inicio, h.fim)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notas" className="text-sm font-medium">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          className={INPUT_CLASS}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Informações adicionais..."
          rows={3}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="submit"
          variant="primary"
          isDisabled={salvando}
          className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
        >
          {salvando
            ? "Salvando..."
            : modoLote
              ? `Criar ${horariosGerados.length} horários`
              : "Criar horário"}
        </Button>
        {onCancelar && (
          <Button type="button" variant="ghost" onPress={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
