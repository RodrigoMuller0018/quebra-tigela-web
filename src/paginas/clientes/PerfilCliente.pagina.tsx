import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, Spinner } from "@heroui/react";
import { Save, PowerOff } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { Campo } from "../../componentes/ui/Campo";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";
import { UploadFotoPerfil } from "../../componentes/ui/UploadFotoPerfil";
import {
  obterUsuarioPorId,
  atualizarUsuario,
  desativarConta,
} from "../../api/usuarios.api";

interface DadosPerfil {
  nome: string;
  email: string;
  cidade: string;
  estado: string;
  fotoPerfil?: string | null;
}

const INICIAL: DadosPerfil = { nome: "", email: "", cidade: "", estado: "" };

export default function PerfilCliente() {
  const { usuario, logout, marcarPerfilAtualizado } = useAutenticacao();
  const navigate = useNavigate();
  const [dados, setDados] = useState<DadosPerfil>(INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!usuario?.sub) return;
    setCarregando(true);
    obterUsuarioPorId(usuario.sub)
      .then((u) =>
        setDados({
          nome: u.nome || "",
          email: u.email || "",
          cidade: u.cidade || "",
          estado: u.estado || "",
          fotoPerfil: u.fotoPerfil,
        })
      )
      .catch((e) => avisoErro(e?.message ?? "Erro ao carregar perfil"))
      .finally(() => setCarregando(false));
  }, [usuario?.sub]);

  const handleEstado = useCallback((e: string) => {
    setDados((p) => ({ ...p, estado: e }));
  }, []);
  const handleCidade = useCallback((c: string) => {
    setDados((p) => ({ ...p, cidade: c }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario?.sub) return;
    setSalvando(true);
    try {
      await atualizarUsuario(usuario.sub, {
        nome: dados.nome,
        email: dados.email,
        cidade: dados.cidade || undefined,
        estado: dados.estado || undefined,
        fotoPerfil: dados.fotoPerfil ?? null,
      });
      avisoSucesso("Perfil atualizado com sucesso!");
      marcarPerfilAtualizado();
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDesativarConta() {
    if (!usuario?.sub) return;
    setExcluindo(true);
    try {
      await desativarConta(usuario.sub);
      avisoSucesso(
        "Conta desativada. Pra voltar, basta fazer login com seu e-mail e senha.",
      );
      logout();
      navigate("/login");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao desativar conta");
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold text-gradient-brand">
          Meu Perfil
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Atualize suas informações pessoais
        </p>
      </header>

      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-semibold">
            Informações pessoais
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <UploadFotoPerfil
              fotoAtual={dados.fotoPerfil}
              nome={dados.nome || "Você"}
              onChange={(foto) =>
                setDados((p) => ({ ...p, fotoPerfil: foto }))
              }
              desabilitado={salvando}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Nome completo"
                type="text"
                value={dados.nome}
                onChange={(v) => setDados({ ...dados, nome: v })}
                isRequired
              />
              <Campo
                label="E-mail"
                type="email"
                value={dados.email}
                onChange={(v) => setDados({ ...dados, email: v })}
                isRequired
              />
            </div>
            <SeletorEstadoCidade
              idPrefix="cliente-perfil"
              estadoSelecionado={dados.estado}
              cidadeSelecionada={dados.cidade}
              onEstadoChange={handleEstado}
              onCidadeChange={handleCidade}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                isDisabled={salvando}
                className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
              >
                <Save size={16} className="mr-2" />
                {salvando ? "Salvando..." : "Salvar alterações"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onPress={() => navigate(-1)}
              >
                Cancelar
              </Button>
            </div>
          </form>
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
            Desativar sua conta esconde você das buscas e bloqueia novas
            interações. Seus dados ficam preservados — basta fazer login pra
            reativar tudo automaticamente.
          </p>
          <Button
            variant="danger-soft"
            onPress={() => setConfirmarExcluir(true)}
          >
            <PowerOff size={16} className="mr-2" />
            Desativar minha conta
          </Button>
        </CardContent>
      </Card>

      <ConfirmacaoModal
        aberto={confirmarExcluir}
        aoFechar={(open) => !open && setConfirmarExcluir(false)}
        titulo="Desativar conta?"
        mensagem={
          <>
            Você vai sair das buscas e seu perfil de artista (se existir) também
            será pausado.
            <br />
            <br />
            <strong>Seus dados ficam preservados</strong> — solicitações,
            avaliações e histórico continuam intactos. Pra voltar, basta fazer
            login com seu e-mail e senha de novo.
          </>
        }
        textoConfirmar="Sim, desativar"
        textoCancelar="Cancelar"
        variante="destrutivo"
        carregando={excluindo}
        onConfirmar={handleDesativarConta}
      />
    </div>
  );
}
