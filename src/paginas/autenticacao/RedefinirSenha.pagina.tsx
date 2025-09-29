import { useState } from "react";
import { redefinirSenha } from "../../api/senha.api";
import { Cartao, CampoTexto, Botao } from "../../componentes/ui";
import { sucesso as avisoSucesso, erro as avisoErro } from "../../utilitarios/avisos";

export default function RedefinirSenha() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await redefinirSenha(email, codigo, senha);
      avisoSucesso("Senha redefinida.");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao redefinir senha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>Redefinir senha</h1>
      <Cartao style={{ maxWidth: 420 }}>
        <form onSubmit={handleRedefinir} className="form-grid" style={{ display: "grid", gap: 12 }}>
          <CampoTexto label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <CampoTexto label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <CampoTexto label="Nova senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <div>
            <Botao type="submit" disabled={enviando}>
              {enviando ? "Redefinindo..." : "Redefinir"}
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
