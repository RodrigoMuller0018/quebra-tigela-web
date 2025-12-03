/**
 * HOOK CUSTOMIZADO: useAgenda
 * Gerencia o estado e operações da agenda de um artista
 */

import { useState, useEffect, useCallback } from "react";
import type { ScheduleEntry, NovoScheduleEntry, FiltrosSchedule } from "../tipos/schedule";
import {
  listarHorarios,
  criarHorario,
  criarHorariosEmLote,
  cancelarHorario,
  deletarHorario,
} from "../api/schedule.api";
import { erro as avisoErro, sucesso as avisoSucesso } from "../utilitarios/avisos";
import { CONFIG_BUSCA_HORARIOS } from "../constantes/agenda";
import { obterDataRelativa, dateParaString } from "../utilitarios/dataUtils";

interface UseAgendaOptions {
  /**
   * ID do artista para buscar horários
   */
  artistId?: string;

  /**
   * Carregar automaticamente ao montar
   */
  autoLoad?: boolean;

  /**
   * Callback executado após operações bem-sucedidas
   */
  onSuccess?: () => void;

  /**
   * Callback executado após erros
   */
  onError?: (error: Error) => void;
}

interface UseAgendaReturn {
  /**
   * Lista de horários carregados
   */
  horarios: ScheduleEntry[];

  /**
   * Indica se está carregando
   */
  carregando: boolean;

  /**
   * Indica se está salvando/deletando
   */
  salvando: boolean;

  /**
   * Recarrega a lista de horários
   */
  recarregar: () => Promise<void>;

  /**
   * Cria um ou mais horários
   */
  criar: (novosHorarios: NovoScheduleEntry[]) => Promise<void>;

  /**
   * Cancela um horário reservado
   */
  cancelar: (id: string) => Promise<void>;

  /**
   * Deleta um horário disponível
   */
  deletar: (id: string) => Promise<void>;

  /**
   * Filtra horários por dia
   */
  obterHorariosDoDia: (dia: Date) => ScheduleEntry[];
}

/**
 * Hook para gerenciar agenda de horários
 *
 * @example
 * ```tsx
 * function AgendaPage() {
 *   const { usuario } = useAutenticacao();
 *   const {
 *     horarios,
 *     carregando,
 *     recarregar,
 *     criar,
 *     deletar
 *   } = useAgenda({ artistId: usuario?.sub });
 *
 *   return (
 *     <div>
 *       {carregando ? <Loading /> : <Calendar horarios={horarios} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAgenda(options: UseAgendaOptions = {}): UseAgendaReturn {
  const { artistId, autoLoad = true, onSuccess, onError } = options;

  const [horarios, setHorarios] = useState<ScheduleEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  /**
   * Carrega horários do artista
   */
  const recarregar = useCallback(async () => {
    if (!artistId) return;

    console.log("=== CARREGAR HORÁRIOS - INÍCIO ===");
    console.log("Artista ID:", artistId);

    setCarregando(true);
    try {
      // Buscar horários de 6 meses atrás até 6 meses no futuro
      const dataInicio = obterDataRelativa(-CONFIG_BUSCA_HORARIOS.MESES_PASSADO);
      const dataFim = obterDataRelativa(CONFIG_BUSCA_HORARIOS.MESES_FUTURO);

      const filtros: FiltrosSchedule = {
        artistId,
        dateFrom: dateParaString(dataInicio),
        dateTo: dateParaString(dataFim),
      };

      console.log("Filtros de busca:", filtros);

      const dados = await listarHorarios(filtros);

      console.log("Horários recebidos:", dados.length);

      if (dados.length > 0) {
        console.log("PRIMEIRO HORÁRIO:", {
          date: dados[0].date,
          startTime: dados[0].startTime,
          endTime: dados[0].endTime,
          status: dados[0].status,
        });
      }

      setHorarios(dados);
      onSuccess?.();
    } catch (e: any) {
      console.error("Erro ao carregar horários:", e);
      avisoErro(e?.message ?? "Erro ao carregar horários");
      onError?.(e);
    } finally {
      setCarregando(false);
    }
  }, [artistId, onSuccess, onError]);

  /**
   * Cria um ou mais horários
   */
  const criar = useCallback(
    async (novosHorarios: NovoScheduleEntry[]) => {
      if (!artistId) {
        avisoErro("Usuário não autenticado");
        return;
      }

      console.log("=== CRIAR HORÁRIOS - INÍCIO ===");
      console.log("Horários a criar:", novosHorarios.length);

      setSalvando(true);
      try {
        // Adicionar artistId a todos os horários
        const horariosComArtista = novosHorarios.map((h) => ({
          ...h,
          artistId,
        }));

        if (horariosComArtista.length === 1) {
          console.log("Criando horário ÚNICO");
          await criarHorario(horariosComArtista[0] as any);
          avisoSucesso("Horário criado com sucesso!");
        } else {
          console.log("Criando horários EM LOTE");
          await criarHorariosEmLote(horariosComArtista as any);
          avisoSucesso(`${horariosComArtista.length} horários criados com sucesso!`);
        }

        console.log("Recarregando horários...");
        await recarregar();
        onSuccess?.();
      } catch (e: any) {
        console.error("ERRO AO CRIAR HORÁRIOS:", e);
        avisoErro(e?.message ?? "Erro ao criar horário");
        onError?.(e);
        throw e;
      } finally {
        setSalvando(false);
      }
    },
    [artistId, recarregar, onSuccess, onError]
  );

  /**
   * Cancela um horário reservado
   */
  const cancelar = useCallback(
    async (id: string) => {
      if (!confirm("Deseja realmente cancelar este horário?")) return;

      setSalvando(true);
      try {
        await cancelarHorario(id);
        avisoSucesso("Horário cancelado com sucesso!");
        await recarregar();
        onSuccess?.();
      } catch (e: any) {
        console.error("Erro ao cancelar horário:", e);
        avisoErro(e?.message ?? "Erro ao cancelar horário");
        onError?.(e);
      } finally {
        setSalvando(false);
      }
    },
    [recarregar, onSuccess, onError]
  );

  /**
   * Deleta um horário disponível
   */
  const deletar = useCallback(
    async (id: string) => {
      if (!confirm("Deseja realmente deletar este horário?")) return;

      setSalvando(true);
      try {
        await deletarHorario(id);
        avisoSucesso("Horário deletado com sucesso!");
        await recarregar();
        onSuccess?.();
      } catch (e: any) {
        console.error("Erro ao deletar horário:", e);
        avisoErro(e?.message ?? "Erro ao deletar horário");
        onError?.(e);
      } finally {
        setSalvando(false);
      }
    },
    [recarregar, onSuccess, onError]
  );

  /**
   * Filtra horários de um dia específico
   */
  const obterHorariosDoDia = useCallback(
    (dia: Date): ScheduleEntry[] => {
      const chaveDia = dateParaString(dia);

      return horarios.filter((horario) => {
        const dataHorario = horario.date.includes("T")
          ? horario.date.split("T")[0]
          : horario.date;
        return dataHorario === chaveDia;
      });
    },
    [horarios]
  );

  // Auto-load ao montar ou quando artistId mudar
  useEffect(() => {
    if (autoLoad && artistId) {
      recarregar();
    }
  }, [artistId, autoLoad, recarregar]);

  return {
    horarios,
    carregando,
    salvando,
    recarregar,
    criar,
    cancelar,
    deletar,
    obterHorariosDoDia,
  };
}
