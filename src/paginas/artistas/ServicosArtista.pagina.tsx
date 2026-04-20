import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Spinner,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  criarServico,
  listarServicosPorArtista,
  atualizarServico,
} from "../../api/servicos.api";
import type { Service, ServiceMedia } from "../../tipos/servicos";
import { FormularioServico, ListaServicos } from "../../componentes/servicos";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

export default function ServicosArtistaPagina() {
  const { usuario } = useAutenticacao();
  const artistId = usuario?.sub;

  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Service | null>(null);

  useEffect(() => {
    if (artistId) carregarServicos();
    else setCarregando(false);
  }, [artistId]);

  async function carregarServicos() {
    if (!artistId) return;
    setCarregando(true);
    try {
      const dados = await listarServicosPorArtista(artistId);
      setServicos(dados);
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao carregar serviços");
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriar(dados: {
    title: string;
    description?: string;
    media?: ServiceMedia[];
    active: boolean;
  }) {
    if (!artistId) return;
    setSalvando(true);
    try {
      await criarServico({ artistId, ...dados });
      await carregarServicos();
      setMostrarFormulario(false);
      avisoSucesso("Serviço criado com sucesso!");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao criar serviço");
    } finally {
      setSalvando(false);
    }
  }

  async function handleAtualizar(dados: {
    title: string;
    description?: string;
    media?: ServiceMedia[];
    active: boolean;
  }) {
    if (!servicoEditando) return;
    setSalvando(true);
    try {
      await atualizarServico(servicoEditando._id, dados);
      await carregarServicos();
      setServicoEditando(null);
      setMostrarFormulario(false);
      avisoSucesso("Serviço atualizado com sucesso!");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao atualizar serviço");
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(s: Service) {
    setServicoEditando(s);
    setMostrarFormulario(true);
  }

  function handleNovo() {
    setServicoEditando(null);
    setMostrarFormulario(true);
  }

  function handleCancelar() {
    setMostrarFormulario(false);
    setServicoEditando(null);
  }

  if (!artistId) {
    return (
      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardContent className="py-10 text-center">
          <p>Você precisa estar autenticado como artista.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-gradient-brand">
            Meus serviços
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Gerencie os serviços que você oferece aos clientes
          </p>
        </div>
        {!mostrarFormulario && (
          <Button
            variant="primary"
            size="lg"
            onPress={handleNovo}
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            <Plus size={18} className="mr-2" />
            Novo serviço
          </Button>
        )}
      </header>

      {mostrarFormulario && (
        <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardHeader>
            <h2 className="font-display text-xl font-bold">
              {servicoEditando ? "Editar serviço" : "Novo serviço"}
            </h2>
          </CardHeader>
          <CardContent>
            <FormularioServico
              servicoInicial={servicoEditando || undefined}
              onSubmit={servicoEditando ? handleAtualizar : handleCriar}
              onCancelar={handleCancelar}
              carregando={salvando}
            />
          </CardContent>
        </Card>
      )}

      {carregando ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="accent" />
        </div>
      ) : (
        <ListaServicos
          servicos={servicos}
          modo="artista"
          onEditar={handleEditar}
        />
      )}
    </div>
  );
}
