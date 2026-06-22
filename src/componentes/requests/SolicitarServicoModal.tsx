import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { Dialogo } from "../ui/Dialogo";
import { Campo, AreaTexto } from "../ui/Campo";
import { listarServicosPorArtista } from "../../api/servicos.api";
import { criarSolicitacao } from "../../api/requests.api";
import type { Servico } from "../../tipos/servicos";
import type { ItemAgenda } from "../../tipos/schedule";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

interface SolicitarServicoModalProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  artistaId: string;
  artistaNome?: string;
  /** Pré-selecionar um serviço específico */
  servicoIdInicial?: string;
  /** Se passado, entra em modo "reserva de slot" */
  slot?: ItemAgenda | null;
  onSucesso?: () => void;
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50";
const INPUT_CLASS =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:opacity-60";

function instantToDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function instantToTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function composeInstant(dateLocal: string, timeLocal: string): string {
  return new Date(`${dateLocal}T${timeLocal}:00`).toISOString();
}

export function SolicitarServicoModal({
  aberto,
  aoFechar,
  artistaId,
  artistaNome,
  servicoIdInicial,
  slot,
  onSucesso,
}: SolicitarServicoModalProps) {
  const modoReserva = !!slot;

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [servicoId, setServicoId] = useState(servicoIdInicial ?? "");
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [dataFim, setDataFim] = useState("");
  const [horaFim, setHoraFim] = useState("10:00");
  const [multiDia, setMultiDia] = useState(false);
  const [local, setLocal] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [enviando, setEnviando] = useState(false);

  const dataMinima = useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );

  useEffect(() => {
    if (aberto && slot) {
      const sd = instantToDate(slot.inicio);
      const ed = instantToDate(slot.fim);
      setDataInicio(sd);
      setDataFim(ed);
      setHoraInicio(instantToTime(slot.inicio));
      setHoraFim(instantToTime(slot.fim));
      setMultiDia(sd !== ed);
    }
  }, [aberto, slot]);

  function handleDataInicioChange(v: string) {
    setDataInicio(v);
    if (!multiDia) setDataFim(v);
  }
  function handleToggleMultiDia(v: boolean) {
    setMultiDia(v);
    if (!v) setDataFim(dataInicio);
  }

  useEffect(() => {
    if (!aberto || !artistaId) return;
    setCarregandoServicos(true);
    listarServicosPorArtista(artistaId)
      .then((dados) => setServicos(dados.filter((s) => s.ativo)))
      .catch(() => setServicos([]))
      .finally(() => setCarregandoServicos(false));
  }, [aberto, artistaId]);

  function reset() {
    setServicoId(servicoIdInicial ?? "");
    setDataInicio("");
    setDataFim("");
    setHoraInicio("09:00");
    setHoraFim("10:00");
    setMultiDia(false);
    setLocal("");
    setDetalhes("");
  }

  async function handleEnviar() {
    if (!servicoId) {
      avisoErro("Selecione um serviço");
      return;
    }
    if (!dataInicio) {
      avisoErro("Informe a data do evento");
      return;
    }
    const dataFinal = multiDia ? dataFim : dataInicio;
    if (!dataFinal) {
      avisoErro("Informe a data de fim");
      return;
    }
    if (!horaInicio || !horaFim) {
      avisoErro("Informe horário de início e fim");
      return;
    }
    const inicio = composeInstant(dataInicio, horaInicio);
    const fim = composeInstant(dataFinal, horaFim);
    if (new Date(inicio) >= new Date(fim)) {
      avisoErro("Fim deve ser estritamente depois do início");
      return;
    }
    if (!local.trim()) {
      avisoErro("Informe o local do evento");
      return;
    }

    setEnviando(true);
    try {
      await criarSolicitacao({
        artistaId,
        servicoId,
        agendaId: slot ? slot._id || slot.id : undefined,
        inicio,
        fim,
        local: local.trim(),
        detalhes: detalhes.trim() || undefined,
      });
      avisoSucesso(
        modoReserva
          ? "Reserva enviada! Aguarde a confirmação do artista."
          : "Solicitação enviada! Aguarde a resposta do artista.",
      );
      reset();
      aoFechar(false);
      onSucesso?.();
    } catch (e: any) {
      avisoErro(
        e?.response?.data?.message ?? e?.message ?? "Erro ao enviar solicitação",
      );
    } finally {
      setEnviando(false);
    }
  }

  const titulo = modoReserva
    ? artistaNome
      ? `Reservar horário com ${artistaNome}`
      : "Reservar horário"
    : artistaNome
      ? `Solicitar serviço de ${artistaNome}`
      : "Solicitar serviço";

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={(open) => {
        if (!open) reset();
        aoFechar(open);
      }}
      tamanho="md"
      titulo={titulo}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="solicitar-servico" className="text-sm font-medium">
            Serviço <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <select
              id="solicitar-servico"
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              disabled={carregandoServicos || servicos.length === 0}
              className={SELECT_CLASS}
            >
              <option value="">
                {carregandoServicos
                  ? "Carregando..."
                  : servicos.length === 0
                    ? "Este artista não tem serviços cadastrados"
                    : "Escolha um serviço"}
              </option>
              {servicos.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.titulo}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="solicitar-data" className="text-sm font-medium">
            Data {multiDia ? "de início" : ""}{" "}
            <span className="text-danger">*</span>
          </label>
          <input
            id="solicitar-data"
            type="date"
            min={dataMinima}
            value={dataInicio}
            onChange={(e) => handleDataInicioChange(e.target.value)}
            disabled={modoReserva}
            className={INPUT_CLASS}
          />
          {modoReserva && (
            <span className="text-xs text-[color:var(--muted)]">
              Data fixa do slot escolhido na agenda
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="solicitar-hi" className="text-sm font-medium">
              Hora início <span className="text-danger">*</span>
            </label>
            <input
              id="solicitar-hi"
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              disabled={modoReserva}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="solicitar-hf" className="text-sm font-medium">
              Hora fim <span className="text-danger">*</span>
            </label>
            <input
              id="solicitar-hf"
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              disabled={modoReserva}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {!modoReserva && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={multiDia}
              onChange={(e) => handleToggleMultiDia(e.target.checked)}
            />
            Termina em outro dia (ex: show das 22h até 02h da madrugada)
          </label>
        )}

        {multiDia && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="solicitar-data-fim" className="text-sm font-medium">
              Data de fim <span className="text-danger">*</span>
            </label>
            <input
              id="solicitar-data-fim"
              type="date"
              min={dataInicio || dataMinima}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              disabled={modoReserva}
              className={INPUT_CLASS}
            />
          </div>
        )}

        <Campo
          label="Local do evento"
          value={local}
          onChange={setLocal}
          isRequired
          placeholder="Ex: Av. Paulista, 1000 — São Paulo"
        />

        <AreaTexto
          label="Detalhes do pedido"
          value={detalhes}
          onChange={setDetalhes}
          rows={4}
          placeholder="Conte mais sobre o evento, expectativas, equipamento necessário..."
        />

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onPress={() => aoFechar(false)}
            isDisabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onPress={handleEnviar}
            isDisabled={enviando || servicos.length === 0}
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            {enviando
              ? "Enviando..."
              : modoReserva
                ? "Confirmar reserva"
                : "Enviar solicitação"}
          </Button>
        </div>
      </div>
    </Dialogo>
  );
}
