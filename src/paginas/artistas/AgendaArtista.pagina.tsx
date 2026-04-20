import { useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { Plus } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  CalendarioAgenda,
  FormularioHorario,
  ModalDiaAgenda,
} from "../../componentes/agenda";
import type { NovoScheduleEntry } from "../../tipos/schedule";
import { useAgenda } from "../../hooks/useAgenda";
import { Dialogo } from "../../componentes/ui/Dialogo";

export default function AgendaArtistaPagina() {
  const { usuario } = useAutenticacao();
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [modalDiaAberto, setModalDiaAberto] = useState(false);
  const [diaSelectado, setDiaSelectado] = useState<Date | null>(null);

  const { horarios, carregando, criar, cancelar, deletar } = useAgenda({
    artistId: usuario?.sub,
    autoLoad: true,
  });

  async function handleCriarHorarios(novos: NovoScheduleEntry[]) {
    await criar(novos);
    setModalAdicionarAberto(false);
    setDiaSelectado(null);
  }

  function handleDiaClick(dia: Date) {
    setDiaSelectado(dia);
    setModalDiaAberto(true);
  }

  function handleAdicionarHorarioDia(dia: Date) {
    setDiaSelectado(dia);
    setModalAdicionarAberto(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-brand">
            Minha agenda
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Gerencie sua disponibilidade e reservas
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onPress={() => {
            setDiaSelectado(null);
            setModalAdicionarAberto(true);
          }}
          className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
        >
          <Plus size={18} className="mr-2" />
          Adicionar horário
        </Button>
      </header>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="accent" />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-3xl">
          <CalendarioAgenda
            horarios={horarios}
            onDiaClick={handleDiaClick}
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[color:var(--muted)]">
            <Legenda
              cor="bg-gradient-brand"
              texto="Hoje"
            />
            <Legenda
              cor="bg-[color:var(--accent)]/15 border border-[color:var(--accent)]/40"
              texto="Disponível"
            />
            <Legenda
              cor="bg-[color:var(--secondary)]/15 border border-[color:var(--secondary)]/40"
              texto="Reservado"
            />
          </div>
        </div>
      )}

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

      <Dialogo
        aberto={modalAdicionarAberto}
        aoFechar={(open) => {
          setModalAdicionarAberto(open);
          if (!open) setDiaSelectado(null);
        }}
        titulo="Adicionar horário"
        tamanho="md"
      >
        <FormularioHorario
          diaInicial={diaSelectado || undefined}
          onSubmit={handleCriarHorarios}
          onCancelar={() => {
            setModalAdicionarAberto(false);
            setDiaSelectado(null);
          }}
        />
      </Dialogo>
    </div>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded ${cor}`} />
      <span>{texto}</span>
    </div>
  );
}
