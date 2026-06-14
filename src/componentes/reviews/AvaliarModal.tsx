import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Star } from "lucide-react";
import { Dialogo } from "../ui/Dialogo";
import { AreaTexto } from "../ui/Campo";
import { atualizarReview, criarReview } from "../../api/reviews.api";
import type { Review } from "../../tipos/reviews";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

interface AvaliarModalProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  /** ID da solicitação que está sendo avaliada (obrigatório em modo criar) */
  requestId?: string;
  artistNome?: string;
  /** Se passada, modal entra em modo "editar" (PATCH) */
  reviewInicial?: Review | null;
  onSucesso?: () => void;
}

export function AvaliarModal({
  aberto,
  aoFechar,
  requestId,
  artistNome,
  reviewInicial,
  onSucesso,
}: AvaliarModalProps) {
  const modoEdicao = !!reviewInicial;
  const [rating, setRating] = useState(reviewInicial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState(reviewInicial?.comment ?? "");
  const [enviando, setEnviando] = useState(false);

  // Re-sincroniza quando reviewInicial muda (ex: troca de review no mesmo modal)
  useEffect(() => {
    if (aberto) {
      setRating(reviewInicial?.rating ?? 0);
      setComentario(reviewInicial?.comment ?? "");
    }
  }, [aberto, reviewInicial]);

  function reset() {
    setRating(0);
    setHover(0);
    setComentario("");
  }

  async function handleEnviar() {
    if (rating < 1) {
      avisoErro("Selecione uma nota de 1 a 5 estrelas");
      return;
    }
    setEnviando(true);
    try {
      if (modoEdicao && reviewInicial) {
        await atualizarReview(reviewInicial.id, {
          rating,
          comment: comentario.trim() || undefined,
        });
        avisoSucesso("Avaliação atualizada");
      } else {
        if (!requestId) {
          avisoErro("Solicitação não informada");
          return;
        }
        await criarReview({
          requestId,
          rating,
          comment: comentario.trim() || undefined,
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
    : artistNome
      ? `Avaliar ${artistNome}`
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
              const ativo = (hover || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
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
            {rating === 0 && "Toque nas estrelas pra avaliar"}
            {rating === 1 && "Péssimo"}
            {rating === 2 && "Ruim"}
            {rating === 3 && "Razoável"}
            {rating === 4 && "Bom"}
            {rating === 5 && "Excelente"}
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
