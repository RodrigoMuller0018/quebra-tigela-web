import { useEffect, useRef, useState, useCallback } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Spinner,
  Chip,
} from "@heroui/react";
import {
  ArrowLeft,
  Pencil,
  Save,
  AlertTriangle,
  Camera,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  obterArtistaPorHandle,
  registrarVisualizacaoArtista,
  obterMeuPerfil,
  atualizarArtista,
} from "../../api/artistas.api";
import { atualizarUsuario } from "../../api/usuarios.api";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";
import type { Artista } from "../../tipos/artistas";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import {
  erro as avisoErro,
  sucesso as avisoSucesso,
} from "../../utilitarios/avisos";
import { obterIdDoToken } from "../../utilitarios/jwt";
import {
  pausarPerfilArtista,
  reativarPerfilArtista,
} from "../../api/artistas.api";
import { PerfilPublicoArtista } from "../../componentes/artistas/PerfilPublicoArtista";
import { VerificacaoIdentidade } from "../../componentes/verificacao";
import { useEhDispositivoMovel } from "../../utilitarios/dispositivo";
import { Campo, AreaTexto } from "../../componentes/ui/Campo";
import { Dialogo } from "../../componentes/ui/Dialogo";
import { UploadFotoPerfil } from "../../componentes/ui/UploadFotoPerfil";
import { SeletorTiposArte } from "../../componentes/ui/SeletorTiposArte";

export default function DetalheArtistaPagina() {
  const { handle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { temPerfilArtista, login, token, marcarPerfilAtualizado } = useAutenticacao();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mostrarVerificacao, setMostrarVerificacao] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const ehDispositivoMovel = useEhDispositivoMovel();

  // Rota /artista/perfil é edição do próprio (sem handle na URL).
  // Rota /artistas/@:handle é visualização pública.
  const ehRotaPropria = location.pathname === "/artista/perfil";
  const modoPreview = searchParams.get("preview") === "true";
  const usuarioLogadoId = obterIdDoToken();
  const ehProprioArtista =
    !modoPreview && temPerfilArtista && ehRotaPropria;

  // Alias pro Artista._id depois que carrega — usado por update/pausar/reativar
  // que ainda dependem do ID interno (rotas /api/artistas/:id/*).
  const id = artista?.id;
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  // Dedup pra StrictMode (effects rodam 2x em dev) e re-mounts no mesmo handle.
  const visualizacaoRegistrada = useRef<string | null>(null);

  useEffect(() => {
    if (!ehRotaPropria && !handle) return;
    setNaoEncontrado(false);
    (async () => {
      setCarregando(true);
      try {
        const data = ehProprioArtista
          ? await obterMeuPerfil()
          : await obterArtistaPorHandle(handle!);
        setArtista(data);
        // Só conta visualização no modo público (handle na URL, não preview do dono).
        if (
          handle &&
          !ehProprioArtista &&
          !modoPreview &&
          visualizacaoRegistrada.current !== handle
        ) {
          visualizacaoRegistrada.current = handle;
          registrarVisualizacaoArtista(handle).catch(() => {
            // Falha silenciosa — métrica não deve quebrar a navegação.
          });
        }
      } catch (e: any) {
        // 404 vira UI dedicada; outros erros viram toast como antes.
        const status = e?.response?.status;
        if (status === 404) {
          setNaoEncontrado(true);
        } else {
          avisoErro(e?.message ?? "Erro ao buscar artista");
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, [handle, ehProprioArtista, ehRotaPropria]);

  const handleEstado = useCallback((uf: string) => {
    setArtista((prev) => (prev ? { ...prev, estado: uf } : null));
  }, []);
  const handleCidade = useCallback((c: string) => {
    setArtista((prev) => (prev ? { ...prev, cidade: c } : null));
  }, []);

  async function handleSalvar() {
    if (!artista?.id) return;
    setSalvando(true);
    try {
      // Composition pattern: nome, cidade, estado, fotoPerfil moram no Usuario;
      // bio, tiposArte, telefone, etc moram no Artista. Atualiza os 2 em paralelo.
      const promessas: Promise<unknown>[] = [];
      if (artista.usuarioId) {
        promessas.push(
          atualizarUsuario(artista.usuarioId, {
            nome: artista.nome,
            cidade: artista.cidade,
            estado: artista.estado,
            fotoPerfil: artista.fotoPerfil ?? null,
          }),
        );
      }
      promessas.push(
        atualizarArtista(artista.id, {
          bio: artista.bio,
          tiposArte: artista.tiposArte,
          nomeArtistico: artista.nomeArtistico,
          dataNascimento: artista.dataNascimento,
          portfolio: artista.portfolio,
          redesSociais: artista.redesSociais,
        }),
      );
      await Promise.all(promessas);
      avisoSucesso("Perfil atualizado com sucesso!");
      marcarPerfilAtualizado();
      navigate("/artista");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  async function handlePausarPerfil() {
    if (!id) return;
    setExcluindo(true);
    try {
      await pausarPerfilArtista(id);
      avisoSucesso(
        "Perfil de artista pausado. Você pode reativar a qualquer momento.",
      );
      // Atualiza token pra refletir hasArtistProfile=false (continuamos cliente)
      if (token) login(token);
      navigate("/cliente");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao pausar perfil");
    } finally {
      setExcluindo(false);
    }
  }

  async function handleReativarPerfil() {
    if (!id) return;
    setExcluindo(true);
    try {
      await reativarPerfilArtista(id);
      avisoSucesso("Perfil de artista reativado!");
      if (token) login(token);
      setArtista((a) => (a ? { ...a, ativo: true } : a));
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao reativar perfil");
    } finally {
      setExcluindo(false);
    }
  }

  async function handleVerificacaoSucesso() {
    if (artista) setArtista({ ...artista, verificado: true });
    setMostrarVerificacao(false);
    avisoSucesso(
      "Identidade verificada com sucesso! Agora você pode receber solicitações."
    );
    if (id) {
      try {
        const data = await obterMeuPerfil();
        setArtista(data);
      } catch {
        // ignore
      }
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  if (naoEncontrado) {
    return (
      <Card className="mx-auto max-w-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
            <AlertCircle size={28} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold">
              Artista não encontrado
            </h2>
            <p className="max-w-md text-sm text-[color:var(--muted)]">
              O handle{" "}
              {handle && (
                <span className="font-mono font-semibold text-[color:var(--foreground)]">
                  {handle}
                </span>
              )}{" "}
              não corresponde a nenhum artista ativo. Talvez tenha sido digitado
              errado ou o perfil foi pausado.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button
              variant="primary"
              onPress={() => navigate("/artistas")}
              className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
            >
              Explorar artistas
            </Button>
            <Button variant="ghost" onPress={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!artista) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  const voltarPara = temPerfilArtista ? "/artista" : "/artistas";
  const textoVoltar = temPerfilArtista
    ? "Voltar para Dashboard"
    : "Voltar para Artistas";

  // Visualização pública (cliente vendo artista, ou artista em modo preview)
  if (!ehProprioArtista) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onPress={() => navigate(voltarPara)}>
            <ArrowLeft size={16} className="mr-2" />
            {textoVoltar}
          </Button>
          {modoPreview && usuarioLogadoId === id && (
            <Button
              variant="primary"
              onPress={() => navigate("/artista/perfil")}
              className="bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30"
            >
              <Pencil size={16} className="mr-2" />
              Editar perfil
            </Button>
          )}
        </div>
        <PerfilPublicoArtista artista={artista} />
      </div>
    );
  }

  // Modo edição (próprio artista)
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" onPress={() => navigate(voltarPara)}>
          <ArrowLeft size={16} className="mr-2" />
          {textoVoltar}
        </Button>
      </div>

      {/* Banner verificação (mobile + não verificado) */}
      {ehDispositivoMovel && !artista.verificado && (
        <Card className="overflow-hidden border-0 bg-gradient-brand text-white shadow-2xl shadow-[color:var(--accent)]/30">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <AlertTriangle size={32} />
            </span>
            <h3 className="font-display text-2xl font-bold">
              Conta não verificada
            </h3>
            <p className="max-w-md text-sm text-white/90">
              Verifique sua identidade para receber solicitações e aparecer nas
              buscas.
            </p>
            <Button
              size="lg"
              onPress={() => setMostrarVerificacao(true)}
              className="bg-white font-bold text-[color:var(--accent)] shadow-lg"
            >
              <Camera size={18} className="mr-2" />
              Verificar identidade
            </Button>
            <p className="text-xs text-white/70">
              Você precisará tirar uma selfie e foto do documento
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-gradient-brand">
              Editar meu perfil
            </h2>
            {artista.verificado ? (
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
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <UploadFotoPerfil
            fotoAtual={artista.fotoPerfil}
            nome={artista.nome || "Artista"}
            onChange={(foto) =>
              setArtista({ ...artista, fotoPerfil: foto })
            }
            desabilitado={salvando}
          />
          <Campo
            label="Nome completo"
            value={artista.nome}
            onChange={(v) => setArtista({ ...artista, nome: v })}
            isRequired
          />
          <Campo
            label="Nome artístico"
            value={artista.nomeArtistico || ""}
            onChange={(v) => setArtista({ ...artista, nomeArtistico: v })}
            placeholder="Como você é conhecido(a) no palco/cena"
            description="Opcional"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="birthDate" className="text-sm font-medium">
              Data de nascimento
            </label>
            <input
              id="birthDate"
              type="date"
              value={artista.dataNascimento || ""}
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setArtista({ ...artista, dataNascimento: e.target.value || undefined })
              }
              className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
            />
            <span className="text-xs text-[color:var(--muted)]">
              Opcional — só fica visível pra você
            </span>
          </div>
          <AreaTexto
            label="Biografia"
            value={artista.bio || ""}
            onChange={(v) => setArtista({ ...artista, bio: v })}
            placeholder="Conte um pouco sobre você e seu trabalho..."
            rows={4}
          />
          <SeletorTiposArte
            value={artista.tiposArte}
            onChange={(next) => setArtista({ ...artista, tiposArte: next })}
            isRequired
            ajuda="Escolha pelo menos 1 e no máximo 10 — busca por palavra-chave ou navega pelas categorias"
          />
          <SeletorEstadoCidade
            estadoSelecionado={artista.estado || ""}
            cidadeSelecionada={artista.cidade || ""}
            onEstadoChange={handleEstado}
            onCidadeChange={handleCidade}
            idPrefix="artista-detalhe"
          />
          <Campo
            label="Portfólio (URL)"
            value={artista.portfolio || ""}
            onChange={(v) =>
              setArtista({ ...artista, portfolio: v || undefined })
            }
            placeholder="https://meuportfolio.com"
            description="Link pro seu site, Behance, drive, etc. — aparece no perfil público"
          />
          <RedesSociaisInput
            value={artista.redesSociais ?? []}
            onChange={(next) => setArtista({ ...artista, redesSociais: next })}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="primary"
              onPress={handleSalvar}
              isDisabled={salvando}
              className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
            >
              <Save size={16} className="mr-2" />
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button variant="ghost" onPress={() => navigate(voltarPara)}>
              Cancelar
            </Button>
            {!artista.verificado && !ehDispositivoMovel && (
              <Button
                variant="outline"
                onPress={() => setMostrarVerificacao(true)}
              >
                <Camera size={16} className="mr-2" />
                Verificar identidade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-[color:var(--danger)]/30 bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-semibold text-[color:var(--danger)]">
            Zona de perigo
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {artista.ativo === false ? (
            <>
              <p className="text-sm text-[color:var(--muted)]">
                Seu perfil de artista está <strong>pausado</strong>. Reative pra
                voltar a aparecer em buscas e receber solicitações.
              </p>
              <Button
                variant="primary"
                onPress={handleReativarPerfil}
                isDisabled={excluindo}
              >
                {excluindo ? "Reativando..." : "Reativar perfil"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-[color:var(--muted)]">
                Pausar seu perfil de artista esconde você das buscas e impede
                novas solicitações. Histórico e dados ficam preservados pra você
                reativar quando quiser.
              </p>
              <Button
                variant="danger-soft"
                onPress={() => setConfirmarExcluir(true)}
                isDisabled={excluindo}
              >
                <Trash2 size={16} className="mr-2" />
                Pausar perfil
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmacaoModal
        aberto={confirmarExcluir}
        aoFechar={(open) => !open && setConfirmarExcluir(false)}
        titulo="Pausar perfil de artista?"
        mensagem={
          <>
            Você vai sair das buscas e não receberá novas solicitações.
            <br />
            <br />
            <strong>Seus dados ficam preservados</strong> — solicitações em
            andamento, avaliações e histórico continuam intactos. Você pode
            reativar a qualquer momento.
          </>
        }
        textoConfirmar="Sim, pausar perfil"
        textoCancelar="Cancelar"
        variante="destrutivo"
        carregando={excluindo}
        onConfirmar={handlePausarPerfil}
      />

      <Dialogo
        aberto={mostrarVerificacao}
        aoFechar={setMostrarVerificacao}
        titulo="Verificação de identidade"
        tamanho="lg"
      >
        {id && (
          <VerificacaoIdentidade
            artistId={id}
            onSucesso={handleVerificacaoSucesso}
            onCancelar={() => setMostrarVerificacao(false)}
          />
        )}
      </Dialogo>
    </div>
  );
}

// ============================== Redes Sociais ===============================

interface RedesSociaisInputProps {
  value: string[];
  onChange: (next: string[]) => void;
}

function RedesSociaisInput({ value, onChange }: RedesSociaisInputProps) {
  function atualizar(idx: number, novoValor: string) {
    const copia = [...value];
    copia[idx] = novoValor;
    onChange(copia);
  }
  function remover(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }
  function adicionar() {
    onChange([...value, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Redes sociais</label>
      <span className="text-xs text-[color:var(--muted)]">
        Adicione links pras suas redes (Instagram, YouTube, TikTok, Spotify, etc.). Aparecem como ícones no perfil público.
      </span>
      {value.map((url, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => atualizar(idx, e.target.value)}
            placeholder="https://instagram.com/seu-perfil"
            className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--field-background,var(--surface))] px-4 py-2.5 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
          />
          <button
            type="button"
            onClick={() => remover(idx)}
            aria-label="Remover"
            className="rounded-lg p-2 text-[color:var(--muted)] transition hover:bg-[color:var(--danger)]/10 hover:text-[color:var(--danger)]"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={adicionar}
        className="self-start rounded-lg border border-dashed border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      >
        + Adicionar rede social
      </button>
    </div>
  );
}
