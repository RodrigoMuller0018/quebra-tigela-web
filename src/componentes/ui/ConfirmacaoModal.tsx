import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Dialogo } from "./Dialogo";

interface ConfirmacaoModalProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  titulo: string;
  mensagem: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Quando "destrutivo", o botão de confirmar fica vermelho */
  variante?: "padrao" | "destrutivo";
  carregando?: boolean;
  onConfirmar: () => void;
}

export function ConfirmacaoModal({
  aberto,
  aoFechar,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "padrao",
  carregando = false,
  onConfirmar,
}: ConfirmacaoModalProps) {
  const ehDestrutivo = variante === "destrutivo";

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} tamanho="md" titulo={titulo}>
      <div className="flex flex-col gap-5">
        {ehDestrutivo && (
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--danger)]/20 text-[color:var(--danger)]">
              <AlertTriangle size={20} />
            </span>
            <p className="text-sm text-[color:var(--foreground)]">
              {mensagem}
            </p>
          </div>
        )}
        {!ehDestrutivo && (
          <p className="text-sm text-[color:var(--foreground)]">{mensagem}</p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            onPress={() => aoFechar(false)}
            isDisabled={carregando}
          >
            {textoCancelar}
          </Button>
          <Button
            variant={ehDestrutivo ? "danger" : "primary"}
            onPress={onConfirmar}
            isDisabled={carregando}
            className={
              ehDestrutivo
                ? "font-semibold text-white"
                : "bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
            }
          >
            {carregando ? "Aguarde..." : textoConfirmar}
          </Button>
        </div>
      </div>
    </Dialogo>
  );
}
