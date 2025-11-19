import { useState } from "react";
import { Botao } from "../ui";
import type { NovoScheduleEntry } from "../../tipos/schedule";

interface Props {
  diaInicial?: Date;
  onSubmit: (horarios: NovoScheduleEntry[]) => Promise<void>;
  onCancelar?: () => void;
}

export function FormularioHorario({ diaInicial, onSubmit, onCancelar }: Props) {
  // Data mínima é sempre hoje (não permite datas passadas)
  const agora = new Date();
  const dataMinima = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;

  // Data inicial pode ser a sugerida OU hoje (o que for maior)
  const hoje = diaInicial && diaInicial >= agora ? diaInicial : agora;
  const dataFormatada = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const [data, setData] = useState(dataFormatada);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("10:00");
  const [intervalo, setIntervalo] = useState(60); // minutos
  const [modoLote, setModoLote] = useState(false);
  const [notas, setNotas] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    try {
      if (modoLote) {
        // Criar múltiplos horários baseado no intervalo
        const horarios = gerarHorariosEmLote();
        await onSubmit(horarios);
      } else {
        // Criar apenas um horário
        await onSubmit([
          {
            date: data, // YYYY-MM-DD format
            startTime: horaInicio,
            endTime: horaFim,
            status: "available",
            notes: notas || undefined,
          },
        ]);
      }

      // Resetar formulário
      setHoraInicio("09:00");
      setHoraFim("10:00");
      setNotas("");
    } catch (error) {
      console.error("Erro ao criar horário:", error);
    } finally {
      setSalvando(false);
    }
  }

  function gerarHorariosEmLote(): NovoScheduleEntry[] {
    const horarios: NovoScheduleEntry[] = [];
    const [horaInicioH, horaInicioM] = horaInicio.split(":").map(Number);
    const [horaFimH, horaFimM] = horaFim.split(":").map(Number);

    let minutoAtual = horaInicioH * 60 + horaInicioM;
    const minutoFinal = horaFimH * 60 + horaFimM;

    while (minutoAtual + intervalo <= minutoFinal) {
      const inicio = `${String(Math.floor(minutoAtual / 60)).padStart(2, "0")}:${String(minutoAtual % 60).padStart(2, "0")}`;
      const fim = `${String(Math.floor((minutoAtual + intervalo) / 60)).padStart(2, "0")}:${String((minutoAtual + intervalo) % 60).padStart(2, "0")}`;

      horarios.push({
        date: data, // YYYY-MM-DD format
        startTime: inicio,
        endTime: fim,
        status: "available",
        notes: notas || undefined,
      });

      minutoAtual += intervalo;
    }

    return horarios;
  }

  const horariosGerados = modoLote ? gerarHorariosEmLote() : [];

  return (
    <form onSubmit={handleSubmit} className="formulario-horario">
      <div className="form-field">
        <label htmlFor="data-horario" className="form-label">Data *</label>
        <input
          id="data-horario"
          type="date"
          className="form-input"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          min={dataMinima}
        />
      </div>

      <div className="formulario-horario-row">
        <div className="form-field">
          <label htmlFor="hora-inicio" className="form-label">Hora Início *</label>
          <input
            id="hora-inicio"
            type="time"
            className="form-input"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="hora-fim" className="form-label">Hora Fim *</label>
          <input
            id="hora-fim"
            type="time"
            className="form-input"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={modoLote}
            onChange={(e) => setModoLote(e.target.checked)}
          />
          <span>Criar múltiplos horários (modo lote)</span>
        </label>
      </div>

      {modoLote && (
        <>
          <div className="form-field">
            <label htmlFor="intervalo" className="form-label">Intervalo (minutos)</label>
            <select
              id="intervalo"
              className="form-select"
              value={intervalo}
              onChange={(e) => setIntervalo(Number(e.target.value))}
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h 30min</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          {horariosGerados.length > 0 && (
            <div className="preview-horarios">
              <p className="preview-titulo">Serão criados {horariosGerados.length} horários:</p>
              <div className="preview-lista">
                {horariosGerados.map((h, i) => (
                  <span key={i} className="preview-item">
                    {h.startTime} - {h.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="form-field">
        <label htmlFor="notas" className="form-label">Notas (opcional)</label>
        <textarea
          id="notas"
          className="form-textarea"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Informações adicionais sobre este horário..."
          rows={3}
        />
      </div>

      <div className="formulario-horario-acoes">
        <Botao type="submit" variante="primaria" disabled={salvando}>
          {salvando ? "Salvando..." : modoLote ? `Criar ${horariosGerados.length} horários` : "Criar horário"}
        </Botao>
        {onCancelar && (
          <Botao type="button" variante="fantasma" onClick={onCancelar}>
            Cancelar
          </Botao>
        )}
      </div>

      <style>{`
        .formulario-horario {
          display: flex;
          flex-direction: column;
          gap: var(--space-md, 1rem);
        }

        /* Campo de formulário */
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Label */
        .form-label {
          color: var(--text-secondary, #6b7280);
          font-size: var(--fs-sm, 0.875rem);
          font-weight: 500;
          margin: 0;
        }

        /* Input estilizado (date, time, text) */
        .form-input {
          background: var(--bg, #ffffff);
          border: 2px solid var(--border, #e5e7eb);
          color: var(--text, #1f2937);
          padding: 0.75rem;
          border-radius: var(--radius-md, 8px);
          outline: 0;
          font-size: var(--fs-base, 1rem);
          font-family: inherit;
          transition: all 0.2s ease;
          width: 100%;
        }

        .form-input:focus {
          border-color: var(--border-focus, #4ecdc4);
          box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--bg-tertiary, #f9fafb);
        }

        /* Select estilizado */
        .form-select {
          background: var(--bg, #ffffff);
          border: 2px solid var(--border, #e5e7eb);
          color: var(--text, #1f2937);
          padding: 0.75rem;
          border-radius: var(--radius-md, 8px);
          outline: 0;
          font-size: var(--fs-base, 1rem);
          font-family: inherit;
          transition: all 0.2s ease;
          width: 100%;
          cursor: pointer;
        }

        .form-select:focus {
          border-color: var(--border-focus, #4ecdc4);
          box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
        }

        /* Textarea estilizado */
        .form-textarea {
          background: var(--bg, #ffffff);
          border: 2px solid var(--border, #e5e7eb);
          color: var(--text, #1f2937);
          padding: 0.75rem;
          border-radius: var(--radius-md, 8px);
          outline: 0;
          font-size: var(--fs-base, 1rem);
          font-family: inherit;
          transition: all 0.2s ease;
          width: 100%;
          resize: vertical;
          min-height: 80px;
        }

        .form-textarea:focus {
          border-color: var(--border-focus, #4ecdc4);
          box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
        }

        .form-textarea::placeholder {
          color: var(--text-light, #9ca3af);
        }

        /* Checkbox */
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: var(--fs-base, 1rem);
          color: var(--text, #1f2937);
          margin: 0;
        }

        .form-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          cursor: pointer;
          accent-color: var(--primary, #4ecdc4);
        }

        .formulario-horario-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-sm, 0.75rem);
        }

        .formulario-horario-acoes {
          display: flex;
          gap: var(--space-sm, 0.75rem);
          margin-top: var(--space-sm, 0.75rem);
        }

        .preview-horarios {
          background: var(--background-secondary, #f8f9fa);
          padding: var(--space-sm, 0.75rem);
          border-radius: var(--radius-sm, 6px);
          border: 1px solid var(--border, #e5e7eb);
        }

        .preview-titulo {
          font-weight: 600;
          margin-bottom: var(--space-xs, 0.5rem);
          font-size: var(--fs-sm, 0.875rem);
          margin-top: 0;
        }

        .preview-lista {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2xs, 0.375rem);
        }

        .preview-item {
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm, 6px);
          font-size: var(--fs-xs, 0.75rem);
          border: 1px solid var(--border, #e5e7eb);
        }

        @media (max-width: 47.99em) {
          .formulario-horario-row {
            grid-template-columns: 1fr;
          }

          .formulario-horario-acoes {
            flex-direction: column;
          }

          .formulario-horario-acoes button {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
}
