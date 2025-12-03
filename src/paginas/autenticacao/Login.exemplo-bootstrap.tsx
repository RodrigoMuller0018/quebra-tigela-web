import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { autenticar } from "../../api/autenticacao.api";
import { useAutenticacao } from "../../contexts/Autenticacao.context";

/**
 * LoginPagina - EXEMPLO DE MIGRAÇÃO PARA BOOTSTRAP 5
 *
 * Esta é uma versão EXEMPLO mostrando como a página de login ficaria
 * totalmente migrada para Bootstrap 5, sem usar componentes customizados.
 *
 * Principais mudanças:
 * 1. Container do Bootstrap (container-sm para telas pequenas)
 * 2. Card do Bootstrap com classes utilitárias
 * 3. Form do Bootstrap com floating labels
 * 4. Buttons do Bootstrap
 * 5. Alerts do Bootstrap
 * 6. Grid e spacing utilities do Bootstrap
 *
 * NOTA: Este é um arquivo de EXEMPLO. A versão principal ainda usa
 * os componentes customizados que já foram migrados internamente.
 */

export default function LoginPaginaExemploBootstrap() {
  const nav = useNavigate();
  const { login } = useAutenticacao();
  const [email, setEmail] = useState(localStorage.getItem("lembrar_email") || "");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErro("");
    try {
      const { token, userType } = await autenticar(email, senha);
      login(token, userType);

      if (lembrar) {
        localStorage.setItem("lembrar_email", email);
      }

      if (userType === "client") {
        nav("/cliente");
      } else if (userType === "artist") {
        nav("/artista");
      } else {
        nav("/cliente");
      }
    } catch (err: any) {
      setErro(err?.message ?? "Falha no login");
    } finally {
      setBusy(false);
    }
  }

  return (
    // Container do Bootstrap - pequeno e centralizado
    <div className="container-sm" style={{ maxWidth: "520px" }}>
      <div className="row justify-content-center min-vh-100 align-items-center py-5">
        <div className="col-12">
          {/* Card do Bootstrap com shadow e border radius customizados */}
          <div className="card shadow-custom-md rounded-custom">
            <div className="card-body p-4">
              {/* Título e Subtítulo */}
              <h1 className="h2 fw-black mb-2">Entrar</h1>
              <p className="text-secondary mb-4">
                Acesse sua conta para continuar
              </p>

              {/* Alert de Erro (Bootstrap) */}
              {erro && (
                <div
                  className="alert alert-danger alert-dismissible fade show"
                  role="alert"
                >
                  {erro}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setErro("")}
                    aria-label="Fechar"
                  ></button>
                </div>
              )}

              {/* Formulário com Bootstrap */}
              <form onSubmit={handleEntrar}>
                {/* Campo E-mail com Floating Label */}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email-login"
                    name="email"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email-login">E-mail</label>
                </div>

                {/* Campo Senha com Floating Label */}
                <div className="form-floating mb-3">
                  <input
                    type="password"
                    className="form-control"
                    id="senha-login"
                    name="senha"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <label htmlFor="senha-login">Senha</label>
                </div>

                {/* Checkbox Lembrar (Bootstrap) */}
                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="lembrar-email-login"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="lembrar-email-login">
                    Lembrar e-mail neste dispositivo
                  </label>
                </div>

                {/* Botão de Submit (Bootstrap) */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              {/* Links de Atalho usando Flexbox do Bootstrap */}
              <div className="d-flex align-items-center justify-content-center gap-3 mt-4 flex-wrap">
                <Link
                  to="/autenticacao/esqueci-senha"
                  className="text-primary text-decoration-none fw-bold small"
                >
                  ESQUECEU A SENHA?
                </Link>
                <span className="text-primary opacity-75">|</span>
                <Link
                  to="/registro"
                  className="text-primary text-decoration-none fw-bold small"
                >
                  CRIAR CONTA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
