import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarArtistas } from "../../api/artistas.api";
import { listarEstados, listarCidadesPorEstado, type Estado, type Cidade } from "../../api/ibge.api";
import type { Artista } from "../../tipos/artistas";
import { Modal, Botao, Seletor, type OpcaoSeletor } from "../../componentes/ui";
import { Stack, Container } from "../../componentes/layout";
import { erro as avisoErro } from "../../utilitarios/avisos";
import { useDebounce } from "../../hooks/useDebounce";

export default function HomeClientePagina() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 300);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Filtros avançados
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);

  // Dados da API do IBGE
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  async function carregar() {
    setCarregando(true);
    try {
      // Montar filtros para API
      const filtros: any = {};
      if (estadoSelecionado) filtros.state = estadoSelecionado;
      if (cidadeSelecionada) filtros.city = cidadeSelecionada;

      const data = await listarArtistas(filtros);
      setArtistas(data);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar artistas");
    } finally {
      setCarregando(false);
    }
  }

  // Recarregar quando filtros de estado/cidade mudarem
  useEffect(() => {
    carregar();
  }, [estadoSelecionado, cidadeSelecionada]);

  // Carregar estados ao montar
  useEffect(() => {
    async function carregarEstados() {
      try {
        const data = await listarEstados();
        setEstados(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar estados");
      }
    }
    carregarEstados();
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (!estadoSelecionado) {
      setCidades([]);
      return;
    }

    async function carregarCidades() {
      try {
        const data = await listarCidadesPorEstado(estadoSelecionado);
        setCidades(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar cidades");
        setCidades([]);
      }
    }
    carregarCidades();
  }, [estadoSelecionado]);

  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<string>();
    artistas.forEach(artista =>
      artista.artTypes.forEach(tipo => tipos.add(tipo))
    );
    return Array.from(tipos).sort();
  }, [artistas]);

  // Preparar opções de estados para o Seletor (formato: "SC - Santa Catarina")
  const opcoesEstados: OpcaoSeletor[] = useMemo(() => {
    return estados.map(estado => ({
      value: estado.sigla,
      label: `${estado.sigla} - ${estado.nome}`
    }));
  }, [estados]);

  // Preparar opções de cidades para o Seletor
  const opcoesCidades: OpcaoSeletor[] = useMemo(() => {
    return cidades.map(cidade => ({
      value: cidade.nome,
      label: cidade.nome
    }));
  }, [cidades]);

  const artistasFiltrados = useMemo(() => {
    return artistas.filter(artista => {
      // Filtragem client-side apenas para busca por nome e tipos de arte
      // Estado e cidade já são filtrados pela API
      const buscaLower = buscaDebounced.toLowerCase();
      const matchBusca = !buscaDebounced ||
        artista.name.toLowerCase().includes(buscaLower);

      const matchTipos = tiposSelecionados.length === 0 ||
        tiposSelecionados.some(tipo => artista.artTypes.includes(tipo));

      return matchBusca && matchTipos;
    });
  }, [artistas, buscaDebounced, tiposSelecionados]);

  const filtrosAtivos = useMemo(() => {
    let count = 0;
    if (cidadeSelecionada) count++;
    if (estadoSelecionado) count++;
    if (tiposSelecionados.length > 0) count++;
    return count;
  }, [cidadeSelecionada, estadoSelecionado, tiposSelecionados]);

  function toggleTipo(tipo: string) {
    setTiposSelecionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  }

  function limparFiltros() {
    setCidadeSelecionada("");
    setEstadoSelecionado("");
    setTiposSelecionados([]);
  }

  function handleEstadoChange(uf: string) {
    setEstadoSelecionado(uf);
    setCidadeSelecionada(""); // Limpar cidade ao mudar estado
  }

  return (
    <Container>
      <Stack spacing="large">
        {/* Hero Section com contador destacado */}
        <div className="hero-section">
          <Stack spacing="small" align="center">
            <h1 className="title">Encontre o Artista Perfeito</h1>
            <p className="subtitle">Descubra talentos incríveis para seu projeto</p>
          </Stack>

          {/* Contador de artistas DESTACADO */}
          <div className="artistas-contador-destaque">
            <div className="contador-icone">🎨</div>
            <div className="contador-info">
              <div className="contador-numero">{artistasFiltrados.length}</div>
              <div className="contador-texto">
                {artistasFiltrados.length === 1 ? 'Artista Disponível' : 'Artistas Disponíveis'}
              </div>
            </div>
            {filtrosAtivos > 0 && (
              <div className="contador-badge">
                {filtrosAtivos} filtro{filtrosAtivos > 1 ? 's' : ''} ativo{filtrosAtivos > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Barra de busca moderna */}
        <div className="barra-busca-moderna">
          <div className="busca-input-container">
            <span className="busca-icone">🔍</span>
            <input
              type="text"
              className="busca-input-principal"
              placeholder="Buscar artistas por nome"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <button
            className="btn-filtros"
            onClick={() => setFiltrosAbertos(true)}
          >
            <span className="filtros-icone">⚙️</span>
            <span className="filtros-texto">Filtros</span>
            {filtrosAtivos > 0 && (
              <span className="filtros-badge">{filtrosAtivos}</span>
            )}
          </button>
        </div>

        {/* Chips de filtros ativos */}
        {filtrosAtivos > 0 && (
          <div className="filtros-chips">
            {estadoSelecionado && (
              <div className="filter-chip">
                <span>Estado: {estadoSelecionado}</span>
                <button onClick={() => {
                  setEstadoSelecionado("");
                  setCidadeSelecionada(""); // Limpar cidade ao remover estado
                }}>×</button>
              </div>
            )}
            {cidadeSelecionada && (
              <div className="filter-chip">
                <span>Cidade: {cidadeSelecionada}</span>
                <button onClick={() => setCidadeSelecionada("")}>×</button>
              </div>
            )}
            {tiposSelecionados.map(tipo => (
              <div key={tipo} className="filter-chip">
                <span>{tipo}</span>
                <button onClick={() => toggleTipo(tipo)}>×</button>
              </div>
            ))}
            <button className="limpar-filtros-btn" onClick={limparFiltros}>
              Limpar todos
            </button>
          </div>
        )}

        {/* Modal de filtros avançados */}
        <Modal
          aberto={filtrosAbertos}
          aoFechar={() => setFiltrosAbertos(false)}
          titulo="Filtros Avançados"
          tamanho="medio"
        >
          <div className="filtros-modal-content">
            {/* Estado - SEMPRE habilitado, nunca disabled */}
            <Seletor
              id="estado-filtro"
              name="estado"
              label="Estado"
              options={opcoesEstados}
              value={estadoSelecionado}
              onChange={(e) => handleEstadoChange(e.target.value)}
              placeholder="Selecione um estado"
              disabled={false}
            />

            {/* Cidade - SEMPRE disabled até selecionar estado */}
            <Seletor
              id="cidade-filtro"
              name="cidade"
              label="Cidade"
              options={opcoesCidades}
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              placeholder={
                !estadoSelecionado
                  ? "Primeiro selecione um estado"
                  : "Selecione uma cidade"
              }
              disabled={!estadoSelecionado}
            />

            {/* Tipos de Arte */}
            <div className="filtro-secao">
              <label className="filtro-label">Tipos de Arte</label>
              <div className="filtro-checkboxes">
                {tiposDisponiveis.map(tipo => {
                  const checkboxId = `tipo-${tipo.toLowerCase().replace(/\s+/g, '-')}-filtro`;
                  return (
                    <label key={tipo} htmlFor={checkboxId} className="checkbox-label">
                      <input
                        type="checkbox"
                        id={checkboxId}
                        name="tiposArte"
                        value={tipo}
                        checked={tiposSelecionados.includes(tipo)}
                        onChange={() => toggleTipo(tipo)}
                      />
                      <span>{tipo}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Botões do modal */}
            <div className="filtros-modal-acoes">
              <Botao variante="fantasma" onClick={limparFiltros}>
                Limpar Filtros
              </Botao>
              <Botao onClick={() => setFiltrosAbertos(false)}>
                Aplicar Filtros
              </Botao>
            </div>
          </div>
        </Modal>

        {carregando ? (
          <div className="text-center">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Carregando artistas...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="artistas-lista">
              {artistasFiltrados.map((artista) => (
                <div key={artista.id} className="artista-item">
                  <div className="artista-item-content">
                    <h3 className="artista-nome">{artista.name}</h3>

                    <p className="artista-localizacao">
                      📍 {artista.city}
                      {artista.state && ` - ${artista.state}`}
                    </p>

                    <div className="artista-tags">
                      {artista.artTypes.map((tipo, index) => (
                        <span key={index} className="artista-tag">
                          {tipo}
                        </span>
                      ))}
                    </div>

                    <Link
                      to={`/artistas/${artista.id}`}
                      className="btn btn-primary artista-btn-perfil"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                </div>
              ))}

              {artistasFiltrados.length === 0 && (
                <div className="empty-state">
                  <p className="empty-titulo">
                    Nenhum artista encontrado
                  </p>
                  <p className="empty-descricao">
                    Tente ajustar os filtros ou buscar por outros termos
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Stack>
    </Container>
  );
}
