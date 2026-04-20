import { useEffect, useState, useMemo } from "react";
import {
  listarEstados,
  listarCidadesPorEstado,
  type Estado,
  type Cidade,
} from "../api/ibge.api";
import { erro as avisoErro } from "../utilitarios/avisos";

interface SeletorEstadoCidadeProps {
  estadoSelecionado: string;
  cidadeSelecionada: string;
  onEstadoChange: (estado: string) => void;
  onCidadeChange: (cidade: string) => void;
  obrigatorio?: boolean;
  className?: string;
  idPrefix?: string;
}

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-50";

export function SeletorEstadoCidade({
  estadoSelecionado,
  cidadeSelecionada,
  onEstadoChange,
  onCidadeChange,
  obrigatorio = false,
  className = "",
  idPrefix = "default",
}: SeletorEstadoCidadeProps) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listarEstados();
        setEstados(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar estados");
      }
    })();
  }, []);

  useEffect(() => {
    if (!estadoSelecionado) {
      setCidades([]);
      return;
    }
    (async () => {
      try {
        const data = await listarCidadesPorEstado(estadoSelecionado);
        setCidades(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar cidades");
        setCidades([]);
      }
    })();
  }, [estadoSelecionado]);

  useEffect(() => {
    if (cidadeSelecionada && cidades.length > 0) {
      const valida = cidades.some((c) => c.nome === cidadeSelecionada);
      if (!valida) onCidadeChange("");
    }
  }, [cidades, cidadeSelecionada, onCidadeChange]);

  const opcoesEstados = useMemo(
    () =>
      estados.map((e) => (
        <option key={e.sigla} value={e.sigla}>
          {e.sigla} — {e.nome}
        </option>
      )),
    [estados]
  );

  const opcoesCidades = useMemo(
    () =>
      cidades.map((c) => (
        <option key={c.id} value={c.nome}>
          {c.nome}
        </option>
      )),
    [cidades]
  );

  return (
    <div className={className || "grid gap-4 sm:grid-cols-2"}>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`estado-${idPrefix}`}
          className="text-sm font-medium text-[color:var(--foreground)]"
        >
          Estado
          {obrigatorio && (
            <span className="ml-1 text-[color:var(--accent)]">*</span>
          )}
        </label>
        <div className="relative">
          <select
            id={`estado-${idPrefix}`}
            name="estado"
            required={obrigatorio}
            className={SELECT_CLASS}
            value={estadoSelecionado || ""}
            onChange={(e) => {
              onEstadoChange(e.target.value);
              onCidadeChange("");
            }}
          >
            <option value="">Selecione um estado</option>
            {opcoesEstados}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
            ▼
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`cidade-${idPrefix}`}
          className="text-sm font-medium text-[color:var(--foreground)]"
        >
          Cidade
          {obrigatorio && (
            <span className="ml-1 text-[color:var(--accent)]">*</span>
          )}
        </label>
        <div className="relative">
          <select
            id={`cidade-${idPrefix}`}
            name="cidade"
            required={obrigatorio}
            disabled={!estadoSelecionado}
            className={SELECT_CLASS}
            value={cidadeSelecionada || ""}
            onChange={(e) => onCidadeChange(e.target.value)}
          >
            <option value="">
              {!estadoSelecionado
                ? "Selecione um estado primeiro"
                : "Selecione uma cidade"}
            </option>
            {opcoesCidades}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
            ▼
          </span>
        </div>
      </div>
    </div>
  );
}
