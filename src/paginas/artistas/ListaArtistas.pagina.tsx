import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarArtistas, excluirArtista } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, CampoTexto, Botao } from "../../componentes/ui";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";
import { useAutenticacao } from "../../contexts/Autenticacao.context";

const TAMANHO_PAGINA = 10;

export default function ListaArtistasPagina() {
  const { role, usuario } = useAutenticacao();
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(0);

  async function carregar() {
    setCarregando(true);
    try {
      const data = await listarArtistas();
      setArtistas(data);
      setPagina(0);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao listar artistas");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(id: string) {
    if (!confirm("Confirma exclusão?")) return;
    try {
      await excluirArtista(id);
      avisoSucesso("Excluído");
      setArtistas((prev) => prev.filter((a) => a.id !== id));
      // corrige página se esvaziar
      setPagina((p) => {
        const filtered = aplicarFiltro(artistas.filter((a) => a.id !== id), filtro);
        const paginasTotais = Math.max(1, Math.ceil(filtered.length / TAMANHO_PAGINA));
        return Math.min(p, paginasTotais - 1);
      });
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao excluir");
    }
  }

  function aplicarFiltro(lista: Artista[], termo: string) {
    const t = termo.trim().toLowerCase();
    if (!t) return lista;
    return lista.filter((a) => a.name.toLowerCase().includes(t) || a.email.toLowerCase().includes(t));
  }

  const artistasFiltrados = useMemo(() => aplicarFiltro(artistas, filtro), [artistas, filtro]);
  const paginasTotais = Math.max(1, Math.ceil(artistasFiltrados.length / TAMANHO_PAGINA));
  const inicio = pagina * TAMANHO_PAGINA;
  const paginaAtualItems = artistasFiltrados.slice(inicio, inicio + TAMANHO_PAGINA);

  // Verifica se o usuário pode excluir um artista
  const podeExcluir = (artistaId: string) => {
    // Admin pode excluir qualquer um
    if (role === "admin") return true;
    // Artista pode excluir apenas a própria conta
    return usuario?.sub === artistaId;
  };

  return (
    <div className="lista-artistas-container">
      <div className="lista-artistas-header">
        <h1 className="title">Gerenciar Artistas</h1>
        <p className="subtitle">Visualize e gerencie os artistas cadastrados</p>
      </div>

      <Cartao className="filtro-card">
        <CampoTexto
          placeholder="Buscar por nome ou email..."
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPagina(0);
          }}
        />
      </Cartao>

      {carregando ? (
        <div className="text-center">
          <p>Carregando artistas...</p>
        </div>
      ) : (
        <>
          <div className="results-info">
            <p>{artistasFiltrados.length} artista{artistasFiltrados.length !== 1 ? 's' : ''} encontrado{artistasFiltrados.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="artistas-grid-admin">
            {paginaAtualItems.map((artista) => (
              <div key={artista.id} className="artista-card-admin">
                <div className="artista-card-admin-content">
                  <h3 className="artista-nome-admin">{artista.name}</h3>

                  {artista.city && artista.state && (
                    <p className="artista-localizacao-admin">
                      📍 {artista.city}, {artista.state}
                    </p>
                  )}

                  {artista.artTypes.length > 0 && (
                    <div className="artista-tags-admin">
                      {artista.artTypes.map((tipo, index) => (
                        <span key={index} className="artista-tag-admin">
                          {tipo}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="artista-acoes-admin">
                    <Link
                      to={`/artistas/${artista.id}`}
                      className="btn btn-primary btn-admin-ver"
                    >
                      Ver Perfil
                    </Link>
                    {podeExcluir(artista.id) && (
                      <Botao
                        variante="perigo"
                        onClick={() => handleExcluir(artista.id)}
                        className="btn-admin-excluir"
                      >
                        Excluir
                      </Botao>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {paginaAtualItems.length === 0 && (
              <div className="empty-state">
                <p className="empty-titulo">Nenhum artista encontrado</p>
                <p className="empty-descricao">
                  Tente ajustar o filtro ou cadastre um novo artista
                </p>
              </div>
            )}
          </div>

          {paginasTotais > 1 && (
            <div className="paginacao">
              <Botao
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={pagina === 0}
                variante="fantasma"
              >
                ← Anterior
              </Botao>
              <span className="paginacao-info">
                Página {pagina + 1} de {paginasTotais}
              </span>
              <Botao
                onClick={() => setPagina((p) => Math.min(paginasTotais - 1, p + 1))}
                disabled={pagina >= paginasTotais - 1}
                variante="fantasma"
              >
                Próxima →
              </Botao>
            </div>
          )}
        </>
      )}
    </div>
  );
}
