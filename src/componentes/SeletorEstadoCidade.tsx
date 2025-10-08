import { useEffect, useState, useMemo } from "react";
import { listarEstados, listarCidadesPorEstado, type Estado, type Cidade } from "../api/ibge.api";
import { Seletor, type OpcaoSeletor } from "./ui/Seletor/Seletor";
import { erro as avisoErro } from "../utilitarios/avisos";

interface SeletorEstadoCidadeProps {
  estadoSelecionado: string;
  cidadeSelecionada: string;
  onEstadoChange: (estado: string) => void;
  onCidadeChange: (cidade: string) => void;
  obrigatorio?: boolean;
  className?: string;
  idPrefix?: string; // Prefixo único para IDs (ex: "cliente", "artista", "filtro")
}

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
  const [carregandoEstados, setCarregandoEstados] = useState(false);
  const [carregandoCidades, setCarregandoCidades] = useState(false);

  // Carregar estados ao montar componente
  useEffect(() => {
    async function carregar() {
      setCarregandoEstados(true);
      try {
        const data = await listarEstados();
        setEstados(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar estados");
      } finally {
        setCarregandoEstados(false);
      }
    }
    carregar();
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (!estadoSelecionado) {
      setCidades([]);
      return;
    }

    async function carregar() {
      setCarregandoCidades(true);
      try {
        const data = await listarCidadesPorEstado(estadoSelecionado);
        setCidades(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao carregar cidades");
        setCidades([]);
      } finally {
        setCarregandoCidades(false);
      }
    }
    carregar();
  }, [estadoSelecionado]);

  // Limpar cidade quando estado mudar
  useEffect(() => {
    if (cidadeSelecionada && estadoSelecionado) {
      // Verificar se a cidade selecionada ainda é válida para o novo estado
      const cidadeValida = cidades.some(c => c.nome === cidadeSelecionada);
      if (!cidadeValida && cidades.length > 0) {
        onCidadeChange("");
      }
    }
  }, [estadoSelecionado, cidades]);

  // Preparar opções de estados (formato: "SC - Santa Catarina")
  const opcoesEstados: OpcaoSeletor[] = useMemo(() => {
    return estados.map(estado => ({
      value: estado.sigla,
      label: `${estado.sigla} - ${estado.nome}`
    }));
  }, [estados]);

  // Preparar opções de cidades
  const opcoesCidades: OpcaoSeletor[] = useMemo(() => {
    return cidades.map(cidade => ({
      value: cidade.nome,
      label: cidade.nome
    }));
  }, [cidades]);

  return (
    <div className={className}>
      {/* ESTADO - sempre habilitado, nunca disabled */}
      <Seletor
        id={`estado-${idPrefix}`}
        name="estado"
        label={`Estado${obrigatorio ? ' *' : ''}`}
        options={opcoesEstados}
        value={estadoSelecionado || ""}
        onChange={(e) => {
          onEstadoChange(e.target.value);
          onCidadeChange(""); // Limpar cidade ao mudar estado
        }}
        placeholder="Selecione um estado"
        required={obrigatorio}
        disabled={false}
      />

      {/* CIDADE - sempre disabled até selecionar estado */}
      <Seletor
        id={`cidade-${idPrefix}`}
        name="cidade"
        label={`Cidade${obrigatorio ? ' *' : ''}`}
        options={opcoesCidades}
        value={cidadeSelecionada || ""}
        onChange={(e) => onCidadeChange(e.target.value)}
        placeholder={
          !estadoSelecionado
            ? "Primeiro selecione um estado"
            : "Selecione uma cidade"
        }
        required={obrigatorio}
        disabled={!estadoSelecionado}
      />
    </div>
  );
}
