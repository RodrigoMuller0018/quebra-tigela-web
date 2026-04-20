import { useEffect, useState } from "react";
import { Button, Card, CardContent } from "@heroui/react";
import { Calendar, MapPin, FileText, Star } from "lucide-react";
import type { Solicitacao } from "../../tipos/requests";
import { STATUS_LABELS, STATUS_TONE } from "../../tipos/requests";
import type { Service } from "../../tipos/servicos";
import type { Artista } from "../../tipos/artistas";
import { obterArtistaPorId } from "../../api/artistas.api";

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
  servicos?: Service[];
  acoes?: AcaoBotao[];
  /** Mostrar botão "Avaliar" (somente cliente, status completed) */
  podeAvaliar?: boolean;
  onAvaliar?: () => void;
}

export function CardSolicitacao({
  solicitacao,
  modo,
  servicos,
  acoes = [],
  podeAvaliar,
  onAvaliar,
}: CardSolicitacaoProps) {
  const [artista, setArtista] = useState<Artista | null>(null);

  // No modo cliente, buscar nome do artista
  useEffect(() => {
    if (modo !== "cliente" || !solicitacao.artistId) return;
    obterArtistaPorId(solicitacao.artistId)
      .then(setArtista)
      .catch(() => setArtista(null));
  }, [modo, solicitacao.artistId]);

  const servico = servicos?.find((s) => s._id === solicitacao.serviceId);

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(solicitacao.eventDate));

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:border-[color:var(--accent)]/40">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {modo === "cliente" && artista && (
              <h3 className="font-display text-base font-bold">
                {artista.name}
              </h3>
            )}
            {servico && (
              <p className="text-sm font-medium text-[color:var(--accent)]">
                {servico.title}
              </p>
            )}
            {!servico && (
              <p className="text-xs text-[color:var(--muted)]">
                Serviço #{solicitacao.serviceId.slice(-6)}
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
          <p className="flex items-center gap-1.5">
            <Calendar size={14} />
            {dataFormatada}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin size={14} />
            {solicitacao.location}
          </p>
          {solicitacao.details && (
            <p className="flex items-start gap-1.5">
              <FileText size={14} className="mt-0.5 shrink-0" />
              <span className="text-[color:var(--foreground)]">
                {solicitacao.details}
              </span>
            </p>
          )}
        </div>

        {(acoes.length > 0 || podeAvaliar) && (
          <div className="flex flex-wrap gap-2 pt-1">
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
