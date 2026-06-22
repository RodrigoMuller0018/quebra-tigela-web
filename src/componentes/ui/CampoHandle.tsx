import { useEffect, useState } from "react";
import { Check, X, Loader2, AtSign } from "lucide-react";
import { Campo } from "./Campo";
import {
  formatoHandleValido,
  sanitizarHandle,
  sugerirHandle,
} from "../../utilitarios/handle";
import { verificarHandleDisponivel } from "../../api/artistas.api";

interface Props {
  /** Valor atual do handle (sem o `@`, lowercase). */
  value: string;
  onChange: (handle: string) => void;
  /** Texto usado pra gerar sugestão automática (ex: nome do usuário). */
  baseSugestao?: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Avisa o caller se o handle atual está disponível (pra travar submit). */
  onDisponibilidadeChange?: (disponivel: boolean) => void;
}

type Status =
  | { tipo: "vazio" }
  | { tipo: "formato_invalido"; motivo: string }
  | { tipo: "verificando" }
  | { tipo: "disponivel" }
  | { tipo: "ocupado"; motivo: string };

/**
 * Campo de handle público com:
 *  - Sanitização automática (só [a-z0-9_], lowercase)
 *  - Sugestão automática a partir do nome (se baseSugestao for passado)
 *  - Check de disponibilidade debounced no backend
 *  - Feedback visual de status (verificando, livre, ocupado, inválido)
 */
export function CampoHandle({
  value,
  onChange,
  baseSugestao,
  label = "Handle público",
  isRequired,
  isDisabled,
  onDisponibilidadeChange,
}: Props) {
  const [tocado, setTocado] = useState(false);
  const [status, setStatus] = useState<Status>({ tipo: "vazio" });

  // Sugestão automática a partir do nome — só preenche se o usuário ainda não tocou.
  useEffect(() => {
    if (!tocado && baseSugestao) {
      const candidato = sugerirHandle(baseSugestao);
      if (candidato && candidato !== value) {
        onChange(candidato);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSugestao, tocado]);

  // Check debounced de disponibilidade.
  useEffect(() => {
    if (!value) {
      setStatus({ tipo: "vazio" });
      onDisponibilidadeChange?.(false);
      return;
    }
    if (!formatoHandleValido(value)) {
      setStatus({
        tipo: "formato_invalido",
        motivo:
          "Use entre 3 e 30 caracteres, só letras minúsculas, números e _",
      });
      onDisponibilidadeChange?.(false);
      return;
    }

    setStatus({ tipo: "verificando" });
    const timer = setTimeout(async () => {
      try {
        const r = await verificarHandleDisponivel(value);
        if (r.disponivel) {
          setStatus({ tipo: "disponivel" });
          onDisponibilidadeChange?.(true);
        } else {
          setStatus({
            tipo: "ocupado",
            motivo: r.motivo ?? "Esse handle já está em uso",
          });
          onDisponibilidadeChange?.(false);
        }
      } catch {
        setStatus({
          tipo: "ocupado",
          motivo: "Não foi possível verificar agora",
        });
        onDisponibilidadeChange?.(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, onDisponibilidadeChange]);

  function handleChange(novo: string) {
    setTocado(true);
    onChange(sanitizarHandle(novo));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Campo
        label={label}
        value={value}
        onChange={handleChange}
        isRequired={isRequired}
        isDisabled={isDisabled}
        autoComplete="off"
        placeholder="marina_arte"
        inputClassName="font-mono"
      />
      <Status status={status} />
      <span className="text-xs text-[color:var(--muted)]">
        Sua URL pública: <span className="font-mono">/artistas/@{value || "seu_handle"}</span>
      </span>
    </div>
  );
}

function Status({ status }: { status: Status }) {
  if (status.tipo === "vazio") return null;
  if (status.tipo === "verificando") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[color:var(--muted)]">
        <Loader2 size={12} className="animate-spin" />
        Verificando disponibilidade...
      </span>
    );
  }
  if (status.tipo === "disponivel") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--success)]">
        <Check size={12} />
        Handle disponível
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--danger)]">
      <X size={12} />
      {status.motivo}
    </span>
  );
}

// Re-export AtSign caso queira usar visualmente em outros lugares
export { AtSign };
