import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarArtistas } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, CampoTexto, Seletor } from "../../componentes/ui";
import { erro as avisoErro } from "../../utilitarios/avisos";

export default function HomeClientePagina() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroUF, setFiltroUF] = useState("");

  async function carregar() {
    setCarregando(true);
    try {
      const data = await listarArtistas();
      setArtistas(data);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar artistas");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<string>();
    artistas.forEach(artista =>
      artista.artTypes.forEach(tipo => tipos.add(tipo))
    );
    return Array.from(tipos).sort();
  }, [artistas]);

  const ufsDisponiveis = useMemo(() => {
    const ufs = new Set<string>();
    artistas.forEach(artista => {
      if (artista.state) ufs.add(artista.state);
    });
    return Array.from(ufs).sort();
  }, [artistas]);

  const artistasFiltrados = useMemo(() => {
    return artistas.filter(artista => {
      const buscaLower = busca.toLowerCase();
      const matchBusca = !busca ||
        artista.name.toLowerCase().includes(buscaLower) ||
        artista.artTypes.some(tipo => tipo.toLowerCase().includes(buscaLower)) ||
        artista.bio?.toLowerCase().includes(buscaLower);

      const matchTipo = !filtroTipo || artista.artTypes.includes(filtroTipo);
      const matchUF = !filtroUF || artista.state === filtroUF;

      return matchBusca && matchTipo && matchUF;
    });
  }, [artistas, busca, filtroTipo, filtroUF]);

  return (
    <div className="container">
      <h1 className="title">Encontre o Artista Perfeito</h1>
      <p className="subtitle">Descubra talentos incríveis para seu projeto</p>

      <Cartao style={{ marginBottom: 24 }}>
        <div className="grid-2" style={{ gap: 16 }}>
          <CampoTexto
            label="Buscar artistas"
            placeholder="Nome, especialidade ou palavra-chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <div className="grid-2" style={{ gap: 12 }}>
            <Seletor
              label="Tipo de Arte"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              opcoes={[
                { valor: "", texto: "Todos os tipos" },
                ...tiposDisponiveis.map(tipo => ({ valor: tipo, texto: tipo }))
              ]}
            />

            <Seletor
              label="Estado"
              value={filtroUF}
              onChange={(e) => setFiltroUF(e.target.value)}
              opcoes={[
                { valor: "", texto: "Todos os estados" },
                ...ufsDisponiveis.map(uf => ({ valor: uf, texto: uf }))
              ]}
            />
          </div>
        </div>
      </Cartao>

      {carregando ? (
        <div className="text-center">
          <p>Carregando artistas...</p>
        </div>
      ) : (
        <>
          <div className="results-info" style={{ marginBottom: 16 }}>
            <p>{artistasFiltrados.length} artista{artistasFiltrados.length !== 1 ? 's' : ''} encontrado{artistasFiltrados.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="cards-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20
          }}>
            {artistasFiltrados.map((artista) => (
              <Cartao key={artista.id} className="artista-card">
                <div style={{ padding: 20 }}>
                  <h3 style={{ marginBottom: 8 }}>
                    <Link to={`/artistas/${artista.id}`} className="link-clean">
                      {artista.name}
                    </Link>
                  </h3>

                  <div className="artista-info" style={{ marginBottom: 12 }}>
                    <p className="location" style={{ fontSize: "0.9em", color: "#666", marginBottom: 8 }}>
                      📍 {artista.city && artista.state ? `${artista.city} - ${artista.state}` : 'Localização não informada'}
                    </p>

                    <div className="art-types" style={{ marginBottom: 12 }}>
                      {artista.artTypes.map((tipo, index) => (
                        <span
                          key={index}
                          className="tag"
                          style={{
                            display: "inline-block",
                            backgroundColor: "#f0f0f0",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            marginRight: "6px",
                            marginBottom: "6px"
                          }}
                        >
                          {tipo}
                        </span>
                      ))}
                    </div>
                  </div>

                  {artista.bio && (
                    <p className="bio" style={{
                      fontSize: "0.9em",
                      color: "#555",
                      lineHeight: 1.4,
                      marginBottom: 16,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {artista.bio}
                    </p>
                  )}

                  <Link
                    to={`/artistas/${artista.id}`}
                    className="btn btn-primary btn-small"
                    style={{ textDecoration: "none", display: "inline-block" }}
                  >
                    Ver Perfil
                  </Link>
                </div>
              </Cartao>
            ))}

            {artistasFiltrados.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>
                <p style={{ fontSize: "1.1em", color: "#666", marginBottom: 8 }}>
                  Nenhum artista encontrado
                </p>
                <p style={{ color: "#888" }}>
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}