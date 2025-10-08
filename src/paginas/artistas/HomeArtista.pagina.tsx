import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { obterArtistaPorId } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, Botao } from "../../componentes/ui";
import { Stack, Cluster, Container } from "../../componentes/layout";
import { erro as avisoErro } from "../../utilitarios/avisos";

export default function HomeArtistaPagina() {
  const { usuario } = useAutenticacao();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);

  async function carregarPerfil() {
    if (!usuario?.sub) return;

    setCarregando(true);
    setPerfilIncompleto(false);

    try {
      // Usar o ID do token JWT decodificado (usuario.sub)
      const data = await obterArtistaPorId(usuario.sub);
      setArtista(data);
    } catch (e: any) {
      // Se der erro 404, significa que o perfil ainda não foi completado
      if (e?.response?.status === 404 || e?.message?.includes("404") || e?.message?.includes("not found")) {
        console.log("Perfil de artista não encontrado - perfil incompleto");
        setPerfilIncompleto(true);
        setArtista(null);
      } else {
        avisoErro(e?.message ?? "Erro ao carregar perfil");
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, [usuario]);

  return (
    <Container>
      <Stack spacing="large">
        <Stack spacing="small" align="center">
          <h1 className="title">Meu Dashboard</h1>
          <p className="subtitle">Gerencie seu perfil e acompanhe sua atividade</p>
        </Stack>

        <div className="grid-2 dashboard-grid">
        {/* Perfil do Artista */}
        <Cartao>
          <h2 className="perfil-header">Meu Perfil</h2>

          {carregando ? (
            <p>Carregando perfil...</p>
          ) : artista ? (
            <div className="perfil-info">
              <div className="perfil-info-item">
                <h3 className="perfil-subtitle">{artista.name}</h3>
                <p className="perfil-email">
                  📧 {artista.email}
                </p>
                <p className="perfil-location">
                  📍 {artista.city && artista.state ? `${artista.city} - ${artista.state}` : 'Localização não informada'}
                </p>
              </div>

              <div className="perfil-info-item">
                <h4 className="especialidades-header">Especialidades:</h4>
                <div className="art-types">
                  {artista.artTypes.map((tipo, index) => (
                    <span
                      key={index}
                      className="tag"
                      className="tag-art-type"
                    >
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>

              {artista.bio && (
                <div className="perfil-info-item">
                  <h4 className="bio-header">Biografia:</h4>
                  <p className="bio-content">
                    {artista.bio}
                  </p>
                </div>
              )}

              <Cluster spacing="medium" wrap={true}>
                <Link
                  to={`/artistas/${artista.id}`}
                  className="btn btn-primary link-sem-decoracao"
                >
                  Ver Meu Perfil Público
                </Link>
                <Botao variante="secundario" disabled>
                  Editar Perfil
                </Botao>
              </Cluster>
            </div>
          ) : perfilIncompleto ? (
            <div className="perfil-incompleto">
              <div className="perfil-icone">🎨</div>
              <h3 className="perfil-titulo">Complete seu perfil de artista</h3>
              <p className="perfil-descricao">
                Você ainda não completou seu perfil de artista. Complete suas informações
                para que os clientes possam encontrar e conhecer seu trabalho.
              </p>
              <Cluster spacing="medium" justify="center" wrap={true}>
                <Botao variante="primario" disabled>
                  Completar Perfil
                </Botao>
                <Botao variante="secundario" onClick={carregarPerfil}>
                  Tentar Novamente
                </Botao>
              </Cluster>
            </div>
          ) : (
            <div className="perfil-nao-encontrado">
              <p className="perfil-erro">
                Erro ao carregar seu perfil de artista.
              </p>
              <Botao onClick={carregarPerfil}>
                Tentar Novamente
              </Botao>
            </div>
          )}
        </Cartao>

        {/* Estatísticas e Ações */}
        <div className="sidebar-column">
          {/* Estatísticas */}
          <Cartao>
            <h2 className="perfil-header">Estatísticas</h2>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">
                  --
                </div>
                <div className="stat-label">
                  Visualizações do Perfil
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-number">
                  --
                </div>
                <div className="stat-label">
                  Contatos Recebidos
                </div>
              </div>
            </div>

            <p className="stats-disclaimer">
              Dados em breve
            </p>
          </Cartao>

          {/* Ações Rápidas */}
          <Cartao>
            <h2 className="perfil-header">Ações Rápidas</h2>

            <Stack spacing="medium">
              <Botao disabled className="acao-desabilitada">
                📋 Ver Solicitações (Em breve)
              </Botao>

              <Botao disabled className="acao-desabilitada">
                📊 Relatórios (Em breve)
              </Botao>

              <Link
                to="/cliente"
                className="btn btn-secondary link-sem-decoracao"
              >
                🎨 Ver Outros Artistas
              </Link>
            </Stack>
          </Cartao>

          {/* Dicas */}
          <Cartao>
            <h2 className="perfil-header">💡 Dicas para Artistas</h2>

            <div className="dicas-content">
              <ul className="dicas-lista">
                <li className="dica-item">
                  Complete seu perfil com uma biografia detalhada
                </li>
                <li className="dica-item">
                  Adicione exemplos do seu trabalho
                </li>
                <li className="dica-item">
                  Mantenha suas especialidades atualizadas
                </li>
                <li>
                  Responda rapidamente às solicitações
                </li>
              </ul>
            </div>
          </Cartao>
        </div>
        </div>
      </Stack>
    </Container>
  );
}