import { useState, useEffect } from "react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { CalendarioAgenda, ListaHorarios, FormularioHorario } from "../../componentes/agenda";
import { Botao, Modal } from "../../componentes/ui";
import { Container } from "../../componentes/layout";
import type { ScheduleEntry, NovoScheduleEntry } from "../../tipos/schedule";
import {
  listarHorarios,
  criarHorario,
  criarHorariosEmLote,
  cancelarHorario,
  deletarHorario,
} from "../../api/schedule.api";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";

export default function AgendaArtistaPagina() {
  const { usuario } = useAutenticacao();
  const [horarios, setHorarios] = useState<ScheduleEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [diaSelectado, setDiaSelectado] = useState<Date | undefined>();

  async function carregarHorarios() {
    if (!usuario?.sub) return;

    console.log("=== CARREGAR HORÁRIOS - INÍCIO ===");
    console.log("Artista ID:", usuario.sub);

    setCarregando(true);
    try {
      // Buscar TODOS os horários (incluindo passados para histórico)
      // Busca de 6 meses atrás até 6 meses no futuro
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
      const seisMesesDepois = new Date();
      seisMesesDepois.setMonth(seisMesesDepois.getMonth() + 6);

      const filtros = {
        artistId: usuario.sub,
        dateFrom: seisMesesAtras.toISOString().split("T")[0],
        dateTo: seisMesesDepois.toISOString().split("T")[0],
      };

      console.log("Filtros de busca:", filtros);

      const dados = await listarHorarios(filtros);

      console.log("Horários recebidos:", dados);
      console.log("Total de horários:", dados.length);

      // Log detalhado do primeiro horário para debug
      if (dados.length > 0) {
        console.log("PRIMEIRO HORÁRIO DETALHADO:");
        console.log("  - date:", dados[0].date);
        console.log("  - startTime:", dados[0].startTime);
        console.log("  - endTime:", dados[0].endTime);
        console.log("  - status:", dados[0].status);
        console.log("  - notes:", dados[0].notes);
      }

      setHorarios(dados);
    } catch (e: any) {
      console.error("Erro ao carregar horários:", e);
      avisoErro(e?.message ?? "Erro ao carregar horários");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHorarios();
  }, [usuario]);

  async function handleCriarHorarios(novosHorarios: NovoScheduleEntry[]) {
    if (!usuario?.sub) {
      avisoErro("Usuário não autenticado");
      return;
    }

    console.log("=== CRIAR HORÁRIOS - INÍCIO ===");
    console.log("1. Usuário ID:", usuario.sub);
    console.log("2. Horários recebidos do formulário:", novosHorarios);

    try {
      // Adicionar artistId a todos os horários
      const horariosComArtista = novosHorarios.map(h => ({
        ...h,
        artistId: usuario.sub
      }));

      console.log("3. Horários com artistId adicionado:", horariosComArtista);

      if (horariosComArtista.length === 1) {
        console.log("4. Criando horário ÚNICO:", horariosComArtista[0]);
        await criarHorario(horariosComArtista[0] as any);
      } else {
        console.log("4. Criando horários EM LOTE:", horariosComArtista);
        await criarHorariosEmLote(horariosComArtista as any);
      }

      console.log("6. Recarregando horários ANTES de fechar modal...");
      await carregarHorarios();
      console.log("7. Horários recarregados, fechando modal...");
      setModalAberto(false);
    } catch (e: any) {
      console.error("=== ERRO AO CRIAR HORÁRIOS ===");
      console.error("Erro completo:", e);
      console.error("Mensagem:", e?.message);
      console.error("Response:", e?.response);
      console.error("Response data:", e?.response?.data);
      console.error("Status:", e?.response?.status);
      avisoErro(e?.message ?? "Erro ao criar horário");
      throw e;
    }
  }

  async function handleCancelar(id: string) {
    if (!confirm("Deseja realmente cancelar este horário?")) return;

    try {
      await cancelarHorario(id);
      avisoSucesso("Horário cancelado com sucesso!");
      carregarHorarios();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao cancelar horário");
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm("Deseja realmente deletar este horário?")) return;

    try {
      await deletarHorario(id);
      avisoSucesso("Horário deletado com sucesso!");
      carregarHorarios();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao deletar horário");
    }
  }

  function handleDiaClick(dia: Date) {
    setDiaSelectado(dia);
    setModalAberto(true);
  }

  return (
    <Container size="full">
      <div className="agenda-container">
        {/* Header */}
        <div className="agenda-header">
          <div>
            <h1 className="title">Minha Agenda</h1>
            <p className="subtitle">Gerencie sua disponibilidade e reservas</p>
          </div>
          <Botao variante="primaria" onClick={() => setModalAberto(true)}>
            + Adicionar Horário
          </Botao>
        </div>

        {/* Conteúdo - Calendário e Lista lado a lado */}
        {carregando ? (
          <div className="text-center">Carregando agenda...</div>
        ) : (
          <div className="agenda-grid">
            <div className="agenda-calendario">
              <CalendarioAgenda
                horarios={horarios}
                onDiaClick={handleDiaClick}
              />
            </div>
            <div className="agenda-lista">
              <ListaHorarios
                horarios={horarios}
                modo="artista"
                podeCancelar
                podeDeletar
                onCancelar={handleCancelar}
                onDeletar={handleDeletar}
              />
            </div>
          </div>
        )}

        {/* Modal adicionar horário */}
        <Modal
          aberto={modalAberto}
          aoFechar={() => setModalAberto(false)}
          titulo="Adicionar Horário"
        >
          <FormularioHorario
            diaInicial={diaSelectado}
            onSubmit={handleCriarHorarios}
            onCancelar={() => setModalAberto(false)}
          />
        </Modal>
      </div>

      <style>{`
        .agenda-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .agenda-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border, #FFE4E4);
        }

        .title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: var(--text, #2D3748);
        }

        .subtitle {
          font-size: 0.875rem;
          margin: 0;
          color: var(--text-secondary, #718096);
        }

        .agenda-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 1rem;
          width: 100%;
          align-items: start;
        }

        .agenda-calendario {
          position: sticky;
          top: 1rem;
        }

        .agenda-lista {
          min-height: 400px;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .text-center {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary, #718096);
        }

        /* Mobile: Calendário acima, lista abaixo */
        @media (max-width: 1024px) {
          .agenda-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .agenda-calendario {
            position: static;
          }

          .agenda-lista {
            max-height: none;
          }

          .agenda-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .agenda-header button {
            width: 100%;
          }

          .title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Container>
  );
}
