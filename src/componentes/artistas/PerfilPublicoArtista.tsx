import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Spinner,
} from "@heroui/react";
import { CheckCircle2, MapPin, Mail, MessageSquarePlus } from "lucide-react";
import type { Artista } from "../../tipos/artistas";
import type { Service } from "../../tipos/servicos";
import { AgendaCliente } from "../agenda";
import { ListaServicos } from "../servicos";
import { listarServicosPorArtista } from "../../api/servicos.api";
import { ListaReviews } from "../reviews";
import { SolicitarServicoModal } from "../requests";
import { useAutenticacao } from "../../contexts/Autenticacao.context";

interface Props {
  artista: Artista;
}

export function PerfilPublicoArtista({ artista }: Props) {
  const { usuario, userType } = useAutenticacao();
  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [solicitarAberto, setSolicitarAberto] = useState(false);

  const dados = (artista as any)?.artist || artista;
  const nome = dados?.name || dados?.nome || "Nome não informado";
  const email = dados?.email || "Email não disponível";
  const bio = dados?.bio || dados?.biografia || null;
  const verificado = dados?.verified || dados?.verificado || false;
  const cidade = dados?.city || dados?.cidade || null;
  const estado = dados?.state || dados?.estado || null;
  const tiposArte =
    dados?.artTypes || dados?.tipos_arte || dados?.specialties || [];
  const artistaId = dados?.id || dados?._id;

  useEffect(() => {
    if (!artistaId) return;
    setCarregandoServicos(true);
    listarServicosPorArtista(artistaId)
      .then((dados) => setServicos(dados.filter((s) => s.active)))
      .catch(() => setServicos([]))
      .finally(() => setCarregandoServicos(false));
  }, [artistaId]);

  const localizacao =
    cidade && estado
      ? `${cidade}, ${estado}`
      : cidade || estado || "Localização não informada";

  const iniciais =
    nome
      ?.split(" ")
      .slice(0, 2)
      .map((p: string) => p[0])
      .join("")
      .toUpperCase() || "QT";

  return (
    <div className="flex flex-col gap-6">
      {/* Hero do perfil */}
      <Card className="overflow-hidden border-0 bg-gradient-brand text-white shadow-2xl shadow-[color:var(--accent)]/30">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50" />
          <CardContent className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/30 bg-white/20 font-display text-3xl font-black backdrop-blur">
              {iniciais}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold">{nome}</h1>
                {verificado && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-xs font-bold backdrop-blur">
                    <CheckCircle2 size={12} />
                    Verificado
                  </span>
                )}
              </div>
              <p className="flex items-center gap-1.5 text-white/90">
                <MapPin size={14} />
                {localizacao}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-white/80">
                <Mail size={14} />
                {email}
              </p>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Sobre */}
      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-bold">Sobre</h2>
        </CardHeader>
        <CardContent>
          {bio ? (
            <p className="text-sm leading-relaxed">{bio}</p>
          ) : (
            <p className="text-sm italic text-[color:var(--muted)]">
              Este artista ainda não adicionou uma biografia.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Especialidades */}
      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-bold">Especialidades</h2>
        </CardHeader>
        <CardContent>
          {tiposArte && tiposArte.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tiposArte.map((t: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-[color:var(--accent)]/15 px-3 py-1 text-xs font-medium text-[color:var(--accent)]"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-[color:var(--muted)]">
              Nenhuma especialidade cadastrada ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Serviços */}
      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-bold">
            Serviços oferecidos
          </h2>
        </CardHeader>
        <CardContent>
          {carregandoServicos ? (
            <div className="flex justify-center py-8">
              <Spinner color="accent" />
            </div>
          ) : servicos.length > 0 ? (
            <ListaServicos servicos={servicos} modo="publico" />
          ) : (
            <p className="text-sm italic text-[color:var(--muted)]">
              Este artista ainda não cadastrou serviços.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-bold">Agendar horário</h2>
        </CardHeader>
        <CardContent>
          {artistaId && (
            <AgendaCliente
              artistaId={artistaId}
              artistaNome={nome}
              artistaEmail={email}
            />
          )}
        </CardContent>
      </Card>

      {/* Avaliações */}
      {artistaId && (
        <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Avaliações</h2>
          </CardHeader>
          <CardContent>
            <ListaReviews artistId={artistaId} limite={5} />
          </CardContent>
        </Card>
      )}

      {/* CTA — solicitar serviço (apenas pra clientes logados) */}
      {userType === "client" && usuario?.sub && artistaId && (
        <Card className="overflow-hidden border-0 bg-gradient-warm text-[color:var(--foreground)] shadow-xl">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <h2 className="font-display text-xl font-bold">
              Interessado no trabalho?
            </h2>
            <p className="text-sm">
              Solicite um serviço de {nome?.split(" ")?.[0] || nome} pra um
              evento ou projeto seu.
            </p>
            <Button
              variant="primary"
              onPress={() => setSolicitarAberto(true)}
              className="bg-[color:var(--foreground)] font-semibold text-[color:var(--background)] shadow-lg"
            >
              <MessageSquarePlus size={16} className="mr-2" />
              Solicitar serviço
            </Button>
          </CardContent>
        </Card>
      )}

      {artistaId && usuario?.sub && (
        <SolicitarServicoModal
          aberto={solicitarAberto}
          aoFechar={setSolicitarAberto}
          artistId={artistaId}
          artistNome={nome}
          userId={usuario.sub}
        />
      )}
    </div>
  );
}
