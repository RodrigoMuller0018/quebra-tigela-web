import { useEffect, useState } from "react";
import { Button, Card, CardContent } from "@heroui/react";
import {
  Calendar,
  MapPin,
  FileText,
  Star,
  Clock,
  Pencil,
  MessageCircle,
} from "lucide-react";
import { montarLinkWhatsApp } from "../../utilitarios/telefone";
import { dentroDaJanelaEdicao } from "../../utilitarios/reviewsJanela";
import type { Solicitacao } from "../../tipos/requests";
import { STATUS_LABELS, STATUS_TONE } from "../../tipos/requests";
import type { Servico } from "../../tipos/servicos";
import type { Artista } from "../../tipos/artistas";
import type { Avaliacao } from "../../tipos/reviews";
import { obterArtistaPorId } from "../../api/artistas.api";
import {
  ehMesmoDiaLocal,
  formatarDataLocal,
  formatarHoraLocal,
  formatarInstant,
} from "../../utilitarios/instants";

interface AcaoBotao {
  label: string;
  variant?: "primary" | "danger" | "danger-soft" | "outline" | "ghost";
  onPress: () => void;
  className?: string;
  icone?: React.ReactNode;
}

interface CardSolicitacaoProps {
  solicitacao: Solicitacao;
  /** Mostra dados do artista (use no modo cliente) ou do cliente (modo artista) */
  modo: "cliente" | "artista";
  /** Lista de serviços pra resolver o nome do serviço pelo serviceId */
  servicos?: Servico[];
  acoes?: AcaoBotao[];
  /** Mostrar botão "Avaliar" (somente cliente, status completed, sem review ainda) */
  podeAvaliar?: boolean;
  onAvaliar?: () => void;
  /** Avaliacao já feita pra essa solicitação (mostra badge + botão editar) */
  reviewExistente?: Avaliacao;
  onEditarAvaliacao?: () => void;
}

export function CardSolicitacao({
  solicitacao,
  modo,
  servicos,
  acoes = [],
  podeAvaliar,
  onAvaliar,
  reviewExistente,
  onEditarAvaliacao,
}: CardSolicitacaoProps) {
  const [artista, setArtista] = useState<Artista | null>(null);

  // No modo cliente, buscar nome do artista
  useEffect(() => {
    if (modo !== "cliente" || !solicitacao.artistaId) return;
    obterArtistaPorId(solicitacao.artistaId)
      .then(setArtista)
      .catch(() => setArtista(null));
  }, [modo, solicitacao.artistaId]);

  const servico = servicos?.find((s) => s._id === solicitacao.servicoId);

  const mesmoDia = ehMesmoDiaLocal(
    solicitacao.inicio,
    solicitacao.fim,
  );

  // WhatsApp aparece só no modo cliente, com solicitação confirmada
  // (não pra concluída — evento já passou, sem motivo pra continuar conversa).
  const podeFalarWhatsApp =
    modo === "cliente" &&
    !!artista?.telefone &&
    solicitacao.status === "aceita";

  const linkWhatsApp = podeFalarWhatsApp
    ? montarLinkWhatsApp(
        artista!.telefone!,
        montarMensagemContexto({
          nomeArtista: artista?.nome,
          servico: servico?.titulo,
          inicio: solicitacao.inicio,
          fim: solicitacao.fim,
        }),
      )
    : null;

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:border-[color:var(--accent)]/40">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {modo === "cliente" && artista && (
              <h3 className="font-display text-base font-bold">
                {artista.nome}
              </h3>
            )}
            {servico && (
              <p className="text-sm font-medium text-[color:var(--accent)]">
                {servico.titulo}
              </p>
            )}
            {!servico && (
              <p className="text-xs text-[color:var(--muted)]">
                Serviço #{solicitacao.servicoId?.slice(-6)}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[solicitacao.status]}`}
          >
            {STATUS_LABELS[solicitacao.status]}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-[color:var(--muted)]">
          {mesmoDia ? (
            <>
              <p className="flex items-center gap-1.5">
                <Calendar size={14} />
                {formatarDataLocal(solicitacao.inicio)}
              </p>
              <p className="flex items-center gap-1.5">
                <Clock size={14} />
                {formatarHoraLocal(solicitacao.inicio)} →{" "}
                {formatarHoraLocal(solicitacao.fim)}
              </p>
            </>
          ) : (
            <p className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatarInstant(solicitacao.inicio)} →{" "}
              {formatarInstant(solicitacao.fim)}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <MapPin size={14} />
            {solicitacao.local}
          </p>
          {solicitacao.detalhes && (
            <p className="flex items-start gap-1.5">
              <FileText size={14} className="mt-0.5 shrink-0" />
              <span className="text-[color:var(--foreground)]">
                {solicitacao.detalhes}
              </span>
            </p>
          )}
        </div>

        {reviewExistente && (
          <div className="rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
                  Sua avaliação:
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={12}
                      className={
                        n <= reviewExistente.nota
                          ? "fill-[color:var(--warning)] text-[color:var(--warning)]"
                          : "text-[color:var(--border)]"
                      }
                    />
                  ))}
                </div>
              </div>
              {onEditarAvaliacao &&
                dentroDaJanelaEdicao(reviewExistente.criadaEm) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={onEditarAvaliacao}
                    className="text-[color:var(--accent)]"
                  >
                    <Pencil size={12} className="mr-1" />
                    Editar
                  </Button>
                )}
            </div>
            {reviewExistente.comentario && (
              <p className="mt-1 text-xs italic text-[color:var(--muted)]">
                "{reviewExistente.comentario}"
              </p>
            )}
            {reviewExistente.respostaArtista && (
              <div className="mt-2 rounded-lg border-l-2 border-[color:var(--secondary)] bg-[color:var(--surface-secondary)] px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[color:var(--secondary)]">
                  <MessageCircle size={12} />
                  Resposta do artista
                </div>
                <p className="mt-0.5 text-xs leading-relaxed">
                  {reviewExistente.respostaArtista.texto}
                </p>
              </div>
            )}
          </div>
        )}

        {(acoes.length > 0 || (podeAvaliar && onAvaliar) || linkWhatsApp) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {linkWhatsApp && (
              <a
                href={linkWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1ebe5d]"
              >
                <MessageCircle size={14} className="mr-1" />
                Falar no WhatsApp
              </a>
            )}
            {acoes.map((a, i) => (
              <Button
                key={i}
                variant={a.variant ?? "outline"}
                size="sm"
                onPress={a.onPress}
                className={a.className}
              >
                {a.icone && <span className="mr-1">{a.icone}</span>}
                {a.label}
              </Button>
            ))}
            {podeAvaliar && onAvaliar && (
              <Button
                variant="primary"
                size="sm"
                onPress={onAvaliar}
                className="bg-gradient-brand font-semibold text-white"
              >
                <Star size={14} className="mr-1" />
                Avaliar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Mensagem contextual pro WhatsApp do artista. Tenta dar pra ele tudo que precisa
 * pra responder sem perguntas básicas: serviço, data e referência ao Quebra Tigela.
 */
function montarMensagemContexto(args: {
  nomeArtista?: string;
  servico?: string;
  inicio: string;
  fim: string;
}): string {
  const nome = args.nomeArtista?.split(" ")[0] ?? "tudo bem";
  const servico = args.servico ?? "o serviço solicitado";
  const dataInicio = formatarDataLocal(args.inicio);
  const horaInicio = formatarHoraLocal(args.inicio);
  const mesmoDia = ehMesmoDiaLocal(args.inicio, args.fim);
  const horaFim = formatarHoraLocal(args.fim);
  const quando = mesmoDia
    ? `${dataInicio}, ${horaInicio} → ${horaFim}`
    : `${formatarInstant(args.inicio)} → ${formatarInstant(args.fim)}`;

  return (
    `Olá ${nome}! Sou um cliente do Quebra Tigela.\n\n` +
    `Você aceitou minha solicitação de ${servico} em ${quando}.\n\n` +
    `Quero combinar os detalhes com você.`
  );
}
