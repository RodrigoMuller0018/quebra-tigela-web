import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { obterArtistaPorId, obterMeuPerfil, atualizarArtista } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, CampoTexto, Botao, CaixaSelecao } from "../../componentes/ui";
import { Container, Stack } from "../../componentes/layout";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";
import { obterIdDoToken, obterRoleDoToken } from "../../utilitarios/jwt";
import { PerfilPublicoArtista } from "../../componentes/artistas/PerfilPublicoArtista";
import { VerificacaoIdentidade } from "../../componentes/verificacao";
import { useEhDispositivoMovel } from "../../utilitarios/dispositivo";

export default function DetalheArtistaPagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mostrarVerificacao, setMostrarVerificacao] = useState(false);
  const ehDispositivoMovel = useEhDispositivoMovel();

  // Verificar se está em modo preview (visualização pública forçada)
  const modoPreview = searchParams.get("preview") === "true";

  // Verificar se o usuário logado é o próprio artista
  const usuarioLogadoId = obterIdDoToken();
  const userRole = obterRoleDoToken();
  // Verificar se é o próprio artista ANTES de carregar os dados
  // Se estiver em modo preview, forçar visualização pública mesmo sendo o próprio artista
  const ehProprioArtista = !modoPreview && usuarioLogadoId && id && usuarioLogadoId === id;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setCarregando(true);
      try {
        let data: Artista;

        // Se for o próprio artista, usar obterMeuPerfil (que usa /api/artists/${id} sem /profile)
        // Caso contrário, usar obterArtistaPorId (que usa /api/artists/${id}/profile para perfis públicos)
        if (ehProprioArtista) {
          data = await obterMeuPerfil();
        } else {
          data = await obterArtistaPorId(id);
        }

        setArtista(data);
      } catch (e: any) {
        console.error("Erro ao buscar artista:", e);
        avisoErro(e?.message ?? "Erro ao buscar artista");
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, ehProprioArtista]);

  // Callbacks para mudança de estado e cidade (evita recriação a cada render)
  const handleEstadoChange = useCallback((estado: string) => {
    setArtista(prev => prev ? { ...prev, state: estado } : null);
  }, []);

  const handleCidadeChange = useCallback((cidade: string) => {
    setArtista(prev => prev ? { ...prev, city: cidade } : null);
  }, []);

  async function handleSalvar() {
    if (!id || !artista) return;
    setSalvando(true);
    try {
      const dados = {
        name: artista.name,
        bio: artista.bio,
        city: artista.city,
        state: artista.state,
        artTypes: artista.artTypes,
      };
      await atualizarArtista(id, dados);
      avisoSucesso("Perfil atualizado com sucesso!");
      navigate("/artista");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  async function handleVerificacaoSucesso() {
    // Atualizar estado local do artista
    if (artista) {
      setArtista({ ...artista, verified: true });
    }
    setMostrarVerificacao(false);
    avisoSucesso("Identidade verificada com sucesso! Agora você pode receber solicitações.");

    // Recarregar dados do perfil do servidor
    if (id) {
      try {
        const data = await obterMeuPerfil();
        setArtista(data);
      } catch (e) {
        console.error("Erro ao recarregar perfil:", e);
      }
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (!artista) return <p>Artista não encontrado</p>;

  // Determinar para onde voltar baseado no tipo de usuário
  const voltarPara = userRole === "artist" ? "/artista" : "/artistas";
  const textoVoltar = userRole === "artist" ? "Voltar para Dashboard" : "Voltar para Artistas";

  // Se não for o próprio artista, mostrar perfil público (visualização readonly)
  if (!ehProprioArtista) {
    return (
      <Container size="full">
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <Botao
            variante="fantasma"
            onClick={() => navigate(voltarPara)}
            className="btn-voltar"
          >
            <span style={{ fontSize: "1.1rem" }}>←</span>
            {textoVoltar}
          </Botao>
          {/* Se estiver em modo preview (próprio artista visualizando), mostrar botão para editar */}
          {modoPreview && usuarioLogadoId === id && (
            <Botao
              variante="primaria"
              onClick={() => navigate(`/artistas/${id}`)}
            >
              ✏️ Editar Perfil
            </Botao>
          )}
        </div>
        <PerfilPublicoArtista artista={artista} />
      </Container>
    );
  }

  // Se for o próprio artista, mostrar formulário editável
  return (
    <Container size="full">
      <div style={{ marginBottom: "1.5rem" }}>
        <Botao
          variante="fantasma"
          onClick={() => navigate(voltarPara)}
          className="btn-voltar"
        >
          <span style={{ fontSize: "1.1rem" }}>←</span>
          {textoVoltar}
        </Botao>
      </div>

      {/* Modal de Verificação */}
      {mostrarVerificacao && id && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <VerificacaoIdentidade
              artistId={id}
              onSucesso={handleVerificacaoSucesso}
              onCancelar={() => setMostrarVerificacao(false)}
            />
          </div>
        </div>
      )}

      {/* Banner de Verificação (só aparece em dispositivos móveis e se não verificado) */}
      {ehDispositivoMovel && !artista.verified && (
        <Cartao style={{
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none"
        }}>
          <Stack spacing="medium">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚠️</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", color: "white" }}>
                Conta Não Verificada
              </h3>
              <p style={{ fontSize: "0.875rem", marginBottom: "1rem", opacity: 0.9 }}>
                Verifique sua identidade para receber solicitações de shows e aparecer nas buscas
              </p>
            </div>
            <Botao
              variante="primaria"
              grande
              onClick={() => setMostrarVerificacao(true)}
              style={{
                background: "white",
                color: "#667eea",
                fontWeight: "700"
              }}
            >
              📸 Verificar Identidade Agora
            </Botao>
            <p style={{ fontSize: "0.75rem", textAlign: "center", opacity: 0.8 }}>
              💡 Você precisará tirar uma selfie e uma foto do seu documento
            </p>
          </Stack>
        </Cartao>
      )}

      <Cartao>
        <h2 className="perfil-header" style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "700" }}>
          Editar Meu Perfil
        </h2>

        <Stack spacing="medium">
          <CampoTexto
            id="nome-detalhe"
            name="nome"
            label="Nome Artístico"
            type="text"
            value={artista.name}
            onChange={(e) => setArtista({ ...artista, name: e.target.value })}
            required
          />

          <CampoTexto
            id="bio-detalhe"
            name="bio"
            label="Biografia"
            type="text"
            value={artista.bio || ""}
            onChange={(e) => setArtista({ ...artista, bio: e.target.value })}
            placeholder="Conte um pouco sobre você e seu trabalho..."
          />

          <CampoTexto
            id="tipos-arte-detalhe"
            name="tiposArte"
            label="Tipos de Arte (separados por vírgula)"
            type="text"
            value={artista.artTypes.join(", ")}
            onChange={(e) =>
              setArtista({
                ...artista,
                artTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Ex: Pintura, Escultura, Fotografia"
            required
          />

          <SeletorEstadoCidade
            estadoSelecionado={artista.state || ""}
            cidadeSelecionada={artista.city || ""}
            onEstadoChange={handleEstadoChange}
            onCidadeChange={handleCidadeChange}
            idPrefix="artista-detalhe"
          />

          <CaixaSelecao
            id="verificado-detalhe"
            name="verificado"
            texto="Perfil Verificado"
            checked={artista.verified}
            disabled={true}
          />

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Botao variante="primaria" onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : "💾 Salvar Alterações"}
            </Botao>
            <Botao variante="fantasma" onClick={() => navigate(voltarPara)}>
              Cancelar
            </Botao>
          </div>
        </Stack>
      </Cartao>
    </Container>
  );
}
