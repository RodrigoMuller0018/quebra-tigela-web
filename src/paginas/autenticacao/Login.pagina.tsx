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
  const [ver, setVer] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErro("");
    try {
      const { token, userType } = await autenticar(email, senha);
      login(token, userType);

      if (lembrar) localStorage.setItem("lembrar_email", email);

      // Redirecionar baseado no userType retornado da tentativa dupla
      console.log("🔍 LOGIN DEBUG - Redirecionando:", { userType });

      if (userType === "client") {
        nav("/cliente");
      } else if (userType === "artist") {
        nav("/artista");
      } else {
        // Fallback - não deveria acontecer
        nav("/cliente");
      }
    } catch (err: any) {
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
          type={ver ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          acaoTexto={ver ? "OCULTAR" : "EXIBIR"}
          onAcaoClick={() => setVer((v) => !v)}
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
