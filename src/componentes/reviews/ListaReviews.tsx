import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, Spinner } from "@heroui/react";
import {
  MessageCircle,
  Pencil,
  Reply,
  Star,
  Trash2,
} from "lucide-react";
import type { Review } from "../../tipos/reviews";
import {
  excluirRespostaReview,
  excluirReview,
  listarReviewsPorArtista,
  responderReview,
} from "../../api/reviews.api";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { AreaTexto } from "../ui/Campo";
import { ConfirmacaoModal } from "../ui/ConfirmacaoModal";
import { AvaliarModal } from "./AvaliarModal";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { Dialogo } from "../ui/Dialogo";

interface ListaReviewsProps {
  artistId: string;
  /** Limite inicial; quando excedido, exibe botão "Ver todas". Default 5. */
  limite?: number;
}

type Ordenacao = "recente" | "antiga" | "maior" | "menor";

export function ListaReviews({ artistId, limite = 5 }: ListaReviewsProps) {
  const { usuario, userType } = useAutenticacao();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [filtroEstrelas, setFiltroEstrelas] = useState<number | null>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recente");
  const [verTodas, setVerTodas] = useState(false);

  const [editando, setEditando] = useState<Review | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState<Review | null>(null);
  const [respondendo, setRespondendo] = useState<Review | null>(null);

  async function carregar() {
    if (!artistId) return;
    setCarregando(true);
    try {
      const dados = await listarReviewsPorArtista(artistId);
      setReviews(dados);
    } catch {
      setReviews([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId]);

  const media = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const distribuicao = useMemo(() => {
    const dist: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const r of reviews) {
      const n = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      dist[n]++;
    }
    return dist;
  }, [reviews]);

  const filtradas = useMemo(() => {
    let r = filtroEstrelas
      ? reviews.filter((rv) => Math.round(rv.rating) === filtroEstrelas)
      : reviews;
    r = [...r].sort((a, b) => {
      if (ordenacao === "recente") {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      }
      if (ordenacao === "antiga") {
        return (a.createdAt || "").localeCompare(b.createdAt || "");
      }
      if (ordenacao === "maior") return b.rating - a.rating;
      if (ordenacao === "menor") return a.rating - b.rating;
      return 0;
    });
    return r;
  }, [reviews, filtroEstrelas, ordenacao]);

  const exibidas = verTodas ? filtradas : filtradas.slice(0, limite);

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
    <div className="flex flex-col gap-5">
      <ResumoReviews
        media={media}
        total={reviews.length}
        distribuicao={distribuicao}
        filtroAtivo={filtroEstrelas}
        onFiltrar={(n) => {
          setFiltroEstrelas(filtroEstrelas === n ? null : n);
          setVerTodas(false);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[color:var(--muted)]">
          {filtradas.length}{" "}
          {filtradas.length === 1 ? "avaliação" : "avaliações"}
          {filtroEstrelas && ` filtrada${filtradas.length > 1 ? "s" : ""}`}
        </p>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[color:var(--muted)]">Ordenar:</label>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className="rounded-lg border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-2 py-1 text-xs text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
          >
            <option value="recente">Mais recentes</option>
            <option value="antiga">Mais antigas</option>
            <option value="maior">Maior nota</option>
            <option value="menor">Menor nota</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {exibidas.map((r) => {
          const meuId = usuario?.sub;
          const ehMinha =
            userType === "client" && meuId === extractId(r.userId);
          const souArtistaDono =
            userType === "artist" && meuId === r.artistId;
          return (
            <CardReview
              key={r.id}
              review={r}
              podeEditar={ehMinha}
              podeExcluir={ehMinha}
              podeResponder={souArtistaDono && !r.artistReply}
              podeExcluirResposta={souArtistaDono && !!r.artistReply}
              onEditar={() => setEditando(r)}
              onExcluir={() => setConfirmarExcluir(r)}
              onResponder={() => setRespondendo(r)}
              onExcluirResposta={async () => {
                try {
                  await excluirRespostaReview(r.id);
                  avisoSucesso("Resposta removida");
                  await carregar();
                } catch (e: any) {
                  avisoErro(e?.response?.data?.message ?? "Erro ao remover");
                }
              }}
            />
          );
        })}
      </div>

      {!verTodas && filtradas.length > limite && (
        <Button
          variant="ghost"
          onPress={() => setVerTodas(true)}
          className="self-center"
        >
          Ver todas as {filtradas.length} avaliações
        </Button>
      )}

      {editando && (
        <AvaliarModal
          aberto
          aoFechar={() => setEditando(null)}
          reviewInicial={editando}
          onSucesso={async () => {
            setEditando(null);
            await carregar();
          }}
        />
      )}

      <ConfirmacaoModal
        aberto={!!confirmarExcluir}
        aoFechar={() => setConfirmarExcluir(null)}
        titulo="Excluir avaliação?"
        mensagem="Essa ação não pode ser desfeita."
        textoConfirmar="Excluir"
        variante="destrutivo"
        onConfirmar={async () => {
          if (!confirmarExcluir) return;
          try {
            await excluirReview(confirmarExcluir.id);
            avisoSucesso("Avaliação excluída");
            setConfirmarExcluir(null);
            await carregar();
          } catch (e: any) {
            avisoErro(e?.response?.data?.message ?? "Erro ao excluir");
          }
        }}
      />

      {respondendo && (
        <ResponderModal
          review={respondendo}
          aoFechar={() => setRespondendo(null)}
          onSucesso={async () => {
            setRespondendo(null);
            await carregar();
          }}
        />
      )}
    </div>
  );
}

// =========================== Sub-componentes ===========================

interface ResumoProps {
  media: number;
  total: number;
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
  filtroAtivo: number | null;
  onFiltrar: (n: number) => void;
}

function ResumoReviews({
  media,
  total,
  distribuicao,
  filtroAtivo,
  onFiltrar,
}: ResumoProps) {
  return (
    <div className="grid gap-4 rounded-2xl bg-[color:var(--surface-secondary)] p-4 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center justify-center gap-1 sm:border-r sm:border-[color:var(--border)] sm:pr-4">
        <span className="font-display text-4xl font-black text-gradient-brand">
          {media.toFixed(1)}
        </span>
        <Estrelas valor={media} tamanho={14} />
        <span className="text-xs text-[color:var(--muted)]">
          {total} {total === 1 ? "avaliação" : "avaliações"}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const count = distribuicao[n];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const ativo = filtroAtivo === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onFiltrar(n)}
              title={`Filtrar por ${n} estrelas`}
              className={`flex items-center gap-2 rounded-md px-1.5 py-0.5 text-xs transition hover:bg-[color:var(--surface)] ${ativo ? "bg-[color:var(--surface)] ring-1 ring-[color:var(--accent)]" : ""}`}
            >
              <span className="w-3 text-right">{n}</span>
              <Star
                size={12}
                className="fill-[color:var(--warning)] text-[color:var(--warning)]"
              />
              <div
                role="progressbar"
                aria-label={`${pct}% das avaliações têm ${n} estrelas`}
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--border)]/40"
              >
                <div
                  className="h-full rounded-full bg-gradient-brand transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-[color:var(--muted)]">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CardReviewProps {
  review: Review;
  podeEditar: boolean;
  podeExcluir: boolean;
  podeResponder: boolean;
  podeExcluirResposta: boolean;
  onEditar: () => void;
  onExcluir: () => void;
  onResponder: () => void;
  onExcluirResposta: () => void;
}

function CardReview({
  review,
  podeEditar,
  podeExcluir,
  podeResponder,
  podeExcluirResposta,
  onEditar,
  onExcluir,
  onResponder,
  onExcluirResposta,
}: CardReviewProps) {
  const nome = review.userName || "Anônimo";
  const inicial = nome.charAt(0).toUpperCase();
  const dataReview = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("pt-BR")
    : "";

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white">
              {inicial}
            </div>
            <div>
              <p className="text-sm font-semibold">{nome}</p>
              <div className="flex items-center gap-2">
                <Estrelas valor={review.rating} tamanho={12} />
                {dataReview && (
                  <span className="text-xs text-[color:var(--muted)]">
                    {dataReview}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {podeEditar && (
              <Button
                size="sm"
                isIconOnly
                variant="ghost"
                onPress={onEditar}
                aria-label="Editar"
              >
                <Pencil size={14} />
              </Button>
            )}
            {podeExcluir && (
              <Button
                size="sm"
                isIconOnly
                variant="ghost"
                onPress={onExcluir}
                aria-label="Excluir"
                className="text-[color:var(--danger)]"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {review.comment && (
          <p className="text-sm leading-relaxed">{review.comment}</p>
        )}

        {review.artistReply && (
          <div className="rounded-xl border-l-4 border-[color:var(--accent)] bg-[color:var(--surface-secondary)] p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--accent)]">
                <MessageCircle size={12} />
                Resposta do artista
              </div>
              {podeExcluirResposta && (
                <Button
                  size="sm"
                  isIconOnly
                  variant="ghost"
                  onPress={onExcluirResposta}
                  aria-label="Excluir resposta"
                  className="text-[color:var(--danger)]"
                >
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
            <p className="text-sm leading-relaxed">{review.artistReply.text}</p>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              {new Date(review.artistReply.repliedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}

        {podeResponder && (
          <Button
            size="sm"
            variant="ghost"
            onPress={onResponder}
            className="self-start text-[color:var(--accent)]"
          >
            <Reply size={14} className="mr-1" />
            Responder
          </Button>
        )}
      </CardContent>
    </Card>
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

// =========================== Modal de resposta do artista ==============

interface ResponderModalProps {
  review: Review;
  aoFechar: () => void;
  onSucesso: () => void | Promise<void>;
}

function ResponderModal({ review, aoFechar, onSucesso }: ResponderModalProps) {
  const [texto, setTexto] = useState(review.artistReply?.text ?? "");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!texto.trim()) {
      avisoErro("Escreva uma resposta");
      return;
    }
    setEnviando(true);
    try {
      await responderReview(review.id, texto.trim());
      avisoSucesso("Resposta publicada");
      await onSucesso();
    } catch (e: any) {
      avisoErro(e?.response?.data?.message ?? "Erro ao responder");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialogo
      aberto
      aoFechar={(open) => !open && aoFechar()}
      tamanho="md"
      titulo="Responder avaliação"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-[color:var(--surface-secondary)] p-3 text-sm">
          <div className="mb-1 flex items-center gap-2">
            <Estrelas valor={review.rating} tamanho={12} />
            <span className="text-xs text-[color:var(--muted)]">
              {review.userName || "Anônimo"}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm italic">"{review.comment}"</p>
          )}
        </div>

        <AreaTexto
          label="Sua resposta"
          value={texto}
          onChange={setTexto}
          rows={4}
          placeholder="Agradeça o feedback, esclareça pontos, etc."
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onPress={aoFechar} isDisabled={enviando}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onPress={enviar}
            isDisabled={enviando}
            className="bg-gradient-brand font-semibold text-white"
          >
            {enviando ? "Enviando..." : "Publicar resposta"}
          </Button>
        </div>
      </div>
    </Dialogo>
  );
}

function extractId(userId: Review["userId"]): string {
  if (typeof userId === "string") return userId;
  return String(userId?._id ?? "");
}
