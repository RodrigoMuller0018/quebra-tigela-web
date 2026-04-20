import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Spinner,
} from "@heroui/react";
import { Search, MapPin, Trash2 } from "lucide-react";
import { listarArtistas, excluirArtista } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import {
  erro as avisoErro,
  sucesso as avisoSucesso,
} from "../../utilitarios/avisos";
import { useAutenticacao } from "../../contexts/Autenticacao.context";

const TAMANHO_PAGINA = 12;

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
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao excluir");
    }
  }

  const artistasFiltrados = useMemo(() => {
    const t = filtro.trim().toLowerCase();
    if (!t) return artistas;
    return artistas.filter(
      (a) =>
        a.name.toLowerCase().includes(t) || a.email.toLowerCase().includes(t)
    );
  }, [artistas, filtro]);

  const paginas = Math.max(1, Math.ceil(artistasFiltrados.length / TAMANHO_PAGINA));
  const inicio = pagina * TAMANHO_PAGINA;
  const itens = artistasFiltrados.slice(inicio, inicio + TAMANHO_PAGINA);

  const podeExcluir = (id: string) =>
    role === "admin" || usuario?.sub === id;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-gradient-brand">
          Gerenciar artistas
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Visualize e gerencie os artistas cadastrados
        </p>
      </header>

      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
        />
        <input
          type="text"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
            setPagina(0);
          }}
          placeholder="Buscar por nome ou email..."
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-3 pl-11 pr-4 text-sm shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
        />
      </div>

      <p className="text-sm text-[color:var(--muted)]">
        {artistasFiltrados.length} artista
        {artistasFiltrados.length !== 1 ? "s" : ""} encontrado
        {artistasFiltrados.length !== 1 ? "s" : ""}
      </p>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="accent" />
        </div>
      ) : itens.length === 0 ? (
        <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <h3 className="font-display text-xl font-bold">
              Nenhum artista encontrado
            </h3>
            <p className="text-sm text-[color:var(--muted)]">
              Tente ajustar o filtro
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((a) => (
              <Card
                key={a.id}
                className="border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-brand font-display text-lg font-black text-white">
                      {a.name?.[0]?.toUpperCase() ?? "QT"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-base font-bold">
                        {a.name}
                      </h3>
                      <p className="truncate text-xs text-[color:var(--muted)]">
                        {a.email}
                      </p>
                      {a.city && a.state && (
                        <p className="flex items-center gap-1 text-xs text-[color:var(--muted)]">
                          <MapPin size={12} />
                          {a.city}, {a.state}
                        </p>
                      )}
                    </div>
                  </div>

                  {a.artTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {a.artTypes.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[color:var(--accent)]/15 px-2.5 py-0.5 text-xs text-[color:var(--accent)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2 pt-2">
                    <Link to={`/artistas/${a.id}`} className="flex-1">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="bg-gradient-brand text-white"
                      >
                        Ver perfil
                      </Button>
                    </Link>
                    {podeExcluir(a.id) && (
                      <Button
                        variant="danger-soft"
                        size="sm"
                        isIconOnly
                        onPress={() => handleExcluir(a.id)}
                        aria-label="Excluir"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {paginas > 1 && (
            <nav className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onPress={() => setPagina((p) => Math.max(0, p - 1))}
                isDisabled={pagina === 0}
              >
                Anterior
              </Button>
              <span className="text-sm text-[color:var(--muted)]">
                Página {pagina + 1} de {paginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onPress={() => setPagina((p) => Math.min(paginas - 1, p + 1))}
                isDisabled={pagina >= paginas - 1}
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
