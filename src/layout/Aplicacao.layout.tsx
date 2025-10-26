import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAutenticacao } from "../contexts/Autenticacao.context";

export default function AplicacaoLayout() {
  const { token, usuario, userType, logout } = useAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [sidebarAberta, setSidebarAberta] = useState(true);

  // Efeito para simular verificação inicial de autenticação
  useEffect(() => {
    // Simular pequeno delay para verificação de autenticação
    const timer = setTimeout(() => {
      setCarregandoInicial(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Verificar se estamos em uma rota de autenticação
  const rotasAutenticacao = ["/", "/login", "/registro", "/autenticacao/esqueci-senha", "/autenticacao/redefinir-senha"];
  const estaEmRotaAutenticacao = rotasAutenticacao.includes(location.pathname);

  // Obter ID do usuário para link de edição de perfil
  const userId = usuario?.sub;

  // Mostrar indicador de carregamento inicial
  if (carregandoInicial) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "var(--color-text-secondary, #666)",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  // Definir se mostra sidebar (não mostrar em rotas de autenticação)
  const mostrarSidebar = token && usuario && !estaEmRotaAutenticacao;

  return (
    <div className="app-layout">
      {/* Sidebar Lateral */}
      {mostrarSidebar && (
        <>
          {/* Overlay para mobile */}
          {sidebarAberta && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarAberta(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`sidebar ${sidebarAberta ? 'sidebar-aberta' : 'sidebar-fechada'}`}>
            {/* Header da Sidebar */}
            <div className="sidebar-header">
              <div className="sidebar-brand">
                <span className="brand-icon">🎨</span>
                {sidebarAberta && <span className="brand-text">Quebra-Tigela</span>}
              </div>
              {sidebarAberta && (
                <button
                  className="sidebar-toggle"
                  onClick={() => setSidebarAberta(!sidebarAberta)}
                  aria-label="Recolher menu"
                  title="Recolher menu"
                >
                  ←
                </button>
              )}
            </div>

            {/* Botão de toggle flutuante quando fechada */}
            {!sidebarAberta && (
              <button
                className="sidebar-toggle-float"
                onClick={() => setSidebarAberta(!sidebarAberta)}
                aria-label="Expandir menu"
                title="Expandir menu"
              >
                →
              </button>
            )}

            {/* Perfil do Usuário */}
            {sidebarAberta && (
              <div className="sidebar-perfil">
                <div className="perfil-avatar">
                  {usuario?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="perfil-info">
                  <div className="perfil-nome">{usuario?.email?.split('@')[0]}</div>
                  <div className="perfil-tipo">
                    {userType === 'client' ? 'Cliente' : 'Artista'}
                  </div>
                </div>
              </div>
            )}

            {/* Menu de Navegação */}
            <nav className="sidebar-nav">
              {userType === "client" ? (
                <>
                  <Link
                    to="/cliente"
                    className={`nav-item ${location.pathname === "/cliente" ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">🏠</span>
                    {sidebarAberta && <span className="nav-texto">Início</span>}
                  </Link>
                  <Link
                    to="/artistas"
                    className={`nav-item ${location.pathname.startsWith("/artistas") ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">🎨</span>
                    {sidebarAberta && <span className="nav-texto">Artistas</span>}
                  </Link>
                  <Link
                    to="/cliente/perfil"
                    className={`nav-item ${location.pathname === "/cliente/perfil" ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">👤</span>
                    {sidebarAberta && <span className="nav-texto">Meu Perfil</span>}
                  </Link>
                </>
              ) : userType === "artist" ? (
                <>
                  <Link
                    to="/artista"
                    className={`nav-item ${location.pathname === "/artista" ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">📊</span>
                    {sidebarAberta && <span className="nav-texto">Dashboard</span>}
                  </Link>
                  {userId && (
                    <Link
                      to={`/artistas/${userId}`}
                      className={`nav-item ${location.pathname === `/artistas/${userId}` ? "nav-item-ativo" : ""}`}
                    >
                      <span className="nav-icon">✏️</span>
                      {sidebarAberta && <span className="nav-texto">Editar Perfil</span>}
                    </Link>
                  )}
                  <Link
                    to="/artistas"
                    className={`nav-item ${location.pathname === "/artistas" ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">🎨</span>
                    {sidebarAberta && <span className="nav-texto">Ver Artistas</span>}
                  </Link>
                </>
              ) : null}
            </nav>

            {/* Botão de Logout */}
            <div className="sidebar-footer">
              <button
                onClick={handleLogout}
                className="nav-item nav-item-logout"
              >
                <span className="nav-icon">🚪</span>
                {sidebarAberta && <span className="nav-texto">Sair</span>}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Conteúdo Principal */}
      <div className={`main-content ${mostrarSidebar ? (sidebarAberta ? 'com-sidebar-aberta' : 'com-sidebar-fechada') : 'sem-sidebar'}`}>
        {/* Top bar simples (apenas para mobile) */}
        {mostrarSidebar && (
          <div className="topbar-mobile">
            <button
              className="menu-hamburger"
              onClick={() => setSidebarAberta(!sidebarAberta)}
            >
              ☰
            </button>
            <strong className="brand">Quebra-Tigela</strong>
          </div>
        )}

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
