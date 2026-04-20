import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { Dialogo } from "../ui/Dialogo";
import { Campo, AreaTexto } from "../ui/Campo";
import { listarServicosPorArtista } from "../../api/servicos.api";
import { criarSolicitacao } from "../../api/requests.api";
import type { Service } from "../../tipos/servicos";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

interface SolicitarServicoModalProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  artistId: string;
  artistNome?: string;
  userId: string;
  /** Pré-selecionar um serviço específico (caso clique a partir do card) */
  serviceIdInicial?: string;
  onSucesso?: () => void;
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50";
const INPUT_CLASS =
  "w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30";

export function SolicitarServicoModal({
  aberto,
  aoFechar,
  artistId,
  artistNome,
  userId,
  serviceIdInicial,
  onSucesso,
}: SolicitarServicoModalProps) {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [serviceId, setServiceId] = useState(serviceIdInicial ?? "");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [enviando, setEnviando] = useState(false);

  const dataMinima = `${new Date().toISOString().split("T")[0]}T00:00`;

  useEffect(() => {
    if (!aberto || !artistId) return;
    setCarregandoServicos(true);
    listarServicosPorArtista(artistId)
      .then((dados) => setServicos(dados.filter((s) => s.active)))
      .catch(() => setServicos([]))
      .finally(() => setCarregandoServicos(false));
  }, [aberto, artistId]);

  function reset() {
    setServiceId("");
    setEventDate("");
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
    if (!location.trim()) {
      avisoErro("Informe o local do evento");
      return;
    }

    setEnviando(true);
    try {
      await criarSolicitacao({
        userId,
        artistId,
        serviceId,
        eventDate: new Date(eventDate).toISOString(),
        location: location.trim(),
        details: details.trim() || undefined,
      });
      avisoSucesso("Solicitação enviada! Aguarde a resposta do artista.");
      reset();
      aoFechar(false);
      onSucesso?.();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao enviar solicitação");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={(open) => {
        if (!open) reset();
        aoFechar(open);
      }}
      tamanho="md"
      titulo={artistNome ? `Solicitar serviço de ${artistNome}` : "Solicitar serviço"}
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
            Data e hora do evento{" "}
            <span className="text-[color:var(--accent)]">*</span>
          </label>
          <input
            id="solicitar-data"
            type="datetime-local"
            min={dataMinima}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={INPUT_CLASS}
          />
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
            {enviando ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </div>
      </div>
    </Dialogo>
  );
}
