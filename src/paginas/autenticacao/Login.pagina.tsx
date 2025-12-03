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
      <Cartao className="login-card">
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

        <div className="form-check remember">
          <input
            type="checkbox"
            id="lembrar-email-login"
            name="lembrar"
            className="form-check-input"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
          />
          <label htmlFor="lembrar-email-login" className="form-check-label">
            Lembrar e-mail neste dispositivo
          </label>
        </div>

        <Botao type="submit" className="btn-primary btn-big" disabled={busy}>
          {busy ? "Entrando..." : "Entrar"}
        </Botao>
      </form>

      <div className="shortcuts">
        <Link to="/autenticacao/esqueci-senha" className="shortcut">ESQUECEU A SENHA?</Link>
        <span className="shortcut-sep">|</span>
        <Link to="/registro" className="shortcut">CRIAR CONTA</Link>
      </div>

      <style>{`
        /* Checkbox padronizado com Bootstrap - ALINHAMENTO VERTICAL CORRIGIDO */
        .login-card .form-check.remember {
          margin: 0.55rem 0 1.1rem 0 !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        .login-card .form-check-input[type="checkbox"] {
          width: 1.125rem !important;
          height: 1.125rem !important;
          margin: 0 !important;
          padding: 0 !important;
          flex-shrink: 0 !important;
          float: none !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          background-size: contain !important;
          border: 1px solid #dee2e6 !important;
          border-radius: 0.25rem !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          print-color-adjust: exact !important;
          cursor: pointer !important;
        }

        .login-card .form-check-input[type="checkbox"]:checked {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e") !important;
        }

        .login-card .form-check-input[type="checkbox"]:focus {
          outline: 0 !important;
          border-color: #86b7fe !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        .login-card .form-check-label {
          color: var(--text-secondary) !important;
          font-size: 0.95rem !important;
          line-height: 1.125rem !important;
          margin: 0 !important;
          padding: 0 !important;
          cursor: pointer !important;
          user-select: none !important;
          display: inline-block !important;
          vertical-align: middle !important;
        }
      `}</style>
    </Cartao>
    </Container>
  );
}
