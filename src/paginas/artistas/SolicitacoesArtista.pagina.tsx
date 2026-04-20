import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Spinner } from "@heroui/react";
import { Check, X, CheckCircle2, Inbox } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  listarSolicitacoesPorArtista,
  atualizarStatusSolicitacao,
} from "../../api/requests.api";
import { listarServicosPorArtista } from "../../api/servicos.api";
import type { Solicitacao, StatusSolicitacao } from "../../tipos/requests";
import type { Service } from "../../tipos/servicos";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { CardSolicitacao } from "../../componentes/requests";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";

type AcaoConfirmacao = {
  solicitacao: Solicitacao;
  novoStatus: Exclude<StatusSolicitacao, "pending">;
  titulo: string;
  mensagem: string;
  destrutivo?: boolean;
  textoConfirmar: string;
};

export default function SolicitacoesArtistaPagina() {
  const { usuario } = useAutenticacao();
  const artistId = usuario?.sub;
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmacao, setConfirmacao] = useState<AcaoConfirmacao | null>(null);
  const [processando, setProcessando] = useState(false);

  async function carregar() {
    if (!artistId) return;
    setCarregando(true);
    try {
      const [sols, servs] = await Promise.all([
        listarSolicitacoesPorArtista(artistId),
        listarServicosPorArtista(artistId).catch(() => [] as Service[]),
      ]);
      setSolicitacoes(sols);
      setServicos(servs);
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao carregar solicitações");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [artistId]);

  async function executarAcao() {
    if (!confirmacao) return;
    setProcessando(true);
    try {
      await atualizarStatusSolicitacao(
        confirmacao.solicitacao.id,
        confirmacao.novoStatus
      );
      avisoSucesso("Status atualizado!");
      setConfirmacao(null);
      carregar();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar status");
    } finally {
      setProcessando(false);
    }
  }

  const grupos = useMemo(() => {
    const pendentes = solicitacoes.filter((s) => s.status === "pending");
    const aceitas = solicitacoes.filter((s) => s.status === "accepted");
    const finalizadas = solicitacoes.filter((s) =>
      ["completed", "rejected", "cancelled"].includes(s.status)
    );
    return { pendentes, aceitas, finalizadas };
  }, [solicitacoes]);

  function acoesParaSolicitacao(s: Solicitacao) {
    if (s.status === "pending") {
      return [
        {
          label: "Aceitar",
          variant: "primary" as const,
          icone: <Check size={14} />,
          className: "bg-gradient-brand font-semibold text-white",
          onPress: () =>
            setConfirmacao({
              solicitacao: s,
              novoStatus: "accepted",
              titulo: "Aceitar solicitação?",
              mensagem:
                "Ao aceitar, o cliente é notificado e a data fica reservada na sua agenda.",
              textoConfirmar: "Aceitar",
            }),
        },
        {
          label: "Recusar",
          variant: "danger-soft" as const,
          icone: <X size={14} />,
          onPress: () =>
            setConfirmacao({
              solicitacao: s,
              novoStatus: "rejected",
              titulo: "Recusar solicitação?",
              mensagem: "O cliente será notificado da recusa.",
              destrutivo: true,
              textoConfirmar: "Recusar",
            }),
        },
      ];
    }
    if (s.status === "accepted") {
      return [
        {
          label: "Marcar como concluída",
          variant: "primary" as const,
          icone: <CheckCircle2 size={14} />,
          className: "bg-gradient-brand font-semibold text-white",
          onPress: () =>
            setConfirmacao({
              solicitacao: s,
              novoStatus: "completed",
              titulo: "Marcar como concluída?",
              mensagem:
                "Indique que o serviço foi prestado. O cliente poderá te avaliar.",
              textoConfirmar: "Concluir",
            }),
        },
      ];
    }
    return [];
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-gradient-brand">
          Solicitações recebidas
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Aceite, recuse ou conclua os pedidos dos seus clientes
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
              Quando um cliente solicitar um serviço, você verá aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {grupos.pendentes.length > 0 && (
            <Secao
              titulo="Aguardando sua resposta"
              destaque
              count={grupos.pendentes.length}
            >
              {grupos.pendentes.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="artista"
                  servicos={servicos}
                  acoes={acoesParaSolicitacao(s)}
                />
              ))}
            </Secao>
          )}

          {grupos.aceitas.length > 0 && (
            <Secao titulo="Aceitas (em andamento)">
              {grupos.aceitas.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="artista"
                  servicos={servicos}
                  acoes={acoesParaSolicitacao(s)}
                />
              ))}
            </Secao>
          )}

          {grupos.finalizadas.length > 0 && (
            <Secao titulo="Histórico">
              {grupos.finalizadas.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="artista"
                  servicos={servicos}
                />
              ))}
            </Secao>
          )}
        </>
      )}

      <ConfirmacaoModal
        aberto={!!confirmacao}
        aoFechar={(open) => !open && setConfirmacao(null)}
        titulo={confirmacao?.titulo ?? ""}
        mensagem={confirmacao?.mensagem ?? ""}
        textoConfirmar={confirmacao?.textoConfirmar ?? "Confirmar"}
        variante={confirmacao?.destrutivo ? "destrutivo" : "padrao"}
        carregando={processando}
        onConfirmar={executarAcao}
      />
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
