import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarArtistas } from "../../api/artistas.api";
import { listarEstados, listarCidadesPorEstado, type Estado, type Cidade } from "../../api/ibge.api";
import type { Artista } from "../../tipos/artistas";
import { Modal, Botao } from "../../componentes/ui";
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
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState<string[]>([]);
  const [estadosSelecionados, setEstadosSelecionados] = useState<string[]>([]);
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);

  // Dados da API do IBGE
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  async function carregar() {
    setCarregando(true);
    try {
      // Montar filtros para API
      const filtros: any = {};
      // Se houver apenas 1 estado selecionado, passar para a API
      if (estadosSelecionados.length === 1) filtros.state = estadosSelecionados[0];
      if (cidadesSelecionadas.length === 1) filtros.city = cidadesSelecionadas[0];

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
  }, [estadosSelecionados, cidadesSelecionadas]);

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

  // Carregar cidades quando estados mudarem
  useEffect(() => {
    if (estadosSelecionados.length === 0) {
      setCidades([]);
      setCidadesSelecionadas([]);
      return;
    }

    async function carregarCidades() {
      try {
        // Carregar cidades de todos os estados selecionados
        const todasCidades = await Promise.all(
          estadosSelecionados.map(estado => listarCidadesPorEstado(estado))
        );
        const cidadesUnificadas = todasCidades.flat();
        setCidades(cidadesUnificadas);

        // Filtrar cidades selecionadas para manter apenas as que pertencem aos estados selecionados
        const cidadesValidas = cidadesUnificadas.map(c => c.nome);
        setCidadesSelecionadas(prev => prev.filter(cidade => cidadesValidas.includes(cidade)));
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar cidades");
        setCidades([]);
      }
    }
    carregarCidades();
  }, [estadosSelecionados]);

  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<string>();
    artistas.forEach(artista =>
      artista.artTypes.forEach(tipo => tipos.add(tipo))
    );
    return Array.from(tipos).sort();
  }, [artistas]);

  const artistasFiltrados = useMemo(() => {
    return artistas.filter(artista => {
      // Filtragem client-side para busca, tipos, estados e cidades
      const buscaLower = buscaDebounced.toLowerCase();
      const matchBusca = !buscaDebounced ||
        artista.name.toLowerCase().includes(buscaLower);

      const matchTipos = tiposSelecionados.length === 0 ||
        tiposSelecionados.some(tipo => artista.artTypes.includes(tipo));

      // Filtrar por múltiplos estados (se houver mais de 1)
      const matchEstados = estadosSelecionados.length === 0 ||
        estadosSelecionados.includes(artista.state);

      // Filtrar por múltiplas cidades (se houver mais de 1)
      const matchCidades = cidadesSelecionadas.length === 0 ||
        cidadesSelecionadas.includes(artista.city);

      return matchBusca && matchTipos && matchEstados && matchCidades;
    });
  }, [artistas, buscaDebounced, tiposSelecionados, estadosSelecionados, cidadesSelecionadas]);

  const filtrosAtivos = useMemo(() => {
    let count = 0;
    if (cidadesSelecionadas.length > 0) count++;
    if (estadosSelecionados.length > 0) count++;
    if (tiposSelecionados.length > 0) count++;
    return count;
  }, [cidadesSelecionadas, estadosSelecionados, tiposSelecionados]);

  function toggleTipo(tipo: string) {
    setTiposSelecionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
  }

  function toggleEstado(uf: string) {
    setEstadosSelecionados(prev =>
      prev.includes(uf)
        ? prev.filter(e => e !== uf)
        : [...prev, uf]
    );
  }

  function toggleCidade(cidade: string) {
    setCidadesSelecionadas(prev =>
      prev.includes(cidade)
        ? prev.filter(c => c !== cidade)
        : [...prev, cidade]
    );
  }

  function limparFiltros() {
    setCidadesSelecionadas([]);
    setEstadosSelecionados([]);
    setTiposSelecionados([]);
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
            {estadosSelecionados.map(estado => (
              <div key={estado} className="filter-chip">
                <span>Estado: {estado}</span>
                <button onClick={() => toggleEstado(estado)}>×</button>
              </div>
            ))}
            {cidadesSelecionadas.map(cidade => (
              <div key={cidade} className="filter-chip">
                <span>Cidade: {cidade}</span>
                <button onClick={() => toggleCidade(cidade)}>×</button>
              </div>
            ))}
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
            {/* Estados - Lista de checkboxes */}
            <div className="mb-4">
              <h5 className="mb-3">Estados</h5>
              {estados.length === 0 ? (
                <p className="text-secondary text-center py-3">Carregando estados...</p>
              ) : (
                <div className="list-group filtros-list-scroll">
                  {estados.map((estado) => {
                    const checkboxId = `estado-${estado.sigla}-filtro`;
                    return (
                      <div key={estado.sigla} className="list-group-item">
                        <div className="form-check">
                          <input
                            id={checkboxId}
                            type="checkbox"
                            className="form-check-input"
                            checked={estadosSelecionados.includes(estado.sigla)}
                            onChange={() => toggleEstado(estado.sigla)}
                          />
                          <label className="form-check-label" htmlFor={checkboxId}>
                            {estado.sigla} - {estado.nome}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cidades - Lista de checkboxes dependente */}
            <div className="mb-4">
              <h5 className="mb-3">Cidades</h5>
              {estadosSelecionados.length === 0 ? (
                <p className="text-secondary text-center py-3">Selecione um estado primeiro</p>
              ) : cidades.length === 0 ? (
                <p className="text-secondary text-center py-3">Carregando cidades...</p>
              ) : (
                <div className="list-group filtros-list-scroll">
                  {cidades.map((cidade) => {
                    const checkboxId = `cidade-${cidade.id}-filtro`;
                    return (
                      <div key={cidade.id} className="list-group-item">
                        <div className="form-check">
                          <input
                            id={checkboxId}
                            type="checkbox"
                            className="form-check-input"
                            checked={cidadesSelecionadas.includes(cidade.nome)}
                            onChange={() => toggleCidade(cidade.nome)}
                          />
                          <label className="form-check-label" htmlFor={checkboxId}>
                            {cidade.nome}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tipos de Arte */}
            <div className="mb-4">
              <h5 className="mb-3">Tipos de Arte</h5>
              {tiposDisponiveis.length === 0 ? (
                <p className="text-secondary text-center py-3">Nenhum tipo disponível</p>
              ) : (
                <div className="list-group filtros-list-scroll">
                  {tiposDisponiveis.map((tipo) => {
                    const checkboxId = `tipo-${tipo.toLowerCase().replace(/\s+/g, '-')}-filtro`;
                    return (
                      <div key={tipo} className="list-group-item">
                        <div className="form-check">
                          <input
                            id={checkboxId}
                            type="checkbox"
                            className="form-check-input"
                            checked={tiposSelecionados.includes(tipo)}
                            onChange={() => toggleTipo(tipo)}
                          />
                          <label className="form-check-label" htmlFor={checkboxId}>
                            {tipo}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

      <style>{`
        /* Scroll para lista de filtros */
        .filtros-list-scroll {
          max-height: 300px;
          overflow-y: auto;
        }

        /* Cursor pointer nos labels */
        .filtros-list-scroll .list-group-item {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.15s ease;
        }

        /* Hover apenas no background */
        .filtros-list-scroll .list-group-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* Destaque da linha quando checkbox estiver em focus */
        .filtros-list-scroll .list-group-item:focus-within {
          background-color: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Checkbox com aparência padrão melhorada */
        .filtros-list-scroll .form-check-input {
          width: 1.125rem;
          height: 1.125rem;
          margin-top: 0.125em;
          vertical-align: top;
          background-color: #ffffff !important;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          border: 1px solid #dee2e6 !important;
          appearance: none;
          print-color-adjust: exact;
        }

        .filtros-list-scroll .form-check-input:checked {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e") !important;
        }

        /* Garantir que não herde estilos do tema dark */
        .filtros-list-scroll .form-check-input:checked[type="checkbox"] {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
        }

        /* Focus mínimo no checkbox, sem box-shadow */
        .filtros-list-scroll .form-check-input:focus {
          outline: 0;
        }

        /* Scrollbar customizada */
        .filtros-list-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .filtros-list-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }

        .filtros-list-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .filtros-list-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }

        /* Estilos dos botões do modal */
        .filtros-modal-content {
          display: flex;
          flex-direction: column;
        }

        .filtros-modal-acoes {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Responsivo */
        @media (max-width: 640px) {
          .filtros-modal-acoes {
            flex-direction: column;
          }

          .filtros-modal-acoes button {
            width: 100%;
          }
        }
      `}</style>
    </Container>
  );
}
