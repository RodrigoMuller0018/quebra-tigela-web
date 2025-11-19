import { useState, useEffect } from "react";
import { CalendarioAgenda, ListaHorarios } from "./";
import { Botao, Modal } from "../ui";
import type { ScheduleEntry } from "../../tipos/schedule";
import { obterHorariosDisponiveis, reservarHorario } from "../../api/schedule.api";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";

interface Props {
  artistaId: string;
  artistaNome: string;
  artistaEmail?: string;
}

/**
 * Componente para clientes visualizarem e reservarem horários de um artista
 */
export function AgendaCliente({ artistaId, artistaNome, artistaEmail }: Props) {
  const [horarios, setHorarios] = useState<ScheduleEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalReserva, setModalReserva] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState<ScheduleEntry | null>(null);
  const [notas, setNotas] = useState("");
  const [reservando, setReservando] = useState(false);

  async function carregarHorarios() {
    setCarregando(true);
    try {
      // Buscar próximos 2 meses de horários disponíveis
      const hoje = new Date();
      const doisMesesDepois = new Date();
      doisMesesDepois.setMonth(doisMesesDepois.getMonth() + 2);

      const dados = await obterHorariosDisponiveis(
        artistaId,
        hoje.toISOString().split("T")[0],
        doisMesesDepois.toISOString().split("T")[0]
      );

      setHorarios(dados);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar horários");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (artistaId) {
      carregarHorarios();
    }
  }, [artistaId]);

  async function handleReservar(horarioId: string) {
    const horario = horarios.find((h) => (h._id || h.id) === horarioId);
    if (!horario) return;

    setHorarioSelecionado(horario);
    setModalReserva(true);
  }

  async function confirmarReserva() {
    if (!horarioSelecionado) return;

    setReservando(true);
    try {
      await reservarHorario(horarioSelecionado._id || horarioSelecionado.id!, {
        notes: notas || undefined,
      });

      avisoSucesso("Horário reservado com sucesso!");
      setModalReserva(false);
      setHorarioSelecionado(null);
      setNotas("");
      carregarHorarios();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao reservar horário");
    } finally {
      setReservando(false);
    }
  }

  function formatarData(dataISO: string): string {
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(data);
  }

  if (carregando) {
    return <div className="text-center">Carregando horários disponíveis...</div>;
  }

  if (horarios.length === 0) {
    return (
      <div className="agenda-cliente-vazia">
        <p>Este artista não possui horários disponíveis no momento.</p>
        <p className="text-secondary">Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="agenda-cliente">
      <div className="agenda-cliente-header">
        <h3>Horários Disponíveis</h3>
        <p className="text-secondary">{horarios.length} horários disponíveis</p>
      </div>

      <CalendarioAgenda horarios={horarios} />

      <div className="agenda-cliente-lista">
        <ListaHorarios
          horarios={horarios}
          artistaNome={artistaNome}
          artistaEmail={artistaEmail}
          modo="cliente"
          onReservar={handleReservar}
        />
      </div>

      {/* Modal de confirmação de reserva */}
      <Modal
        aberto={modalReserva}
        aoFechar={() => setModalReserva(false)}
        titulo="Confirmar Reserva"
      >
        {horarioSelecionado && (
          <div className="modal-reserva-conteudo">
            <div className="reserva-info">
              <h4>Detalhes da Reserva</h4>
              <p>
                <strong>Artista:</strong> {artistaNome}
              </p>
              <p>
                <strong>Data:</strong> {formatarData(horarioSelecionado.date)}
              </p>
              <p>
                <strong>Horário:</strong> {horarioSelecionado.startTime} -{" "}
                {horarioSelecionado.endTime}
              </p>
            </div>

            <div className="field">
              <label htmlFor="notas-reserva">Observações (opcional)</label>
              <textarea
                id="notas-reserva"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ex: Gostaria de discutir um projeto de pintura mural..."
                rows={4}
              />
            </div>

            <div className="modal-reserva-acoes">
              <Botao
                variante="primaria"
                onClick={confirmarReserva}
                disabled={reservando}
              >
                {reservando ? "Reservando..." : "Confirmar Reserva"}
              </Botao>
              <Botao
                variante="fantasma"
                onClick={() => setModalReserva(false)}
                disabled={reservando}
              >
                Cancelar
              </Botao>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .agenda-cliente {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .agenda-cliente-vazia {
          text-align: center;
          padding: var(--space-xl);
          background: var(--background-secondary, #f8f9fa);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .agenda-cliente-vazia p {
          margin: var(--space-xs) 0;
        }

        .agenda-cliente-header {
          text-align: center;
        }

        .agenda-cliente-header h3 {
          margin: 0;
          font-size: var(--fs-2xl);
          font-weight: 700;
        }

        .agenda-cliente-header p {
          margin: var(--space-2xs) 0 0;
          font-size: var(--fs-sm);
        }

        .modal-reserva-conteudo {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .reserva-info {
          background: var(--background-secondary, #f8f9fa);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }

        .reserva-info h4 {
          margin: 0 0 var(--space-sm);
          font-size: var(--fs-lg);
        }

        .reserva-info p {
          margin: var(--space-2xs) 0;
          font-size: var(--fs-base);
        }

        .modal-reserva-acoes {
          display: flex;
          gap: var(--space-sm);
        }

        @media (max-width: 47.99em) {
          .modal-reserva-acoes {
            flex-direction: column;
          }

          .modal-reserva-acoes button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
