import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, CardHeader, CardContent } from "@heroui/react";
import { autenticar, reativarConta } from "../../api/autenticacao.api";
import { LogoQuebraTigela } from "../../componentes/ui/LogoQuebraTigela";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { Campo, CampoSenha, Caixa } from "../../componentes/ui/Campo";
import { ConfirmacaoModal } from "../../componentes/ui/ConfirmacaoModal";

export default function LoginPagina() {
  const nav = useNavigate();
  const { login } = useAutenticacao();
  const [email, setEmail] = useState(
    localStorage.getItem("lembrar_email") || "",
  );
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const [modalReativar, setModalReativar] = useState(false);
  const [reativando, setReativando] = useState(false);

  function aposLogin(token: string, temPerfilArtista: boolean) {
    login(token);
    if (lembrar) localStorage.setItem("lembrar_email", email);
    else localStorage.removeItem("lembrar_email");
    nav(temPerfilArtista ? "/artista" : "/cliente");
  }

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro("");
    try {
      const { token, temPerfilArtista } = await autenticar(email, senha);
      aposLogin(token, temPerfilArtista);
    } catch (err: any) {
      // Backend sinaliza conta desativada com 409 + contaDesativada=true
      const contaDesativada =
        err?.response?.status === 409 &&
        err?.response?.data?.contaDesativada === true;
      if (contaDesativada) {
        setModalReativar(true);
      } else {
        setErro(err?.message ?? "Falha no login");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmarReativar() {
    setReativando(true);
    try {
      const { token, temPerfilArtista } = await reativarConta(email, senha);
      setModalReativar(false);
      aposLogin(token, temPerfilArtista);
    } catch (err: any) {
      setErro(err?.message ?? "Falha ao reativar conta");
      setModalReativar(false);
    } finally {
      setReativando(false);
    }
  }

  return (
    <>
      <Card className="w-full max-w-md border border-[color:var(--border)] bg-[color:var(--surface)]/90 shadow-2xl backdrop-blur-xl">
        <CardHeader className="flex flex-col items-start gap-2 pb-2">
          <LogoQuebraTigela size={48} className="rounded-2xl" />
          <h1 className="font-display text-3xl font-bold text-gradient-brand">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Entre na sua conta para continuar
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-4">
          {erro && (
            <div className="rounded-xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[color:var(--danger)]">
              {erro}
            </div>
          )}

          <form onSubmit={handleEntrar} className="flex flex-col gap-4">
            <Campo
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
              isRequired
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />

            <CampoSenha
              label="Senha"
              value={senha}
              onChange={setSenha}
              isRequired
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <Caixa isSelected={lembrar} onChange={setLembrar}>
                Lembrar e-mail
              </Caixa>
              <Link
                to="/autenticacao/esqueci-senha"
                className="text-sm font-medium text-[color:var(--accent)] hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isDisabled={busy}
              fullWidth
              className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
            >
              {busy ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-2 text-center text-sm text-[color:var(--muted)]">
            Ainda não tem conta?{" "}
            <Link
              to="/registro"
              className="font-semibold text-[color:var(--accent)] hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>

      <ConfirmacaoModal
        aberto={modalReativar}
        aoFechar={(open) => !open && setModalReativar(false)}
        titulo="Conta desativada"
        mensagem={
          <>
            Sua conta está desativada. Deseja <strong>reativar</strong> e
            continuar usando o Quebra Tigela?
            <br />
            <br />
            Se você também tinha perfil de artista, ele volta a ficar ativo
            junto.
          </>
        }
        textoConfirmar="Sim, reativar"
        textoCancelar="Cancelar"
        carregando={reativando}
        onConfirmar={handleConfirmarReativar}
      />
    </>
  );
}
