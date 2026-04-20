import { useState } from "react";
import { Button } from "@heroui/react";
import type { NovoScheduleEntry } from "../../tipos/schedule";
import { Caixa } from "../ui/Campo";

interface Props {
  diaInicial?: Date;
  onSubmit: (horarios: NovoScheduleEntry[]) => Promise<void>;
  onCancelar?: () => void;
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30";
const INPUT_CLASS =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30";

export function FormularioHorario({
  diaInicial,
  onSubmit,
  onCancelar,
}: Props) {
  const agora = new Date();
  const dataMinima = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  const hoje = diaInicial && diaInicial >= agora ? diaInicial : agora;
  const dataInicial = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const [data, setData] = useState(dataInicial);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("10:00");
  const [intervalo, setIntervalo] = useState(60);
  const [modoLote, setModoLote] = useState(false);
  const [notas, setNotas] = useState("");
  const [salvando, setSalvando] = useState(false);

  function gerarHorariosEmLote(): NovoScheduleEntry[] {
    const horarios: NovoScheduleEntry[] = [];
    const [hi, mi] = horaInicio.split(":").map(Number);
    const [hf, mf] = horaFim.split(":").map(Number);
    let atual = hi * 60 + mi;
    const final = hf * 60 + mf;
    while (atual + intervalo <= final) {
      const inicio = `${String(Math.floor(atual / 60)).padStart(2, "0")}:${String(atual % 60).padStart(2, "0")}`;
      const fim = `${String(Math.floor((atual + intervalo) / 60)).padStart(2, "0")}:${String((atual + intervalo) % 60).padStart(2, "0")}`;
      horarios.push({
        date: data,
        startTime: inicio,
        endTime: fim,
        status: "available",
        notes: notas || undefined,
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
        await onSubmit([
          {
            date: data,
            startTime: horaInicio,
            endTime: horaFim,
            status: "available",
            notes: notas || undefined,
          },
        ]);
      }
      setHoraInicio("09:00");
      setHoraFim("10:00");
      setNotas("");
    } finally {
      setSalvando(false);
    }
  }

  const horariosGerados = modoLote ? gerarHorariosEmLote() : [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="data-h" className="text-sm font-medium">
          Data <span className="text-[color:var(--accent)]">*</span>
        </label>
        <input
          id="data-h"
          type="date"
          className={INPUT_CLASS}
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          min={dataMinima}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hi" className="text-sm font-medium">
            Hora início *
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
            Hora fim *
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

      <Caixa isSelected={modoLote} onChange={setModoLote}>
        Criar múltiplos horários (modo lote)
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
                    {h.startTime}–{h.endTime}
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
