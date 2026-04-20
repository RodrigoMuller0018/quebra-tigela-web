import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  obterArtistaPorId,
  obterMeuPerfil,
  atualizarArtista,
  excluirArtista,
} from "../../api/artistas.api";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";
import type { Artista } from "../../tipos/artistas";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import {
  erro as avisoErro,
  sucesso as avisoSucesso,
} from "../../utilitarios/avisos";
import { obterIdDoToken, obterRoleDoToken } from "../../utilitarios/jwt";
import { PerfilPublicoArtista } from "../../componentes/artistas/PerfilPublicoArtista";
import { VerificacaoIdentidade } from "../../componentes/verificacao";
import { useEhDispositivoMovel } from "../../utilitarios/dispositivo";
import { Campo, AreaTexto } from "../../componentes/ui/Campo";
import { Dialogo } from "../../componentes/ui/Dialogo";

export default function DetalheArtistaPagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAutenticacao();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mostrarVerificacao, setMostrarVerificacao] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const ehDispositivoMovel = useEhDispositivoMovel();

  const modoPreview = searchParams.get("preview") === "true";
  const usuarioLogadoId = obterIdDoToken();
  const userRole = obterRoleDoToken();
  const ehProprioArtista =
    !modoPreview && usuarioLogadoId && id && usuarioLogadoId === id;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setCarregando(true);
      try {
        const data = ehProprioArtista
          ? await obterMeuPerfil()
          : await obterArtistaPorId(id);
        setArtista(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao buscar artista");
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, ehProprioArtista]);

  const handleEstado = useCallback((uf: string) => {
    setArtista((prev) => (prev ? { ...prev, state: uf } : null));
  }, []);
  const handleCidade = useCallback((c: string) => {
    setArtista((prev) => (prev ? { ...prev, city: c } : null));
  }, []);

  async function handleSalvar() {
    if (!id || !artista) return;
    setSalvando(true);
    try {
      await atualizarArtista(id, {
        name: artista.name,
        bio: artista.bio,
        city: artista.city,
        state: artista.state,
        artTypes: artista.artTypes,
      });
      avisoSucesso("Perfil atualizado com sucesso!");
      navigate("/artista");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluirConta() {
    if (!id) return;
    setExcluindo(true);
    try {
      await excluirArtista(id);
      avisoSucesso("Conta de artista excluída.");
      logout();
      navigate("/login");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao excluir conta");
      setExcluindo(false);
    }
  }

  async function handleVerificacaoSucesso() {
    if (artista) setArtista({ ...artista, verified: true });
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

  if (!artista) {
    return (
      <div className="py-16 text-center">
        <p className="text-[color:var(--muted)]">Artista não encontrado</p>
      </div>
    );
  }

  const voltarPara = userRole === "artist" ? "/artista" : "/artistas";
  const textoVoltar =
    userRole === "artist" ? "Voltar para Dashboard" : "Voltar para Artistas";

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
              onPress={() => navigate(`/artistas/${id}`)}
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
      {ehDispositivoMovel && !artista.verified && (
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
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Campo
            label="Nome artístico"
            value={artista.name}
            onChange={(v) => setArtista({ ...artista, name: v })}
            isRequired
          />
          <AreaTexto
            label="Biografia"
            value={artista.bio || ""}
            onChange={(v) => setArtista({ ...artista, bio: v })}
            placeholder="Conte um pouco sobre você e seu trabalho..."
            rows={4}
          />
          <Campo
            label="Tipos de arte"
            value={artista.artTypes.join(", ")}
            onChange={(v) =>
              setArtista({
                ...artista,
                artTypes: v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Ex: Pintura, Escultura, Fotografia"
            description="Separe por vírgulas"
            isRequired
          />
          <SeletorEstadoCidade
            estadoSelecionado={artista.state || ""}
            cidadeSelecionada={artista.city || ""}
            onEstadoChange={handleEstado}
            onCidadeChange={handleCidade}
            idPrefix="artista-detalhe"
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
            {!artista.verified && !ehDispositivoMovel && (
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
          <p className="text-sm text-[color:var(--muted)]">
            Excluir sua conta remove seu perfil, serviços, agenda e
            avaliações permanentemente.
          </p>
          <Button
            variant="danger-soft"
            onPress={() => setConfirmarExcluir(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir conta
          </Button>
        </CardContent>
      </Card>

      <ConfirmacaoModal
        aberto={confirmarExcluir}
        aoFechar={(open) => !open && setConfirmarExcluir(false)}
        titulo="Excluir conta de artista?"
        mensagem={
          <>
            Esta ação é <strong>irreversível</strong>. Seu perfil, serviços,
            agenda e avaliações serão removidos permanentemente.
          </>
        }
        textoConfirmar="Sim, excluir conta"
        textoCancelar="Cancelar"
        variante="destrutivo"
        carregando={excluindo}
        onConfirmar={handleExcluirConta}
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
