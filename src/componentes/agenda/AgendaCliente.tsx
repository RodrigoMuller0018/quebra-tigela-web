import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Spinner,
} from "@heroui/react";
import { CalendarioAgenda, ListaHorarios } from "./";
import type { ScheduleEntry } from "../../tipos/schedule";
import {
  obterHorariosDisponiveis,
  reservarHorario,
} from "../../api/schedule.api";
import {
  erro as avisoErro,
  sucesso as avisoSucesso,
} from "../../utilitarios/avisos";
import { Dialogo } from "../ui/Dialogo";
import { AreaTexto } from "../ui/Campo";

interface Props {
  artistaId: string;
  artistaNome: string;
  artistaEmail?: string;
}

export function AgendaCliente({
  artistaId,
  artistaNome,
  artistaEmail,
}: Props) {
  const [horarios, setHorarios] = useState<ScheduleEntry[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalReserva, setModalReserva] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] =
    useState<ScheduleEntry | null>(null);
  const [notas, setNotas] = useState("");
  const [reservando, setReservando] = useState(false);

  async function carregarHorarios() {
    setCarregando(true);
    try {
      const hoje = new Date();
      const fim = new Date();
      fim.setMonth(fim.getMonth() + 2);
      const dados = await obterHorariosDisponiveis(
        artistaId,
        hoje.toISOString().split("T")[0],
        fim.toISOString().split("T")[0]
      );
      setHorarios(dados);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar horários");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (artistaId) carregarHorarios();
  }, [artistaId]);

  function handleReservar(id: string) {
    const h = horarios.find((x) => (x._id || x.id) === id);
    if (!h) return;
    setHorarioSelecionado(h);
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
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).format(new Date(dataISO));
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-8">
        <Spinner color="accent" />
      </div>
    );
  }

  if (horarios.length === 0) {
    return (
      <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm">
            Este artista não possui horários disponíveis no momento.
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h3 className="font-display text-xl font-bold">Horários disponíveis</h3>
        <p className="text-xs text-[color:var(--muted)]">
          {horarios.length} horários disponíveis
        </p>
      </div>

      <CalendarioAgenda horarios={horarios} />

      <ListaHorarios
        horarios={horarios}
        artistaNome={artistaNome}
        artistaEmail={artistaEmail}
        modo="cliente"
        onReservar={handleReservar}
      />

      <Dialogo
        aberto={modalReserva}
        aoFechar={setModalReserva}
        titulo="Confirmar reserva"
        tamanho="md"
      >
        {horarioSelecionado && (
          <div className="flex flex-col gap-4">
            <Card className="border border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
              <CardContent className="flex flex-col gap-1">
                <h4 className="font-bold">Detalhes da reserva</h4>
                <p className="text-sm">
                  <strong>Artista:</strong> {artistaNome}
                </p>
                <p className="text-sm">
                  <strong>Data:</strong>{" "}
                  {formatarData(horarioSelecionado.date)}
                </p>
                <p className="text-sm">
                  <strong>Horário:</strong> {horarioSelecionado.startTime} →{" "}
                  {horarioSelecionado.endTime}
                </p>
              </CardContent>
            </Card>

            <AreaTexto
              label="Observações"
              value={notas}
              onChange={setNotas}
              rows={4}
              placeholder="Ex: Gostaria de discutir um projeto de pintura mural..."
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                onPress={confirmarReserva}
                isDisabled={reservando}
                className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
              >
                {reservando ? "Reservando..." : "Confirmar reserva"}
              </Button>
              <Button
                variant="ghost"
                onPress={() => setModalReserva(false)}
                isDisabled={reservando}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Dialogo>
    </div>
  );
}
