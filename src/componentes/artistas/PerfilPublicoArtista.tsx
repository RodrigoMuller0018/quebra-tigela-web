import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Spinner,
} from "@heroui/react";
import {
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageSquarePlus,
  Star,
} from "lucide-react";
import { detectarPlataforma } from "../../utilitarios/socialPlatforms";
import type { Artista } from "../../tipos/artistas";
import type { Servico } from "../../tipos/servicos";
import { AgendaCliente } from "../agenda";
import { ListaServicos } from "../servicos";
import { listarServicosPorArtista } from "../../api/servicos.api";
import { ListaReviews } from "../reviews";
import { SolicitarServicoModal } from "../requests";
import { AvatarPerfil } from "../ui/AvatarPerfil";
import { useAutenticacao } from "../../contexts/Autenticacao.context";

interface Props {
  artista: Artista;
}

export function PerfilPublicoArtista({ artista }: Props) {
  const { usuario, modoAtivo } = useAutenticacao();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [solicitarAberto, setSolicitarAberto] = useState(false);

  // Backend pode mandar o artista solto OU encapsulado em { artist: ... } no /perfil.
  const dados: any = (artista as any)?.artist || artista;
  const nome = dados?.nome || "Nome não informado";
  const email = dados?.email || "Email não disponível";
  const bio = dados?.bio || null;
  const verificado = !!dados?.verificado;
  const cidade = dados?.cidade || null;
  const estado = dados?.estado || null;
  const tiposArte: string[] = Array.isArray(dados?.tiposArte) ? dados.tiposArte : [];
  const artistaId = dados?.id || dados?._id;
  const artisticName: string | null = dados?.nomeArtistico || null;
  const portfolio: string | null = dados?.portfolio || null;
  const socialLinks: string[] = Array.isArray(dados?.redesSociais)
    ? dados.redesSociais.filter((u: string) => !!u)
    : [];

  // Rating vem em 2 formatos: /perfil devolve { avaliacao: { media, total } } e
  // /buscar devolve campos flat notaMedia/totalAvaliacoes no próprio artista.
  const avaliacaoObj = (artista as any)?.avaliacao;
  const ratingAvg: number | null =
    avaliacaoObj?.media ?? dados?.notaMedia ?? null;
  const ratingCount: number =
    avaliacaoObj?.total ?? dados?.totalAvaliacoes ?? 0;

  useEffect(() => {
    if (!artistaId) return;
    setCarregandoServicos(true);
    listarServicosPorArtista(artistaId)
      .then((dados) => setServicos(dados.filter((s) => s.ativo)))
      .catch(() => setServicos([]))
      .finally(() => setCarregandoServicos(false));
  }, [artistaId]);

  const localizacao =
    cidade && estado
      ? `${cidade}, ${estado}`
      : cidade || estado || "Localização não informada";

  const fotoPerfil = dados?.fotoPerfil;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero do perfil */}
      <Card className="overflow-hidden border-0 bg-gradient-brand text-white shadow-2xl shadow-[color:var(--accent)]/30">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-50" />
          <CardContent className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <AvatarPerfil
              foto={fotoPerfil}
              nome={nome}
              tamanho="xl"
              className="!rounded-3xl border-4 border-white/30"
            />
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
              {artisticName && (
                <p className="text-sm italic text-white/85">
                  ({artisticName})
                </p>
              )}
              {ratingCount > 0 && ratingAvg !== null && (
                <p className="mt-1 flex items-center gap-1.5 text-white/95">
                  <Star
                    size={16}
                    className="fill-[color:var(--warning)] text-[color:var(--warning)]"
                  />
                  <span className="font-bold">{ratingAvg.toFixed(1)}</span>
                  <span className="text-sm text-white/80">
                    · {ratingCount} {ratingCount === 1 ? "avaliação" : "avaliações"}
                  </span>
                </p>
              )}
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

      {/* Links e redes sociais */}
      {(portfolio || socialLinks.length > 0) && (
        <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardHeader>
            <h2 className="font-display text-xl font-bold">Links e redes</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {portfolio && (
              <a
                href={portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                <LinkIcon size={14} />
                Portfólio
              </a>
            )}
            {socialLinks.map((url, i) => {
              const { label } = detectarPlataforma(url);
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={url}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-secondary)] px-3 py-1.5 text-xs font-medium transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  <ExternalLink size={12} />
                  {label}
                </a>
              );
            })}
          </CardContent>
        </Card>
      )}

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
            <ListaReviews artistaId={artistaId} limite={5} />
          </CardContent>
        </Card>
      )}

      {/* CTA — solicitar serviço (apenas pra clientes logados, e nunca em auto-perfil) */}
      {modoAtivo === "cliente" &&
        usuario?.sub &&
        artistaId &&
        dados?.usuarioId !== usuario.sub && (
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
          artistaId={artistaId}
          artistaNome={nome}
        />
      )}
    </div>
  );
}
