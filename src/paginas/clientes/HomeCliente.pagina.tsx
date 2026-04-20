import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, Spinner } from "@heroui/react";
import {
  SlidersHorizontal,
  Search,
  X,
  MapPin,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { listarArtistas } from "../../api/artistas.api";
import {
  listarEstados,
  listarCidadesPorEstado,
  type Estado,
  type Cidade,
} from "../../api/ibge.api";
import type { Artista } from "../../tipos/artistas";
import { erro as avisoErro } from "../../utilitarios/avisos";
import { useDebounce } from "../../hooks/useDebounce";

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50";

export default function HomeClientePagina() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 300);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Filtros — single-select pra estado/cidade, multi pra tipos
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);

  // Dados de IBGE
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  async function carregar() {
    setCarregando(true);
    try {
      const filtros: { state?: string; city?: string } = {};
      if (estado) filtros.state = estado;
      if (cidade) filtros.city = cidade;
      const data = await listarArtistas(filtros);
      setArtistas(data);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar artistas");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [estado, cidade]);

  useEffect(() => {
    (async () => {
      try {
        setEstados(await listarEstados());
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar estados");
      }
    })();
  }, []);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      setCidade("");
      return;
    }
    (async () => {
      try {
        const data = await listarCidadesPorEstado(estado);
        setCidades(data);
        // Limpar cidade se não pertencer ao novo estado
        if (cidade && !data.some((c) => c.nome === cidade)) {
          setCidade("");
        }
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar cidades");
        setCidades([]);
      }
    })();
  }, [estado]);

  const tiposDisponiveis = useMemo(() => {
    const t = new Set<string>();
    artistas.forEach((a) => a.artTypes.forEach((tipo) => t.add(tipo)));
    return Array.from(t).sort();
  }, [artistas]);

  const artistasFiltrados = useMemo(() => {
    return artistas.filter((a) => {
      const q = buscaDebounced.toLowerCase();
      const matchBusca = !buscaDebounced || a.name.toLowerCase().includes(q);
      const matchTipos =
        tiposSelecionados.length === 0 ||
        tiposSelecionados.some((t) => a.artTypes.includes(t));
      return matchBusca && matchTipos;
    });
  }, [artistas, buscaDebounced, tiposSelecionados]);

  const filtrosAtivos =
    (estado ? 1 : 0) + (cidade ? 1 : 0) + (tiposSelecionados.length > 0 ? 1 : 0);

  function toggleTipo(tipo: string) {
    setTiposSelecionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  }

  function limparFiltros() {
    setEstado("");
    setCidade("");
    setTiposSelecionados([]);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-white shadow-2xl shadow-[color:var(--accent)]/30 sm:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            Descubra talentos
          </span>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Encontre o artista perfeito
          </h1>
          <p className="max-w-xl text-white/90">
            Conecte-se com artistas incríveis de todo o país. Encontre o talento
            ideal para o seu projeto.
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur">
              <Sparkles size={14} />
              {artistasFiltrados.length} artistas disponíveis
            </span>
          </div>
        </div>
      </section>

      {/* Busca + filtros */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar artistas por nome..."
            className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] py-3 pl-11 pr-4 text-sm shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />
        </div>
        <Button
          variant="outline"
          onPress={() => setFiltrosAbertos(true)}
          className="shrink-0"
        >
          <SlidersHorizontal size={16} className="mr-2" />
          Filtros
          {filtrosAtivos > 0 && (
            <span className="ml-2 rounded-full bg-gradient-brand px-2 py-0.5 text-xs font-bold text-white">
              {filtrosAtivos}
            </span>
          )}
        </Button>
      </section>

      {/* Chips ativos */}
      {filtrosAtivos > 0 && (
        <section className="flex flex-wrap items-center gap-2">
          {estado && (
            <PillRemovivel
              label={`Estado: ${estado}`}
              tone="secondary"
              onRemove={() => setEstado("")}
            />
          )}
          {cidade && (
            <PillRemovivel
              label={`Cidade: ${cidade}`}
              tone="secondary"
              onRemove={() => setCidade("")}
            />
          )}
          {tiposSelecionados.map((t) => (
            <PillRemovivel
              key={t}
              label={t}
              tone="accent"
              onRemove={() => toggleTipo(t)}
            />
          ))}
          <Button variant="ghost" size="sm" onPress={limparFiltros}>
            Limpar todos
          </Button>
        </section>
      )}

      {/* Grid de artistas */}
      {carregando ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="accent" />
        </div>
      ) : artistasFiltrados.length === 0 ? (
        <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <h3 className="font-display text-xl font-bold">
              Nenhum artista encontrado
            </h3>
            <p className="text-sm text-[color:var(--muted)]">
              Tente ajustar os filtros ou buscar por outros termos
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artistasFiltrados.map((a) => (
            <ArtistaCard key={a.id} artista={a} />
          ))}
        </section>
      )}

      {/* Drawer de filtros (custom, fixed-position, acima de tudo) */}
      {filtrosAbertos && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setFiltrosAbertos(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-96 max-w-[90vw] flex-col border-l border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl">
            <header className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-4">
              <h2 className="font-display text-xl font-bold text-gradient-brand">
                Filtros
              </h2>
              <button
                type="button"
                onClick={() => setFiltrosAbertos(false)}
                aria-label="Fechar"
                className="rounded-lg p-2 text-[color:var(--muted)] transition hover:bg-[color:var(--surface-secondary)] hover:text-[color:var(--foreground)]"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
              {/* Estado */}
              <FiltroSecao titulo="Estado">
                <div className="relative">
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="">Todos os estados</option>
                    {estados.map((e) => (
                      <option key={e.sigla} value={e.sigla}>
                        {e.sigla} — {e.nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
                  />
                </div>
              </FiltroSecao>

              {/* Cidade */}
              <FiltroSecao titulo="Cidade">
                <div className="relative">
                  <select
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    disabled={!estado}
                    className={SELECT_CLASS}
                  >
                    <option value="">
                      {!estado
                        ? "Selecione um estado primeiro"
                        : "Todas as cidades"}
                    </option>
                    {cidades.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
                  />
                </div>
              </FiltroSecao>

              {/* Tipos de arte (chips toggleáveis, multi) */}
              <FiltroSecao titulo="Tipos de arte">
                {tiposDisponiveis.length === 0 ? (
                  <p className="text-sm text-[color:var(--muted)]">
                    Nenhum tipo disponível
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tiposDisponiveis.map((tipo) => {
                      const ativo = tiposSelecionados.includes(tipo);
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => toggleTipo(tipo)}
                          className={
                            "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                            (ativo
                              ? "bg-gradient-brand text-white shadow-md shadow-[color:var(--accent)]/30"
                              : "bg-[color:var(--surface-secondary)] text-[color:var(--foreground)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)]")
                          }
                        >
                          {tipo}
                        </button>
                      );
                    })}
                  </div>
                )}
              </FiltroSecao>
            </div>

            <footer className="flex gap-2 border-t border-[color:var(--border)] px-6 py-4">
              <Button
                variant="ghost"
                onPress={limparFiltros}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                variant="primary"
                onPress={() => setFiltrosAbertos(false)}
                className="flex-1 bg-gradient-brand text-white"
              >
                Aplicar
              </Button>
            </footer>
          </aside>
        </>
      )}
    </div>
  );
}

type Tone = "accent" | "secondary";

function PillRemovivel({
  label,
  tone,
  onRemove,
}: {
  label: string;
  tone: Tone;
  onRemove: () => void;
}) {
  const palette =
    tone === "accent"
      ? "bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
      : "bg-[color:var(--secondary)]/15 text-[color:var(--secondary)]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${palette}`}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${label}`}
        className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-black/10"
      >
        <X size={12} />
      </button>
    </span>
  );
}

function FiltroSecao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">
        {titulo}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function ArtistaCard({ artista }: { artista: Artista }) {
  const iniciais = artista.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="group overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] transition-all hover:-translate-y-1 hover:border-[color:var(--accent)] hover:shadow-2xl hover:shadow-[color:var(--accent)]/20">
      <div className="relative h-32 overflow-hidden bg-gradient-brand">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
        <div className="absolute -bottom-8 left-5 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[color:var(--surface)] bg-[color:var(--surface)] shadow-xl">
          <span className="bg-gradient-brand bg-clip-text font-display text-2xl font-black text-transparent">
            {iniciais || "QT"}
          </span>
        </div>
      </div>
      <CardContent className="flex flex-col gap-3 pt-12">
        <div>
          <h3 className="font-display text-lg font-bold">{artista.name}</h3>
          <p className="flex items-center gap-1 text-sm text-[color:var(--muted)]">
            <MapPin size={14} />
            {artista.city}
            {artista.state && ` — ${artista.state}`}
          </p>
        </div>
        {artista.artTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {artista.artTypes.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="rounded-full bg-[color:var(--accent)]/10 px-2.5 py-0.5 text-xs text-[color:var(--accent)]"
              >
                {t}
              </span>
            ))}
            {artista.artTypes.length > 3 && (
              <span className="text-xs text-[color:var(--muted)]">
                +{artista.artTypes.length - 3}
              </span>
            )}
          </div>
        )}
        <Link to={`/artistas/${artista.id}`} className="mt-auto">
          <Button
            variant="primary"
            fullWidth
            className="bg-gradient-brand font-semibold text-white"
          >
            Ver perfil
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
