import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, Spinner } from "@heroui/react";
import { Save, Trash2 } from "lucide-react";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { Campo } from "../../componentes/ui/Campo";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";
import {
  obterUsuarioPorId,
  atualizarUsuario,
  excluirUsuario,
} from "../../api/usuarios.api";

interface DadosPerfil {
  name: string;
  email: string;
  city: string;
  state: string;
}

const INICIAL: DadosPerfil = { name: "", email: "", city: "", state: "" };

export default function PerfilCliente() {
  const { usuario, logout } = useAutenticacao();
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
          name: u.name || "",
          email: u.email || "",
          city: u.city || "",
          state: u.state || "",
        })
      )
      .catch((e) => avisoErro(e?.message ?? "Erro ao carregar perfil"))
      .finally(() => setCarregando(false));
  }, [usuario?.sub]);

  const handleEstado = useCallback((e: string) => {
    setDados((p) => ({ ...p, state: e }));
  }, []);
  const handleCidade = useCallback((c: string) => {
    setDados((p) => ({ ...p, city: c }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario?.sub) return;
    setSalvando(true);
    try {
      await atualizarUsuario(usuario.sub, {
        name: dados.name,
        email: dados.email,
        city: dados.city || undefined,
        state: dados.state || undefined,
      });
      avisoSucesso("Perfil atualizado com sucesso!");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluirConta() {
    if (!usuario?.sub) return;
    setExcluindo(true);
    try {
      await excluirUsuario(usuario.sub);
      avisoSucesso("Conta excluída.");
      logout();
      navigate("/login");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao excluir conta");
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                label="Nome completo"
                type="text"
                value={dados.name}
                onChange={(v) => setDados({ ...dados, name: v })}
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
              estadoSelecionado={dados.state}
              cidadeSelecionada={dados.city}
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
            Excluir sua conta remove todos os seus dados permanentemente.
          </p>
          <Button
            variant="danger-soft"
            onPress={() => setConfirmarExcluir(true)}
          >
            <Trash2 size={16} className="mr-2" />
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      <ConfirmacaoModal
        aberto={confirmarExcluir}
        aoFechar={(open) => !open && setConfirmarExcluir(false)}
        titulo="Excluir conta?"
        mensagem={
          <>
            Esta ação é <strong>irreversível</strong>. Sua conta e todos os seus
            dados serão removidos permanentemente.
          </>
        }
        textoConfirmar="Sim, excluir conta"
        textoCancelar="Cancelar"
        variante="destrutivo"
        carregando={excluindo}
        onConfirmar={handleExcluirConta}
      />
    </div>
  );
}
