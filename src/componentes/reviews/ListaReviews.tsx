import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Spinner } from "@heroui/react";
import { Star } from "lucide-react";
import type { Review } from "../../tipos/reviews";
import { listarReviewsPorArtista } from "../../api/reviews.api";

interface ListaReviewsProps {
  artistId: string;
  /** Limite de avaliações a mostrar; default mostra todas */
  limite?: number;
}

export function ListaReviews({ artistId, limite }: ListaReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!artistId) return;
    setCarregando(true);
    listarReviewsPorArtista(artistId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setCarregando(false));
  }, [artistId]);

  const exibidas = useMemo(
    () => (limite ? reviews.slice(0, limite) : reviews),
    [reviews, limite]
  );

  const media = useMemo(() => {
    if (reviews.length === 0) return 0;
    const soma = reviews.reduce((acc, r) => acc + r.rating, 0);
    return soma / reviews.length;
  }, [reviews]);

  if (carregando) {
    return (
      <div className="flex justify-center py-6">
        <Spinner color="accent" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <CardContent className="py-6 text-center text-sm text-[color:var(--muted)]">
          Ainda não há avaliações
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-[color:var(--surface-secondary)] p-4">
        <div className="flex flex-col items-center">
          <span className="font-display text-3xl font-black text-gradient-brand">
            {media.toFixed(1)}
          </span>
          <Estrelas valor={media} tamanho={14} />
        </div>
        <div className="text-sm text-[color:var(--muted)]">
          <div>
            Baseado em <strong>{reviews.length}</strong>
          </div>
          <div>avaliação{reviews.length > 1 ? "ões" : ""}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {exibidas.map((r) => (
          <Card
            key={r.id}
            className="border border-[color:var(--border)] bg-[color:var(--surface)]"
          >
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Estrelas valor={r.rating} />
                {r.createdAt && (
                  <span className="text-xs text-[color:var(--muted)]">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              {r.comment && (
                <p className="text-sm leading-relaxed">{r.comment}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {limite && reviews.length > limite && (
        <p className="text-center text-xs text-[color:var(--muted)]">
          Mostrando {limite} de {reviews.length} avaliações
        </p>
      )}
    </div>
  );
}

function Estrelas({ valor, tamanho = 16 }: { valor: number; tamanho?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={tamanho}
          className={
            n <= Math.round(valor)
              ? "fill-[color:var(--warning)] text-[color:var(--warning)]"
              : "text-[color:var(--border)]"
          }
        />
      ))}
    </div>
  );
}
