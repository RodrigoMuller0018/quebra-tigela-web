import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { Botao, CampoTexto, Cartao } from "../../componentes/ui";
import { Container, Stack } from "../../componentes/layout";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import { sucesso as avisoSucesso, erro as avisoErro } from "../../utilitarios/avisos";

interface DadosPerfil {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
}

export default function PerfilCliente() {
  const { usuario } = useAutenticacao();
  const navigate = useNavigate();
  const [dadosPerfil, setDadosPerfil] = useState<DadosPerfil>({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // Carregar dados do cliente
    // Por enquanto usar dados do token
    if (usuario) {
      setDadosPerfil({
        nome: usuario.email || "",
        email: usuario.email || "",
        telefone: "",
        cidade: "",
        estado: "",
      });
    }
  }, [usuario]);

  // Callbacks para mudança de estado e cidade
  const handleEstadoChange = useCallback((estado: string) => {
    setDadosPerfil(prev => ({ ...prev, estado }));
  }, []);

  const handleCidadeChange = useCallback((cidade: string) => {
    setDadosPerfil(prev => ({ ...prev, cidade }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    try {
      // TODO: Implementar chamada à API para atualizar perfil
      console.log("Salvando perfil:", dadosPerfil);

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 500));

      avisoSucesso("Perfil atualizado com sucesso!");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  function handleCancelar() {
    navigate(-1);
  }

  return (
    <Container size="full">
      <Cartao>
        <h2 className="perfil-header" style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "700" }}>
          Meu Perfil
        </h2>

        <form onSubmit={handleSubmit}>
          <Stack spacing="medium">
            <CampoTexto
              id="nome-perfil"
              name="nome"
              label="Nome Completo"
              type="text"
              value={dadosPerfil.nome}
              onChange={(e) => setDadosPerfil({ ...dadosPerfil, nome: e.target.value })}
              required
            />

            <CampoTexto
              id="email-perfil"
              name="email"
              label="E-mail"
              type="email"
              value={dadosPerfil.email}
              onChange={(e) => setDadosPerfil({ ...dadosPerfil, email: e.target.value })}
              required
            />

            <CampoTexto
              id="telefone-perfil"
              name="telefone"
              label="Telefone"
              type="tel"
              value={dadosPerfil.telefone}
              onChange={(e) => setDadosPerfil({ ...dadosPerfil, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />

            <SeletorEstadoCidade
              estadoSelecionado={dadosPerfil.estado}
              cidadeSelecionada={dadosPerfil.cidade}
              onEstadoChange={handleEstadoChange}
              onCidadeChange={handleCidadeChange}
              idPrefix="cliente-perfil"
            />

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <Botao type="submit" variante="primaria" disabled={salvando}>
                {salvando ? "Salvando..." : "💾 Salvar Alterações"}
              </Botao>
              <Botao type="button" variante="fantasma" onClick={handleCancelar}>
                Cancelar
              </Botao>
            </div>
          </Stack>
        </form>
      </Cartao>
    </Container>
  );
}
