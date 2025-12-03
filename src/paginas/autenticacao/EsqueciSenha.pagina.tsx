import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { solicitarRedefinicaoSenha, redefinirSenha } from "../../api/senha.api";
import { Cartao, CampoTexto, Botao } from "../../componentes/ui";
import { Stack } from "../../componentes/layout";
import { sucesso as avisoSucesso, erro as avisoErro } from "../../utilitarios/avisos";

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

  function handleVoltar() {
    if (etapa === "codigo") {
      setEtapa("email");
      setCodigo("");
      setNovaSenha("");
      setConfirmaSenha("");
    }
  }

  return (
    <Cartao>
      {etapa === "email" && (
        <>
          <h1 className="title">Esqueci minha senha</h1>
          <p className="subtitle">Digite seu e-mail para receber o código de redefinição</p>

          <form onSubmit={handleSolicitarCodigo}>
            <Stack spacing="medium">
              <CampoTexto
                id="email-esqueci-senha"
                name="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Botao type="submit" variante="primaria" grande disabled={processando}>
                {processando ? "Enviando..." : "Enviar Código"}
              </Botao>
            </Stack>
          </form>

          <div className="shortcuts">
            <Link to="/login" className="shortcut">
              Já lembrou? <strong>ENTRAR</strong>
            </Link>
          </div>
        </>
      )}

      {etapa === "codigo" && (
        <>
          <h1 className="title">Redefinir Senha</h1>
          <p className="subtitle">Digite o código recebido por e-mail e sua nova senha</p>

          <form onSubmit={handleRedefinirSenha}>
            <Stack spacing="medium">
              <div className="field">
                <label htmlFor="email-display" className="field__label">
                  E-mail
                </label>
                <input
                  id="email-display"
                  type="email"
                  className="field__input"
                  value={email}
                  disabled
                  readOnly
                />
              </div>

              <CampoTexto
                id="codigo-reset"
                name="codigo"
                label="Código de Verificação"
                type="text"
                value={codigo}
                onChange={(e) => {
                  const valor = e.target.value.slice(0, 6); // Limitar a 6 caracteres
                  setCodigo(valor);
                }}
                required
                placeholder="Digite o código de 6 dígitos"
              />

              <CampoTexto
                id="nova-senha"
                name="nova-senha"
                label="Nova Senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                showPasswordToggle
                required
              />

              <CampoTexto
                id="confirma-senha"
                name="confirma-senha"
                label="Confirmar Nova Senha"
                type="password"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                showPasswordToggle
                required
              />

              <Botao type="submit" variante="primaria" grande disabled={processando}>
                {processando ? "Redefinindo..." : "Redefinir Senha"}
              </Botao>

              <Botao type="button" variante="fantasma" onClick={handleVoltar}>
                ← Voltar
              </Botao>
            </Stack>
          </form>
        </>
      )}

      {etapa === "sucesso" && (
        <>
          <h1 className="title">✓ Senha Redefinida!</h1>
          <p className="subtitle">Sua senha foi alterada com sucesso. Redirecionando para o login...</p>
        </>
      )}
    </Cartao>
  );
}
