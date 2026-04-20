import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Spinner } from "@heroui/react";
import { X, Inbox } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  listarSolicitacoesPorUsuario,
  atualizarStatusSolicitacao,
} from "../../api/requests.api";
import { listarServicosPorArtista } from "../../api/servicos.api";
import type { Solicitacao } from "../../tipos/requests";
import type { Service } from "../../tipos/servicos";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { CardSolicitacao } from "../../componentes/requests";
import { AvaliarModal } from "../../componentes/reviews";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";

export default function SolicitacoesClientePagina() {
  const { usuario } = useAutenticacao();
  const userId = usuario?.sub;
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [servicos, setServicos] = useState<Service[]>([]);
  const [avaliarSolic, setAvaliarSolic] = useState<Solicitacao | null>(null);
  const [cancelarSolic, setCancelarSolic] = useState<Solicitacao | null>(null);
  const [processando, setProcessando] = useState(false);

  async function carregar() {
    if (!userId) return;
    setCarregando(true);
    try {
      const dados = await listarSolicitacoesPorUsuario(userId);
      setSolicitacoes(dados);

      // Carregar serviços únicos referenciados, agrupados por artista
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

  async function confirmarCancelamento() {
    if (!cancelarSolic) return;
    setProcessando(true);
    try {
      await atualizarStatusSolicitacao(cancelarSolic.id, "cancelled");
      avisoSucesso("Solicitação cancelada");
      setCancelarSolic(null);
      carregar();
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao cancelar");
    } finally {
      setProcessando(false);
    }
  }

  // Agrupar por status
  const grupos = useMemo(() => {
    const ativas = solicitacoes.filter((s) =>
      ["pending", "accepted"].includes(s.status)
    );
    const finalizadas = solicitacoes.filter((s) => s.status === "completed");
    const inativas = solicitacoes.filter((s) =>
      ["rejected", "cancelled"].includes(s.status)
    );
    return { ativas, finalizadas, inativas };
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
                      onPress: () => setCancelarSolic(s),
                      icone: <X size={14} />,
                    },
                  ]}
                />
              ))}
            </Secao>
          )}

          {grupos.finalizadas.length > 0 && (
            <Secao titulo="Concluídas">
              {grupos.finalizadas.map((s) => (
                <CardSolicitacao
                  key={s.id}
                  solicitacao={s}
                  modo="cliente"
                  servicos={servicos}
                  podeAvaliar
                  onAvaliar={() => setAvaliarSolic(s)}
                />
              ))}
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

      {/* Modal cancelar */}
      <ConfirmacaoModal
        aberto={!!cancelarSolic}
        aoFechar={(open) => !open && setCancelarSolic(null)}
        titulo="Cancelar solicitação?"
        mensagem="O artista será notificado. Esta ação não pode ser desfeita."
        textoConfirmar="Sim, cancelar"
        textoCancelar="Voltar"
        variante="destrutivo"
        carregando={processando}
        onConfirmar={confirmarCancelamento}
      />

      {/* Modal avaliar */}
      {avaliarSolic && userId && (
        <AvaliarModal
          aberto={!!avaliarSolic}
          aoFechar={(open) => !open && setAvaliarSolic(null)}
          artistId={avaliarSolic.artistId}
          userId={userId}
          onSucesso={() => setAvaliarSolic(null)}
        />
      )}
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">
        {titulo}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
