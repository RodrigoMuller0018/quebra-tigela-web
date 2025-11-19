import { useState, useEffect } from "react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  criarServico,
  listarServicosPorArtista,
  atualizarServico,
  deletarServico,
  alternarStatusServico,
} from "../../api/servicos.api";
import type { Service, ServiceMedia } from "../../tipos/servicos";
import { FormularioServico, ListaServicos } from "../../componentes/servicos";
import { Cartao, Botao } from "../../componentes/ui";
import { Container } from "../../componentes/layout";
import { sucesso as avisoSucesso, erro as avisoErro } from "../../utilitarios/avisos";

export default function ServicosArtistaPagina() {
  const { usuario } = useAutenticacao();
  const artistId = usuario?.sub;

  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Service | null>(null);

  useEffect(() => {
    if (artistId) {
      carregarServicos();
    } else {
      setCarregando(false);
    }
  }, [artistId]);

  async function carregarServicos() {
    if (!artistId) return;

    setCarregando(true);
    try {
      const dados = await listarServicosPorArtista(artistId);
      setServicos(dados);
    } catch (err: any) {
      console.error("Erro ao carregar serviços:", err);
      avisoErro(err?.message ?? "Erro ao carregar serviços");
    } finally {
      setCarregando(false);
    }
  }

  async function handleCriarServico(dados: {
    title: string;
    description?: string;
    media?: ServiceMedia[];
    active: boolean;
  }) {
    if (!artistId) return;

    const dadosCompletos = { artistId, ...dados };

    setSalvando(true);
    try {
      await criarServico(dadosCompletos);
      await carregarServicos();
      setMostrarFormulario(false);
      avisoSucesso("Serviço criado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao criar serviço:", err);
      avisoErro(err?.message ?? "Erro ao criar serviço");
    } finally {
      setSalvando(false);
    }
  }

  async function handleAtualizarServico(dados: {
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
      console.error("Erro ao atualizar serviço:", err);
      avisoErro(err?.message ?? "Erro ao atualizar serviço");
    } finally {
      setSalvando(false);
    }
  }

  // Backend não implementou DELETE e PATCH ainda
  // Funções removidas até backend implementar

  function handleEditar(servico: Service) {
    setServicoEditando(servico);
    setMostrarFormulario(true);
  }

  function handleCancelar() {
    setMostrarFormulario(false);
    setServicoEditando(null);
  }

  function handleNovoServico() {
    setServicoEditando(null);
    setMostrarFormulario(true);
  }

  if (!artistId) {
    return (
      <Container>
        <Cartao>
          <h1 className="title">Erro</h1>
          <p>Você precisa estar autenticado como artista para acessar esta página.</p>
        </Cartao>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="title">Meus Serviços</h1>
        <p className="subtitle">Gerencie os serviços que você oferece aos clientes</p>
      </div>

      {/* Botão para criar novo serviço */}
      {!mostrarFormulario && (
        <div style={{ marginBottom: "2rem" }}>
          <Botao variante="primaria" grande onClick={handleNovoServico}>
            + Criar Novo Serviço
          </Botao>
        </div>
      )}

      {/* Formulário de criação/edição */}
      {mostrarFormulario && (
        <Cartao style={{ marginBottom: "2rem" }}>
          <h2 className="title">
            {servicoEditando ? "Editar Serviço" : "Criar Novo Serviço"}
          </h2>
          <FormularioServico
            servicoInicial={servicoEditando || undefined}
            onSubmit={servicoEditando ? handleAtualizarServico : handleCriarServico}
            onCancelar={handleCancelar}
            carregando={salvando}
          />
        </Cartao>
      )}

      {/* Lista de serviços */}
      {carregando ? (
        <Cartao>
          <p>Carregando serviços...</p>
        </Cartao>
      ) : (
        <ListaServicos
          servicos={servicos}
          modo="artista"
          onEditar={handleEditar}
        />
      )}
    </Container>
  );
}
