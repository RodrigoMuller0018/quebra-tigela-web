import { useState } from "react";
import { Link } from "react-router-dom";
import { solicitarRedefinicaoSenha } from "../../api/senha.api";
import { Cartao, CampoTexto, Botao } from "../../componentes/ui";
import { sucesso as avisoSucesso, erro as avisoErro } from "../../utilitarios/avisos";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await solicitarRedefinicaoSenha(email);
      avisoSucesso("Verifique seu e-mail.");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao solicitar redefinição.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Cartao>
      <h1 className="title">Esqueci minha senha</h1>
      <p className="subtitle">Digite seu e-mail para receber instruções de redefinição</p>

      <form onSubmit={handleEnviar} className="form-grid">
        <CampoTexto
          id="email-esqueci-senha"
          name="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Botao type="submit" className="btn-primary btn-big" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar"}
        </Botao>
      </form>

      <div className="shortcuts">
        <Link to="/login" className="shortcut">
          Já lembrou? <strong>ENTRAR</strong>
        </Link>
      </div>
    </Cartao>
  );
}
