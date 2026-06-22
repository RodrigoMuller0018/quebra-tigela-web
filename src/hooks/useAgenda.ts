import { useState, useEffect, useCallback } from "react";
import type { ItemAgenda, NovoItemAgenda, FiltrosAgenda } from "../tipos/schedule";
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
  artistaId?: string;
  autoLoad?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseAgendaReturn {
  horarios: ItemAgenda[];
  carregando: boolean;
  salvando: boolean;
  recarregar: () => Promise<void>;
  criar: (novos: NovoItemAgenda[]) => Promise<void>;
  cancelar: (id: string) => Promise<void>;
  deletar: (id: string) => Promise<void>;
  obterHorariosDoDia: (dia: Date) => ItemAgenda[];
}

export function useAgenda(options: UseAgendaOptions = {}): UseAgendaReturn {
  const { artistaId, autoLoad = true, onSuccess, onError } = options;

  const [horarios, setHorarios] = useState<ItemAgenda[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const recarregar = useCallback(async () => {
    if (!artistaId) return;

    setCarregando(true);
    try {
      const dataInicio = obterDataRelativa(-CONFIG_BUSCA_HORARIOS.MESES_PASSADO);
      const dataFim = obterDataRelativa(CONFIG_BUSCA_HORARIOS.MESES_FUTURO);

      const filtros: FiltrosAgenda = {
        artistaId,
        de: dateParaString(dataInicio),
        ate: dateParaString(dataFim),
      };

      const dados = await listarHorarios(filtros);
      setHorarios(dados);
      onSuccess?.();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar horários");
      onError?.(e);
    } finally {
      setCarregando(false);
    }
  }, [artistaId, onSuccess, onError]);

  const criar = useCallback(
    async (novos: NovoItemAgenda[]) => {
      if (!artistaId) {
        avisoErro("Usuário não autenticado");
        return;
      }

      setSalvando(true);
      try {
        const horariosComArtista = novos.map((h) => ({
          ...h,
          artistaId,
        }));

        if (horariosComArtista.length === 1) {
          await criarHorario(horariosComArtista[0]);
          avisoSucesso("Horário criado com sucesso!");
        } else {
          await criarHorariosEmLote(horariosComArtista);
          avisoSucesso(`${horariosComArtista.length} horários criados com sucesso!`);
        }
        onSuccess?.();
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          "Erro ao criar horário";
        avisoErro(msg);
        onError?.(e);
        throw e;
      } finally {
        await recarregar();
        setSalvando(false);
      }
    },
    [artistaId, recarregar, onSuccess, onError],
  );

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
        avisoErro(e?.message ?? "Erro ao cancelar horário");
        onError?.(e);
      } finally {
        setSalvando(false);
      }
    },
    [recarregar, onSuccess, onError],
  );

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
        avisoErro(e?.message ?? "Erro ao deletar horário");
        onError?.(e);
      } finally {
        setSalvando(false);
      }
    },
    [recarregar, onSuccess, onError],
  );

  const obterHorariosDoDia = useCallback(
    (dia: Date): ItemAgenda[] => {
      const chaveDia = dateParaString(dia);

      return horarios.filter((horario) => {
        const start = new Date(horario.inicio);
        const y = start.getFullYear();
        const m = String(start.getMonth() + 1).padStart(2, "0");
        const d = String(start.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}` === chaveDia;
      });
    },
    [horarios],
  );

  useEffect(() => {
    if (autoLoad && artistaId) {
      recarregar();
    }
  }, [artistaId, autoLoad, recarregar]);

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
