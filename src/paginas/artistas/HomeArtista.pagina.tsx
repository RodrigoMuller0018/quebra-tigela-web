import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Spinner,
  Chip,
} from "@heroui/react";
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  MapPin,
  Pencil,
  Eye,
  Calendar,
  Briefcase,
  Palette,
  Lightbulb,
  Clock,
  Inbox,
} from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { obterMeuPerfil } from "../../api/artistas.api";
import { obterHorariosFuturos } from "../../api/schedule.api";
import { listarSolicitacoesPorArtista } from "../../api/requests.api";
import type { Artista } from "../../tipos/artistas";
import type { ScheduleEntry } from "../../tipos/schedule";
import type { Solicitacao } from "../../tipos/requests";
import { erro as avisoErro } from "../../utilitarios/avisos";
import { ListaReviews } from "../../componentes/reviews";

export default function HomeArtistaPagina() {
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [proximosHorarios, setProximosHorarios] = useState<ScheduleEntry[]>([]);
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<
    Solicitacao[]
  >([]);

  async function carregarPerfil() {
    if (!usuario?.sub) return;
    setCarregando(true);
    setPerfilIncompleto(false);
    try {
      const data = await obterMeuPerfil();
      setArtista(data);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.message || "";
      if (status === 404 || msg.includes("404") || msg.includes("not found")) {
        setPerfilIncompleto(true);
        setArtista(null);
      } else {
        avisoErro(msg ?? "Erro ao carregar perfil");
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, [usuario]);

  // Carregar próximos horários e solicitações pendentes
  useEffect(() => {
    if (!usuario?.sub) return;
    obterHorariosFuturos(usuario.sub)
      .then((dados) => setProximosHorarios(dados.slice(0, 5)))
      .catch(() => setProximosHorarios([]));
    listarSolicitacoesPorArtista(usuario.sub)
      .then((dados) =>
        setSolicitacoesPendentes(
          dados.filter((s) => s.status === "pending")
        )
      )
      .catch(() => setSolicitacoesPendentes([]));
  }, [usuario]);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-white shadow-2xl shadow-[color:var(--accent)]/30 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
            Dashboard
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold">
            Olá, {artista?.name?.split(" ")[0] ?? "artista"}!
          </h1>
          <p className="mt-2 max-w-xl text-white/90">
            Acompanhe sua atividade e gerencie seu perfil em um só lugar.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      {carregando ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="accent" />
        </div>
      ) : perfilIncompleto ? (
        <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
              <Palette size={32} />
            </span>
            <h2 className="font-display text-2xl font-bold text-gradient-brand">
              Complete seu perfil de artista
            </h2>
            <p className="max-w-md text-[color:var(--muted)]">
              Você ainda não completou seu perfil. Adicione suas informações
              para que clientes possam encontrar e conhecer seu trabalho.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="primary"
                onPress={() => navigate(`/artistas/${usuario?.sub}`)}
                className="bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30"
              >
                Completar perfil
              </Button>
              <Button variant="ghost" onPress={carregarPerfil}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : artista ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna principal: perfil */}
          <Card className="border border-[color:var(--border)] bg-[color:var(--surface)] lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Meu perfil</h2>
              {artista.verified ? (
                <Chip className="inline-flex items-center gap-1 bg-[color:var(--success)]/15 text-[color:var(--success)]">
                  <CheckCircle2 size={14} />
                  Verificado
                </Chip>
              ) : (
                <Chip className="inline-flex items-center gap-1 bg-[color:var(--warning)]/15 text-[color:var(--warning)]">
                  <AlertCircle size={14} />
                  Não verificado
                </Chip>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand font-display text-2xl font-black text-white shadow-lg">
                  {artista.name?.[0]?.toUpperCase() ?? "QT"}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold">
                    {artista.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-sm text-[color:var(--muted)]">
                    <Mail size={14} />
                    {artista.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-[color:var(--muted)]">
                    <MapPin size={14} />
                    {artista.city && artista.state
                      ? `${artista.city} — ${artista.state}`
                      : "Localização não informada"}
                  </p>
                </div>
              </div>

              {artista.bio && (
                <div>
                  <h4 className="mb-1 text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">
                    Bio
                  </h4>
                  <p className="text-sm leading-relaxed">{artista.bio}</p>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">
                  Especialidades
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {artista.artTypes.map((t, i) => (
                    <Chip
                      key={i}
                      className="bg-[color:var(--accent)]/15 text-[color:var(--accent)]"
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="primary"
                  onPress={() =>
                    navigate(`/artistas/${artista.id || usuario?.sub}`)
                  }
                  className="bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30"
                >
                  <Pencil size={16} className="mr-2" />
                  Editar perfil
                </Button>
                {artista.verified && (
                  <Button
                    variant="outline"
                    onPress={() =>
                      navigate(
                        `/artistas/${artista.id || usuario?.sub}?preview=true`
                      )
                    }
                  >
                    <Eye size={16} className="mr-2" />
                    Ver perfil público
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Próximos agendamentos */}
          <Card className="border border-[color:var(--border)] bg-[color:var(--surface)] lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                Próximos agendamentos
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => navigate("/artista/agenda")}
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              {proximosHorarios.length === 0 ? (
                <p className="py-4 text-center text-sm text-[color:var(--muted)]">
                  Nenhum horário agendado
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {proximosHorarios.map((h) => (
                    <div
                      key={h._id || h.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <Clock
                          size={16}
                          className="text-[color:var(--muted)]"
                        />
                        <span className="font-medium">
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(
                            new Date(
                              h.date.includes("T") ? h.date : h.date + "T00:00:00"
                            )
                          )}
                        </span>
                        {h.startTime && (
                          <span className="text-[color:var(--muted)]">
                            {h.startTime}
                            {h.endTime && ` → ${h.endTime}`}
                          </span>
                        )}
                      </div>
                      <Chip
                        className={
                          h.status === "booked"
                            ? "bg-[color:var(--secondary)]/15 text-xs text-[color:var(--secondary)]"
                            : "bg-[color:var(--accent)]/15 text-xs text-[color:var(--accent)]"
                        }
                      >
                        {h.status === "booked" ? "Reservado" : "Disponível"}
                      </Chip>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Minhas avaliações */}
          {usuario?.sub && (
            <Card className="border border-[color:var(--border)] bg-[color:var(--surface)] lg:col-span-2">
              <CardHeader>
                <h2 className="font-display text-lg font-bold">
                  Minhas avaliações
                </h2>
              </CardHeader>
              <CardContent>
                <ListaReviews artistId={usuario.sub} limite={3} />
              </CardContent>
            </Card>
          )}

          {/* Coluna lateral: stats + ações + dicas */}
          <div className="flex flex-col gap-6">
            <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
              <CardHeader>
                <h2 className="font-display text-lg font-bold">Estatísticas</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Visualizações" valor="—" />
                  <Stat label="Contatos" valor="—" />
                </div>
                <p className="mt-3 text-xs text-[color:var(--muted)]">
                  Dados em breve
                </p>
              </CardContent>
            </Card>

            <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
              <CardHeader>
                <h2 className="font-display text-lg font-bold">Ações rápidas</h2>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start"
                  onPress={() => navigate("/artista/agenda")}
                >
                  <Calendar size={16} className="mr-2" />
                  Gerenciar agenda
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start"
                  onPress={() => navigate("/artista/servicos")}
                >
                  <Briefcase size={16} className="mr-2" />
                  Gerenciar serviços
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  className="justify-start"
                  onPress={() => navigate("/artista/solicitacoes")}
                >
                  <Inbox size={16} className="mr-2" />
                  Solicitações
                  {solicitacoesPendentes.length > 0 && (
                    <span className="ml-auto rounded-full bg-gradient-brand px-2 py-0.5 text-xs font-bold text-white">
                      {solicitacoesPendentes.length}
                    </span>
                  )}
                </Button>
                <Link to="/cliente">
                  <Button variant="ghost" fullWidth className="justify-start">
                    <Palette size={16} className="mr-2" />
                    Ver outros artistas
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 bg-gradient-brand text-white shadow-xl shadow-[color:var(--accent)]/20">
              <CardContent className="flex flex-col gap-2 py-5">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <Lightbulb size={18} />
                  Dicas
                </h2>
                <ul className="flex flex-col gap-1.5 text-sm text-white/90">
                  <li>• Complete seu perfil com bio detalhada</li>
                  <li>• Adicione exemplos do seu trabalho</li>
                  <li>• Mantenha especialidades atualizadas</li>
                  <li>• Responda rapidamente às solicitações</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p>Erro ao carregar seu perfil.</p>
            <Button variant="primary" onPress={carregarPerfil}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] p-3 text-center">
      <div className="font-display text-2xl font-black text-gradient-brand">
        {valor}
      </div>
      <div className="text-xs text-[color:var(--muted)]">{label}</div>
    </div>
  );
}
