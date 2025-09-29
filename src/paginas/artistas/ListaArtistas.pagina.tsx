import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listarArtistas, excluirArtista } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, CampoTexto, Botao } from "../../componentes/ui";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";

const TAMANHO_PAGINA = 10;

export default function ListaArtistasPagina() {
  const navigate = useNavigate();
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

  return (
    <div>
      <h1>Artistas</h1>

      <Cartao style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
          <CampoTexto
            placeholder="Buscar por nome ou email..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPagina(0);
            }}
          />
          <Botao onClick={() => navigate("/registro")}>Cadastrar artista</Botao>
        </div>
      </Cartao>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <Cartao>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cidade</th>
                  <th>Tipos</th>
                  <th style={{ width: 120 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginaAtualItems.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link to={`/artistas/${a.id}`}>{a.name}</Link>
                    </td>
                    <td>
                      {a.city} - {a.state}
                    </td>
                    <td>{a.artTypes.join(", ")}</td>
                    <td>
                      <Botao variante="perigo" onClick={() => handleExcluir(a.id)}>
                        Excluir
                      </Botao>
                    </td>
                  </tr>
                ))}
                {paginaAtualItems.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Nenhum artista encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Cartao>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
            <Botao onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pagina === 0} variante="fantasma">
              Anterior
            </Botao>
            <span>
              Página {pagina + 1} de {paginasTotais}
            </span>
            <Botao
              onClick={() => setPagina((p) => Math.min(paginasTotais - 1, p + 1))}
              disabled={pagina >= paginasTotais - 1}
              variante="fantasma"
            >
              Próxima
            </Botao>
          </div>
        </>
      )}
    </div>
  );
}
