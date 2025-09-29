import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import { obterArtistaPorId } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, Botao } from "../../componentes/ui";
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
    <div className="container">
      <h1 className="title">Meu Dashboard</h1>
      <p className="subtitle">Gerencie seu perfil e acompanhe sua atividade</p>

      <div className="grid-2" style={{ gap: 24, alignItems: "start" }}>
        {/* Perfil do Artista */}
        <Cartao>
          <h2 style={{ marginBottom: 16 }}>Meu Perfil</h2>

          {carregando ? (
            <p>Carregando perfil...</p>
          ) : artista ? (
            <div className="perfil-info">
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}>{artista.name}</h3>
                <p style={{ color: "#666", marginBottom: 8 }}>
                  📧 {artista.email}
                </p>
                <p style={{ color: "#666", marginBottom: 12 }}>
                  📍 {artista.city && artista.state ? `${artista.city} - ${artista.state}` : 'Localização não informada'}
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8 }}>Especialidades:</h4>
                <div className="art-types">
                  {artista.artTypes.map((tipo, index) => (
                    <span
                      key={index}
                      className="tag"
                      style={{
                        display: "inline-block",
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "0.9em",
                        marginRight: "8px",
                        marginBottom: "8px"
                      }}
                    >
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>

              {artista.bio && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 8 }}>Biografia:</h4>
                  <p style={{
                    color: "#555",
                    lineHeight: 1.5,
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "8px"
                  }}>
                    {artista.bio}
                  </p>
                </div>
              )}

              <div className="acoes-perfil" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link
                  to={`/artistas/${artista.id}`}
                  className="btn btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  Ver Meu Perfil Público
                </Link>
                <Botao variante="secundario" disabled>
                  Editar Perfil
                </Botao>
              </div>
            </div>
          ) : perfilIncompleto ? (
            <div className="perfil-incompleto" style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "3em", marginBottom: 16 }}>🎨</div>
              <h3 style={{ marginBottom: 12, color: "#333" }}>Complete seu perfil de artista</h3>
              <p style={{ color: "#666", marginBottom: 20, lineHeight: 1.5 }}>
                Você ainda não completou seu perfil de artista. Complete suas informações
                para que os clientes possam encontrar e conhecer seu trabalho.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Botao variante="primario" disabled>
                  Completar Perfil
                </Botao>
                <Botao variante="secundario" onClick={carregarPerfil}>
                  Tentar Novamente
                </Botao>
              </div>
            </div>
          ) : (
            <div className="perfil-nao-encontrado">
              <p style={{ color: "#666", marginBottom: 16 }}>
                Erro ao carregar seu perfil de artista.
              </p>
              <Botao onClick={carregarPerfil}>
                Tentar Novamente
              </Botao>
            </div>
          )}
        </Cartao>

        {/* Estatísticas e Ações */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Estatísticas */}
          <Cartao>
            <h2 style={{ marginBottom: 16 }}>Estatísticas</h2>

            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="stat-item" style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <div style={{ fontSize: "2em", fontWeight: "bold", color: "#1976d2", marginBottom: 4 }}>
                  --
                </div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>
                  Visualizações do Perfil
                </div>
              </div>

              <div className="stat-item" style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <div style={{ fontSize: "2em", fontWeight: "bold", color: "#1976d2", marginBottom: 4 }}>
                  --
                </div>
                <div style={{ fontSize: "0.9em", color: "#666" }}>
                  Contatos Recebidos
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.8em", color: "#888", marginTop: 12, textAlign: "center" }}>
              Dados em breve
            </p>
          </Cartao>

          {/* Ações Rápidas */}
          <Cartao>
            <h2 style={{ marginBottom: 16 }}>Ações Rápidas</h2>

            <div className="acoes-rapidas" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Botao disabled style={{ justifyContent: "flex-start" }}>
                📨 Ver Solicitações (Em breve)
              </Botao>

              <Botao disabled style={{ justifyContent: "flex-start" }}>
                📊 Relatórios (Em breve)
              </Botao>

              <Link
                to="/artistas"
                className="btn btn-secondary"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                🎨 Ver Outros Artistas
              </Link>
            </div>
          </Cartao>

          {/* Dicas */}
          <Cartao>
            <h2 style={{ marginBottom: 16 }}>💡 Dicas para Artistas</h2>

            <div className="dicas" style={{ fontSize: "0.9em", lineHeight: 1.5 }}>
              <ul style={{ paddingLeft: 20, color: "#555" }}>
                <li style={{ marginBottom: 8 }}>
                  Complete seu perfil com uma biografia detalhada
                </li>
                <li style={{ marginBottom: 8 }}>
                  Adicione exemplos do seu trabalho
                </li>
                <li style={{ marginBottom: 8 }}>
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
    </div>
  );
}