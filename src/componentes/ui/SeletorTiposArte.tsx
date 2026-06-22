import { useMemo, useState } from "react";
import { ScrollShadow } from "@heroui/react";
import { Search, X } from "lucide-react";
import { TIPOS_ARTE } from "../../constantes/tiposArte";

interface SeletorTiposArteProps {
  /** Tipos atualmente selecionados */
  value: string[];
  onChange: (next: string[]) => void;
  /** Limite máximo (default: 10). Passa undefined pra ilimitado. */
  max?: number;
  /** Texto do label acima do componente. Default: "Tipos de arte" */
  label?: string;
  /** Marca como obrigatório (mostra asterisco) */
  isRequired?: boolean;
  /** Texto de ajuda abaixo do label */
  ajuda?: string;
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // remove acentos
}

export function SeletorTiposArte({
  value,
  onChange,
  max = 10,
  label = "Tipos de arte",
  isRequired = false,
  ajuda,
}: SeletorTiposArteProps) {
  const [busca, setBusca] = useState("");

  const buscaNorm = normalizar(busca.trim());

  const categoriasFiltradas = useMemo(() => {
    if (!buscaNorm) return TIPOS_ARTE;
    return TIPOS_ARTE.map((cat) => ({
      ...cat,
      items: cat.items.filter((tipo) => normalizar(tipo).includes(buscaNorm)),
    })).filter((cat) => cat.items.length > 0);
  }, [buscaNorm]);

  const totalResultados = useMemo(
    () => categoriasFiltradas.reduce((sum, c) => sum + c.items.length, 0),
    [categoriasFiltradas],
  );

  function toggle(tipo: string) {
    if (value.includes(tipo)) {
      onChange(value.filter((t) => t !== tipo));
    } else {
      if (max !== undefined && value.length >= max) return;
      onChange([...value, tipo]);
    }
  }

  const atingiuMax = max !== undefined && value.length >= max;

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium">
          {label}
          {isRequired && (
            <span className="ml-1 text-danger">*</span>
          )}
        </label>
        {max !== undefined && (
          <span
            className={`text-xs ${atingiuMax ? "text-[color:var(--warning)]" : "text-[color:var(--muted)]"}`}
          >
            {value.length}/{max}
          </span>
        )}
      </div>

      {ajuda && (
        <p className="text-xs text-[color:var(--muted)]">{ajuda}</p>
      )}

      {/* Chips selecionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 p-2.5">
          {value.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => toggle(tipo)}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-brand px-2.5 py-1 text-xs font-semibold text-white transition hover:opacity-80"
            >
              {tipo}
              <X size={12} />
            </button>
          ))}
        </div>
      )}

      {/* Barra de busca */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]"
        />
        <input
          type="text"
          placeholder="Buscar tipo de arte..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] py-2.5 pl-9 pr-9 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca("")}
            aria-label="Limpar busca"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Mensagem se atingiu max */}
      {atingiuMax && (
        <p className="text-xs text-[color:var(--warning)]">
          Limite de {max} tipos atingido. Remova algum para adicionar outro.
        </p>
      )}

      {/* Categorias com chips — outer com overflow-hidden pra clipar o scrollbar
          nos cantos arredondados; ScrollShadow do HeroUI adiciona fade nas pontas */}
      <div className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <ScrollShadow className="max-h-96" hideScrollBar={false} size={20}>
          <div className="flex flex-col gap-4 p-3">
            {categoriasFiltradas.length === 0 ? (
              <p className="py-6 text-center text-sm text-[color:var(--muted)]">
                Nenhum tipo encontrado pra "{busca}"
              </p>
            ) : (
              <>
                {busca && (
                  <p className="text-xs text-[color:var(--muted)]">
                    {totalResultados}{" "}
                    {totalResultados === 1 ? "resultado" : "resultados"}
                  </p>
                )}
                {categoriasFiltradas.map((cat) => (
                  <div key={cat.id} className="flex flex-col gap-1.5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                      {cat.label}
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((tipo) => {
                        const selecionado = value.includes(tipo);
                        const disabled = atingiuMax && !selecionado;
                        return (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => toggle(tipo)}
                            disabled={disabled}
                            className={
                              selecionado
                                ? "rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white transition hover:opacity-80"
                                : disabled
                                  ? "cursor-not-allowed rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted)] opacity-50"
                                  : "rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)]"
                            }
                          >
                            {tipo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollShadow>
      </div>
    </div>
  );
}
