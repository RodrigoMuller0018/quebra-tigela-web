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
    <Cartao>
      <h1 className="title">Redefinir senha</h1>
      <p className="subtitle">Digite o código recebido por e-mail e sua nova senha</p>

      <form onSubmit={handleRedefinir} className="form-grid">
        <CampoTexto
          id="email-redefinir"
          name="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <CampoTexto
          id="codigo-redefinir"
          name="codigo"
          label="Código"
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          required
        />
        <CampoTexto
          id="senha-redefinir"
          name="senha"
          label="Nova senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={6}
        />

        <Botao type="submit" className="btn-primary btn-big" disabled={enviando}>
          {enviando ? "Redefinindo..." : "Redefinir"}
        </Botao>
      </form>
    </Cartao>
  );
}
