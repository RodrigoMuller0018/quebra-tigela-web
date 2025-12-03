import { useMemo } from "react";
import type { ScheduleEntry } from "../../tipos/schedule";
import { Modal } from "../ui";
import { NOMES_MESES, NOMES_DIAS_SEMANA, STATUS_LABELS, STATUS_BADGE_CLASSES } from "../../constantes/agenda";
import { dateParaString, extrairData } from "../../utilitarios/dataUtils";

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
  // Filtrar horários do dia específico
  const horariosDoDia = useMemo(() => {
    if (!dia) return [];

    const chaveDia = dateParaString(dia);

    return horarios.filter((horario) => {
      const dataHorario = extrairData(horario.date);
      return dataHorario === chaveDia;
    });
  }, [dia, horarios]);

  // Formatar título do modal
  const tituloModal = useMemo(() => {
    if (!dia) return "";

    return `${dia.getDate()} de ${NOMES_MESES[dia.getMonth()]} de ${dia.getFullYear()}`;
  }, [dia]);

  const diaSemana = useMemo(() => {
    if (!dia) return "";
    return NOMES_DIAS_SEMANA[dia.getDay()];
  }, [dia]);

  function obterStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  function obterStatusClass(status: string): string {
    return STATUS_BADGE_CLASSES[status] || "badge bg-secondary";
  }

  if (!dia) return null;

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={
        <div>
          <div className="text-light fw-semibold">{tituloModal}</div>
          <small className="text-secondary">{diaSemana}</small>
        </div>
      }
      tamanho="grande"
    >
      <div className="modal-dia-agenda">
        {/* Botão adicionar horário neste dia */}
        {modo === "artista" && onAdicionarHorario && (
          <div className="mb-4">
            <button
              type="button"
              className="btn btn-outline-primary w-100"
              onClick={() => {
                aoFechar();
                onAdicionarHorario(dia);
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Adicionar Horário neste Dia
            </button>
          </div>
        )}

        {/* Lista de agendamentos */}
        <div className="schedule-list">
          {horariosDoDia.length === 0 ? (
            <div className="text-center py-5" id="emptyState">
              <div className="display-1 text-secondary mb-3" style={{ fontSize: "4rem" }}>📅</div>
              <p className="text-secondary mb-0">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="schedule-items">
              {horariosDoDia.map((horario) => (
                <div key={horario._id || horario.id} className="schedule-item">
                  <div className="d-flex align-items-start gap-3">
                    {/* Indicador de horário */}
                    <div className="schedule-time">
                      <i className="bi bi-clock text-secondary me-2"></i>
                      <span className="text-light">{horario.startTime}</span>
                      <span className="text-secondary mx-1">até</span>
                      <span className="text-light">{horario.endTime}</span>
                    </div>

                    {/* Status e notas */}
                    <div className="grow">
                      <span className={obterStatusClass(horario.status)}>
                        {obterStatusLabel(horario.status)}
                      </span>
                      <p className="text-secondary small mb-0 mt-2">
                        {horario.notes || 'Sem observações'}
                      </p>
                    </div>

                    {/* Ações */}
                    {modo === "artista" && (
                      <div className="schedule-actions d-flex gap-2">
                        {podeCancelar && horario.status === "booked" && onCancelar && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            title="Cancelar"
                            onClick={() => onCancelar(horario._id || horario.id!)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                        {podeDeletar && horario.status === "available" && onDeletar && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Deletar"
                            onClick={() => onDeletar(horario._id || horario.id!)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modal-dia-agenda {
          padding: 0;
        }

        .schedule-list {
          max-height: 60vh;
          overflow-y: auto;
        }

        .schedule-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .schedule-item {
          background-color: var(--gray-850);
          border: 1px solid var(--gray-700);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.2s ease-in-out;
        }

        .schedule-item:hover {
          background-color: var(--gray-800);
          border-color: var(--gray-600);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .schedule-time {
          display: flex;
          align-items: center;
          white-space: nowrap;
          min-width: 200px;
          font-size: 0.9375rem;
        }

        .schedule-actions {
          flex-shrink: 0;
        }

        .badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
        }

        .badge.bg-success {
          background-color: rgba(76, 175, 80, 0.2) !important;
          color: var(--green-400) !important;
          border: 1px solid var(--green-700);
        }

        .badge.bg-warning {
          background-color: rgba(255, 152, 0, 0.2) !important;
          color: var(--amber-400) !important;
          border: 1px solid var(--amber-700);
        }

        .badge.bg-secondary {
          background-color: rgba(158, 158, 158, 0.2) !important;
          color: var(--gray-400) !important;
          border: 1px solid var(--gray-700);
        }

        #emptyState {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .schedule-time {
            flex-direction: column;
            align-items: flex-start;
            min-width: auto;
            font-size: 0.875rem;
          }

          .schedule-item {
            padding: 0.75rem;
          }

          .schedule-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Modal>
  );
}
