import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { autenticar } from "../../api/autenticacao.api";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { Cartao } from "../../componentes/ui/Cartao/Cartao";
import { CampoTexto } from "../../componentes/ui/CampoTexto/CampoTexto";
import { Botao } from "../../componentes/ui/Botao/Botao";
import { Container } from "../../componentes/layout";

export default function LoginPagina() {
  const nav = useNavigate();
  const { login } = useAutenticacao();
  const [email, setEmail] = useState(localStorage.getItem("lembrar_email") || "");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErro("");
    try {
      console.log("🚀 LOGIN DEBUG - Iniciando autenticação...");
      const { token, userType } = await autenticar(email, senha);
      console.log("✅ LOGIN DEBUG - Autenticação bem-sucedida:", {
        userType,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 20) + "..."
      });

      login(token, userType);
      console.log("✅ LOGIN DEBUG - login() do contexto executado");

      if (lembrar) {
        localStorage.setItem("lembrar_email", email);
        console.log("💾 LOGIN DEBUG - Email salvo para lembrar");
      }

      // Redirecionar baseado no userType retornado da tentativa dupla
      console.log("🔀 LOGIN DEBUG - Preparando redirecionamento:", { userType });

      if (userType === "client") {
        console.log("➡️ LOGIN DEBUG - Redirecionando para /cliente");
        nav("/cliente");
      } else if (userType === "artist") {
        console.log("➡️ LOGIN DEBUG - Redirecionando para /artista");
        nav("/artista");
      } else {
        console.warn("⚠️ LOGIN DEBUG - userType desconhecido, usando fallback:", userType);
        nav("/cliente");
      }
    } catch (err: any) {
      console.error("❌ LOGIN DEBUG - Erro na autenticação:", {
        message: err?.message,
        response: err?.response?.data
      });
      setErro(err?.message ?? "Falha no login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container size="small">
      <Cartao>
      <h1 className="title">Entrar</h1>
      <p className="subtitle">Acesse sua conta para continuar</p>

      {erro && <div className="alert">{erro}</div>}


      <form onSubmit={handleEntrar}>
        <CampoTexto
          id="email-login"
          name="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <CampoTexto
          id="senha-login"
          name="senha"
          label="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          showPasswordToggle
          required
        />

        <label htmlFor="lembrar-email-login" className="remember">
          <input
            type="checkbox"
            id="lembrar-email-login"
            name="lembrar"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
          />
          Lembrar e-mail neste dispositivo
        </label>

        <Botao type="submit" className="btn-primary btn-big" disabled={busy}>
          {busy ? "Entrando..." : "Entrar"}
        </Botao>
      </form>

      <div className="shortcuts">
        <Link to="/autenticacao/esqueci-senha" className="shortcut">ESQUECEU A SENHA?</Link>
        <span className="shortcut-sep">|</span>
        <Link to="/registro" className="shortcut">CRIAR CONTA</Link>
      </div>
    </Cartao>
    </Container>
  );
}
