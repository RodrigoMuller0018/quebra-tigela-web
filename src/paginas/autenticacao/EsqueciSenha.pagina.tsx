import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardHeader, CardContent } from "@heroui/react";
import { KeyRound, Lock, Check, ArrowLeft } from "lucide-react";
import {
  solicitarRedefinicaoSenha,
  redefinirSenha,
} from "../../api/senha.api";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { Campo, CampoSenha } from "../../componentes/ui/Campo";

type Etapa = "email" | "codigo" | "sucesso";

export default function EsqueciSenha() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [processando, setProcessando] = useState(false);

  async function handleSolicitarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setProcessando(true);
    try {
      await solicitarRedefinicaoSenha(email);
      avisoSucesso("Código enviado! Verifique seu e-mail.");
      setEtapa("codigo");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao solicitar código.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleRedefinirSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmaSenha) {
      avisoErro("As senhas não conferem.");
      return;
    }
    if (novaSenha.length < 6) {
      avisoErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setProcessando(true);
    try {
      await redefinirSenha(email, codigo, novaSenha);
      avisoSucesso("Senha redefinida com sucesso!");
      setEtapa("sucesso");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao redefinir senha. Verifique o código.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-[color:var(--border)] bg-[color:var(--surface)]/90 shadow-2xl backdrop-blur-xl">
      {etapa === "email" && (
        <>
          <CardHeader className="flex flex-col items-start gap-2 pb-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
              <KeyRound size={24} />
            </span>
            <h1 className="font-display text-3xl font-bold text-gradient-brand">
              Esqueci a senha
            </h1>
            <p className="text-sm text-[color:var(--muted)]">
              Enviaremos um código de verificação para seu e-mail
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <form
              onSubmit={handleSolicitarCodigo}
              className="flex flex-col gap-4"
            >
              <Campo
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                isRequired
                autoComplete="email"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isDisabled={processando}
                fullWidth
                className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
              >
                {processando ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
            <div className="mt-2 text-center text-sm text-[color:var(--muted)]">
              Lembrou?{" "}
              <Link
                to="/login"
                className="font-semibold text-[color:var(--accent)] hover:underline"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </>
      )}

      {etapa === "codigo" && (
        <>
          <CardHeader className="flex flex-col items-start gap-2 pb-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
              <Lock size={24} />
            </span>
            <h1 className="font-display text-3xl font-bold text-gradient-brand">
              Redefinir senha
            </h1>
            <p className="text-sm text-[color:var(--muted)]">
              Código enviado para <strong>{email}</strong>
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">
            <form
              onSubmit={handleRedefinirSenha}
              className="flex flex-col gap-4"
            >
              <Campo
                label="Código de verificação"
                value={codigo}
                onChange={(v) => setCodigo(v.slice(0, 6))}
                isRequired
                placeholder="000000"
              />
              <CampoSenha
                label="Nova senha"
                value={novaSenha}
                onChange={setNovaSenha}
                isRequired
                autoComplete="new-password"
              />
              <CampoSenha
                label="Confirmar nova senha"
                value={confirmaSenha}
                onChange={setConfirmaSenha}
                isRequired
                autoComplete="new-password"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onPress={() => {
                    setEtapa("email");
                    setCodigo("");
                    setNovaSenha("");
                    setConfirmaSenha("");
                  }}
                  className="flex-1"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={processando}
                  className="flex-[2] bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
                >
                  {processando ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </div>
            </form>
          </CardContent>
        </>
      )}

      {etapa === "sucesso" && (
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <Check size={32} strokeWidth={3} />
          </span>
          <h1 className="font-display text-3xl font-bold text-gradient-brand">
            Senha redefinida!
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Redirecionando para o login...
          </p>
        </CardContent>
      )}
    </Card>
  );
}
