import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Spinner } from "@heroui/react";
import { X, Inbox, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  listarSolicitacoesPorUsuario,
  atualizarStatusSolicitacao,
} from "../../api/requests.api";
import { listarServicosPorArtista } from "../../api/servicos.api";
import { listarMinhasReviews } from "../../api/reviews.api";
import type { Solicitacao, StatusSolicitacao } from "../../tipos/requests";
import type { Service } from "../../tipos/servicos";
import type { Review } from "../../tipos/reviews";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { CardSolicitacao } from "../../componentes/requests";
import { AvaliarModal } from "../../componentes/reviews";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";

type AcaoStatus = {
  solicitacao: Solicitacao;
  novoStatus: Exclude<StatusSolicitacao, "pending">;
  titulo: string;
  mensagem: string;
  destrutivo?: boolean;
  textoConfirmar: string;
  sucesso?: string;
};

export default function SolicitacoesClientePagina() {
  const { usuario } = useAutenticacao();
  const userId = usuario?.sub;
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [servicos, setServicos] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avaliarSolic, setAvaliarSolic] = useState<Solicitacao | null>(null);
  const [editarReview, setEditarReview] = useState<Review | null>(null);
  const [acaoStatus, setAcaoStatus] = useState<AcaoStatus | null>(null);
  const [processando, setProcessando] = useState(false);

  async function carregar() {
    if (!userId) return;
    setCarregando(true);
    try {
      const [dados, minhasReviews] = await Promise.all([
        listarSolicitacoesPorUsuario(userId),
        listarMinhasReviews().catch(() => [] as Review[]),
      ]);
      setSolicitacoes(dados);
      setReviews(minhasReviews);

      const idsArtistas = Array.from(new Set(dados.map((d) => d.artistId)));
      const todosServicos = await Promise.all(
        idsArtistas.map((aid) =>
          listarServicosPorArtista(aid).catch(() => [])
        )
      );
      setServicos(todosServicos.flat());
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar solicitações");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [userId]);

  const reviewsPorRequest = useMemo(() => {
    const m = new Map<string, Review>();
    for (const r of reviews) m.set(r.requestId, r);
    return m;
  }, [reviews]);

  async function executarAcao() {
    if (!acaoStatus) return;
    setProcessando(true);
    try {
      await atualizarStatusSolicitacao(
        acaoStatus.solicitacao.id,
        acaoStatus.novoStatus,
      );
      avisoSucesso(acaoStatus.sucesso ?? "Status atualizado");
      setAcaoStatus(null);
      carregar();
    } catch (e: any) {
      avisoErro(
        e?.response?.data?.message ??
          e?.message ??
          "Erro ao atualizar solicitação",
      );
    } finally {
      setProcessando(false);
    }
  }

  const grupos = useMemo(() => {
    const ativas = solicitacoes.filter((s) =>
      ["pending", "accepted"].includes(s.status),
    );
    const aguardandoConfirmacao = solicitacoes.filter(
      (s) => s.status === "awaiting_confirmation",
    );
    const finalizadas = solicitacoes.filter((s) => s.status === "completed");
    const inativas = solicitacoes.filter((s) =>
      ["rejected", "cancelled"].includes(s.status),
    );
    return { ativas, aguardandoConfirmacao, finalizadas, inativas };
  }, [solicitacoes]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-gradient-brand">
          Minhas solicitações
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Acompanhe o status dos serviços que você solicitou
        </p>
      </header>

      {carregando ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="accent" />
        </div>
      ) : solicitacoes.length === 0 ? (
        <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--surface)] text-[color:var(--muted)]">
              <Inbox size={32} />
            </span>
            <h3 className="font-display text-xl font-bold">
              Nenhuma solicitação ainda
            </h3>
            <p className="max-w-md text-sm text-[color:var(--muted)]">
              Encontre um artista no painel "Artistas" e clique em "Solicitar
              serviço" no perfil dele.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {grupos.ativas.length > 0 && (
            <Secao titulo="Em andamento">
              {grupos.ativas.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="cliente"
                  servicos={servicos}
                  acoes={[
                    {
                      label: "Cancelar",
                      variant: "danger-soft",
                      onPress: () =>
                        setAcaoStatus({
                          solicitacao: s,
                          novoStatus: "cancelled",
                          titulo: "Cancelar solicitação?",
                          mensagem:
                            "O artista será notificado e o horário (se já reservado) volta pra agenda dele.",
                          destrutivo: true,
                          textoConfirmar: "Sim, cancelar",
                          sucesso: "Solicitação cancelada",
                        }),
                      icone: <X size={14} />,
                    },
                  ]}
                />
              ))}
            </Secao>
          )}

          {grupos.aguardandoConfirmacao.length > 0 && (
            <Secao
              titulo="Aguardando sua confirmação"
              destaque
              count={grupos.aguardandoConfirmacao.length}
            >
              {grupos.aguardandoConfirmacao.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="cliente"
                  servicos={servicos}
                  acoes={[
                    {
                      label: "Confirmar recebimento",
                      variant: "primary",
                      className:
                        "bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30",
                      onPress: () =>
                        setAcaoStatus({
                          solicitacao: s,
                          novoStatus: "completed",
                          titulo: "Confirmar que o serviço foi realizado?",
                          mensagem:
                            "Ao confirmar, a solicitação fica concluída e você poderá avaliar o artista.",
                          textoConfirmar: "Sim, foi realizado",
                          sucesso: "Serviço confirmado! Agora você pode avaliar.",
                        }),
                      icone: <CheckCircle2 size={14} />,
                    },
                    {
                      label: "Não foi realizado",
                      variant: "danger-soft",
                      onPress: () =>
                        setAcaoStatus({
                          solicitacao: s,
                          novoStatus: "accepted",
                          titulo: "Marcar como não realizado?",
                          mensagem:
                            "A solicitação volta pra 'em andamento'. O artista poderá tentar marcar como realizado de novo.",
                          textoConfirmar: "Sim, não foi realizado",
                          sucesso:
                            "Solicitação retornou pra 'em andamento'",
                          destrutivo: true,
                        }),
                      icone: <AlertTriangle size={14} />,
                    },
                  ]}
                />
              ))}
            </Secao>
          )}

          {grupos.finalizadas.length > 0 && (
            <Secao titulo="Concluídas">
              {grupos.finalizadas.map((s) => {
                const reviewExistente = reviewsPorRequest.get(s.id);
                return (
                  <CardSolicitacao
                    key={s.id}
                    solicitacao={s}
                    modo="cliente"
                    servicos={servicos}
                    podeAvaliar={!reviewExistente}
                    onAvaliar={() => setAvaliarSolic(s)}
                    reviewExistente={reviewExistente}
                    onEditarReview={
                      reviewExistente
                        ? () => setEditarReview(reviewExistente)
                        : undefined
                    }
                  />
                );
              })}
            </Secao>
          )}

          {grupos.inativas.length > 0 && (
            <Secao titulo="Recusadas/canceladas">
              {grupos.inativas.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="cliente"
                  servicos={servicos}
                />
              ))}
            </Secao>
          )}
        </>
      )}

      <ConfirmacaoModal
        aberto={!!acaoStatus}
        aoFechar={(open) => !open && setAcaoStatus(null)}
        titulo={acaoStatus?.titulo ?? ""}
        mensagem={acaoStatus?.mensagem ?? ""}
        textoConfirmar={acaoStatus?.textoConfirmar ?? "Confirmar"}
        textoCancelar="Voltar"
        variante={acaoStatus?.destrutivo ? "destrutivo" : "padrao"}
        carregando={processando}
        onConfirmar={executarAcao}
      />

      {avaliarSolic && userId && (
        <AvaliarModal
          aberto={!!avaliarSolic}
          aoFechar={(open) => !open && setAvaliarSolic(null)}
          requestId={avaliarSolic.id}
          onSucesso={() => {
            setAvaliarSolic(null);
            carregar();
          }}
        />
      )}

      {editarReview && (
        <AvaliarModal
          aberto={!!editarReview}
          aoFechar={(open) => !open && setEditarReview(null)}
          reviewInicial={editarReview}
          onSucesso={() => {
            setEditarReview(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function Secao({
  titulo,
  destaque,
  count,
  children,
}: {
  titulo: string;
  destaque?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2
          className={
            destaque
              ? "font-display text-lg font-bold text-gradient-brand"
              : "text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]"
          }
        >
          {titulo}
        </h2>
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
