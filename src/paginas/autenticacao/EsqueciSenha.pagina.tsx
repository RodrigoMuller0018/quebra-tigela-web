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
    <div>
      <h1>Esqueci minha senha</h1>
      <Cartao style={{ maxWidth: 420 }}>
        <form onSubmit={handleEnviar} className="form-grid" style={{ display: "grid", gap: 12 }}>
          <CampoTexto label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <Botao type="submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar"}
            </Botao>
          </div>
        </form>

        <div className="shortcuts">
          <Link to="/login" className="shortcut">
            Já lembrou? <strong>ENTRAR</strong>
          </Link>
        </div>
      </Cartao>
    </div>
  );
}
