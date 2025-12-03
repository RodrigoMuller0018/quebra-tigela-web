/**
 * PÁGINA: Agenda do Artista
 * Permite ao artista gerenciar sua disponibilidade e reservas
 */

import { useState } from "react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { CalendarioAgenda, FormularioHorario, ModalDiaAgenda } from "../../componentes/agenda";
import { Modal } from "../../componentes/ui";
import { Container } from "../../componentes/layout";
import type { NovoScheduleEntry } from "../../tipos/schedule";
import { useAgenda } from "../../hooks/useAgenda";

/**
 * Componente da página de Agenda do Artista
 *
 * @description
 * Exibe um calendário interativo onde o artista pode:
 * - Ver todos os seus horários disponíveis e reservados
 * - Adicionar novos horários de disponibilidade
 * - Cancelar horários reservados
 * - Deletar horários disponíveis
 * - Visualizar detalhes de agendamentos por dia
 */
export default function AgendaArtistaPagina() {
  const { usuario } = useAutenticacao();

  // Gerenciamento de modais
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [modalDiaAberto, setModalDiaAberto] = useState(false);
  const [diaSelectado, setDiaSelectado] = useState<Date | null>(null);

  // Hook customizado que encapsula toda a lógica da agenda
  const {
    horarios,
    carregando,
    salvando,
    criar,
    cancelar,
    deletar,
  } = useAgenda({
    artistId: usuario?.sub,
    autoLoad: true,
  });

  /**
   * Handler para criar novos horários
   * Fecha o modal após sucesso
   */
  async function handleCriarHorarios(novosHorarios: NovoScheduleEntry[]) {
    await criar(novosHorarios);
    setModalAdicionarAberto(false);
    setDiaSelectado(null);
  }

  /**
   * Handler para abrir modal do dia ao clicar no calendário
   */
  function handleDiaClick(dia: Date) {
    setDiaSelectado(dia);
    setModalDiaAberto(true);
  }

  /**
   * Handler para adicionar horário em um dia específico
   * Fecha o modal do dia e abre o modal de adicionar
   */
  function handleAdicionarHorarioDia(dia: Date) {
    setDiaSelectado(dia);
    setModalAdicionarAberto(true);
  }

  return (
    <Container size="full">
      <div className="agenda-container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
          <div>
            <h1 className="h2 text-light mb-1">Minha Agenda</h1>
            <p className="text-secondary mb-0">Gerencie sua disponibilidade e reservas</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setDiaSelectado(null);
              setModalAdicionarAberto(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Adicionar Horário
          </button>
        </div>

        {/* Calendário Centralizado */}
        {carregando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-orange" role="status">
              <span className="visually-hidden">Carregando agenda...</span>
            </div>
            <p className="text-secondary mt-3">Carregando agenda...</p>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <CalendarioAgenda
                horarios={horarios}
                onDiaClick={handleDiaClick}
              />

              {/* Legenda */}
              <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="legend-indicator" style={{ background: 'linear-gradient(135deg, var(--orange-500, #FA8320) 0%, var(--orange-600, #E87316) 100%)' }}></span>
                  <small className="text-secondary">Dia atual</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="legend-indicator" style={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)', border: '1px solid var(--green-700, #047857)' }}></span>
                  <small className="text-secondary">Com agendamentos</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="legend-indicator" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid var(--cyan-700, #0e7490)' }}></span>
                  <small className="text-secondary">Disponível</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dia - Mostra agendamentos do dia */}
        <ModalDiaAgenda
          aberto={modalDiaAberto}
          aoFechar={() => {
            setModalDiaAberto(false);
            setDiaSelectado(null);
          }}
          dia={diaSelectado}
          horarios={horarios}
          podeCancelar
          podeDeletar
          onCancelar={cancelar}
          onDeletar={deletar}
          onAdicionarHorario={handleAdicionarHorarioDia}
          modo="artista"
        />

        {/* Modal Adicionar Horário */}
        <Modal
          aberto={modalAdicionarAberto}
          aoFechar={() => {
            setModalAdicionarAberto(false);
            setDiaSelectado(null);
          }}
          titulo="Adicionar Horário"
        >
          <FormularioHorario
            diaInicial={diaSelectado || undefined}
            onSubmit={handleCriarHorarios}
            onCancelar={() => {
              setModalAdicionarAberto(false);
              setDiaSelectado(null);
            }}
          />
        </Modal>
      </div>

      <style>{`
        .agenda-container {
          padding: 1.5rem;
        }

        .text-orange {
          color: var(--orange-500, #FA8320);
        }

        .legend-indicator {
          width: 20px;
          height: 20px;
          border-radius: 0.375rem;
          display: inline-block;
        }

        @media (max-width: 768px) {
          .agenda-container {
            padding: 1rem;
          }
        }
      `}</style>
    </Container>
  );
}
