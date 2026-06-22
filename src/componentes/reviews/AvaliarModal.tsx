import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Star } from "lucide-react";
import { Dialogo } from "../ui/Dialogo";
import { AreaTexto } from "../ui/Campo";
import { atualizarAvaliacao, criarAvaliacao } from "../../api/reviews.api";
import type { Avaliacao } from "../../tipos/reviews";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

interface AvaliarModalProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  solicitacaoId?: string;
  artistaNome?: string;
  avaliacaoInicial?: Avaliacao | null;
  onSucesso?: () => void;
}

export function AvaliarModal({
  aberto,
  aoFechar,
  solicitacaoId,
  artistaNome,
  avaliacaoInicial,
  onSucesso,
}: AvaliarModalProps) {
  const modoEdicao = !!avaliacaoInicial;
  const [nota, setNota] = useState(avaliacaoInicial?.nota ?? 0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState(avaliacaoInicial?.comentario ?? "");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setNota(avaliacaoInicial?.nota ?? 0);
      setComentario(avaliacaoInicial?.comentario ?? "");
    }
  }, [aberto, avaliacaoInicial]);

  function reset() {
    setNota(0);
    setHover(0);
    setComentario("");
  }

  async function handleEnviar() {
    if (nota < 1) {
      avisoErro("Selecione uma nota de 1 a 5 estrelas");
      return;
    }
    setEnviando(true);
    try {
      if (modoEdicao && avaliacaoInicial) {
        await atualizarAvaliacao(avaliacaoInicial.id, {
          nota,
          comentario: comentario.trim() || undefined,
        });
        avisoSucesso("Avaliação atualizada");
      } else {
        if (!solicitacaoId) {
          avisoErro("Solicitação não informada");
          return;
        }
        await criarAvaliacao({
          solicitacaoId,
          nota,
          comentario: comentario.trim() || undefined,
        });
        avisoSucesso("Avaliação enviada com sucesso!");
      }
      reset();
      aoFechar(false);
      onSucesso?.();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "Erro ao enviar avaliação";
      avisoErro(msg);
    } finally {
      setEnviando(false);
    }
  }

  const titulo = modoEdicao
    ? "Editar avaliação"
    : artistaNome
      ? `Avaliar ${artistaNome}`
      : "Avaliar artista";

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={(open) => {
        if (!open && !modoEdicao) reset();
        aoFechar(open);
      }}
      tamanho="md"
      titulo={titulo}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-[color:var(--muted)]">
            {modoEdicao
              ? "Atualize sua avaliação como achar melhor"
              : "Sua avaliação ajuda outros clientes"}
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const ativo = (hover || nota) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNota(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                  className="rounded-lg p-1 transition hover:scale-110"
                >
                  <Star
                    size={36}
                    className={
                      ativo
                        ? "fill-[color:var(--warning)] text-[color:var(--warning)]"
                        : "text-[color:var(--border)]"
                    }
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[color:var(--muted)]">
            {nota === 0 && "Toque nas estrelas pra avaliar"}
            {nota === 1 && "Péssimo"}
            {nota === 2 && "Ruim"}
            {nota === 3 && "Razoável"}
            {nota === 4 && "Bom"}
            {nota === 5 && "Excelente"}
          </p>
        </div>

        <AreaTexto
          label="Comentário"
          value={comentario}
          onChange={setComentario}
          placeholder="Conte como foi a experiência (opcional)..."
          rows={4}
        />

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            onPress={() => aoFechar(false)}
            isDisabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onPress={handleEnviar}
            isDisabled={enviando}
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            {enviando
              ? "Salvando..."
              : modoEdicao
                ? "Salvar alterações"
                : "Enviar avaliação"}
          </Button>
        </div>
      </div>
    </Dialogo>
  );
}
