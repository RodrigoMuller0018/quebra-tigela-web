import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { Dialogo } from "../ui/Dialogo";
import { Campo, AreaTexto } from "../ui/Campo";
import { listarServicosPorArtista } from "../../api/servicos.api";
import { criarSolicitacao } from "../../api/requests.api";
import type { Service } from "../../tipos/servicos";
import type { ScheduleEntry } from "../../tipos/schedule";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

interface SolicitarServicoModalProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  artistId: string;
  artistNome?: string;
  /** Pré-selecionar um serviço específico (caso clique a partir do card de serviço) */
  serviceIdInicial?: string;
  /**
   * Se passado, a modal entra em modo "reserva de slot":
   * data/hora ficam read-only com os valores do slot, e scheduleId é enviado ao backend.
   */
  slot?: ScheduleEntry | null;
  onSucesso?: () => void;
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50";
const INPUT_CLASS =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:opacity-60";

function dataParaInput(iso: string): string {
  // ISO ou YYYY-MM-DD → YYYY-MM-DD
  return iso.includes("T") ? iso.split("T")[0] : iso;
}

export function SolicitarServicoModal({
  aberto,
  aoFechar,
  artistId,
  artistNome,
  serviceIdInicial,
  slot,
  onSucesso,
}: SolicitarServicoModalProps) {
  const modoReserva = !!slot;

  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [serviceId, setServiceId] = useState(serviceIdInicial ?? "");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [enviando, setEnviando] = useState(false);

  const dataMinima = useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );

  // Quando abre em modo reserva, pré-preenche e trava data/horas
  useEffect(() => {
    if (aberto && slot) {
      setEventDate(dataParaInput(slot.date));
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
    }
  }, [aberto, slot]);

  useEffect(() => {
    if (!aberto || !artistId) return;
    setCarregandoServicos(true);
    listarServicosPorArtista(artistId)
      .then((dados) => setServicos(dados.filter((s) => s.active)))
      .catch(() => setServicos([]))
      .finally(() => setCarregandoServicos(false));
  }, [aberto, artistId]);

  function reset() {
    setServiceId(serviceIdInicial ?? "");
    setEventDate("");
    setStartTime("09:00");
    setEndTime("10:00");
    setLocation("");
    setDetails("");
  }

  async function handleEnviar() {
    if (!serviceId) {
      avisoErro("Selecione um serviço");
      return;
    }
    if (!eventDate) {
      avisoErro("Informe a data do evento");
      return;
    }
    if (!startTime || !endTime) {
      avisoErro("Informe horário de início e fim");
      return;
    }
    if (startTime >= endTime) {
      avisoErro("Hora de fim deve ser maior que hora de início");
      return;
    }
    if (!location.trim()) {
      avisoErro("Informe o local do evento");
      return;
    }

    setEnviando(true);
    try {
      await criarSolicitacao({
        artistId,
        serviceId,
        scheduleId: slot ? slot._id || slot.id : undefined,
        eventDate,
        startTime,
        endTime,
        location: location.trim(),
        details: details.trim() || undefined,
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
    ? artistNome
      ? `Reservar horário com ${artistNome}`
      : "Reservar horário"
    : artistNome
      ? `Solicitar serviço de ${artistNome}`
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
            Serviço <span className="text-[color:var(--accent)]">*</span>
          </label>
          <div className="relative">
            <select
              id="solicitar-servico"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
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
                  {s.title}
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
            Data <span className="text-[color:var(--accent)]">*</span>
          </label>
          <input
            id="solicitar-data"
            type="date"
            min={dataMinima}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
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
              Hora início <span className="text-[color:var(--accent)]">*</span>
            </label>
            <input
              id="solicitar-hi"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={modoReserva}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="solicitar-hf" className="text-sm font-medium">
              Hora fim <span className="text-[color:var(--accent)]">*</span>
            </label>
            <input
              id="solicitar-hf"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={modoReserva}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <Campo
          label="Local do evento"
          value={location}
          onChange={setLocation}
          isRequired
          placeholder="Ex: Av. Paulista, 1000 — São Paulo"
        />

        <AreaTexto
          label="Detalhes do pedido"
          value={details}
          onChange={setDetails}
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
