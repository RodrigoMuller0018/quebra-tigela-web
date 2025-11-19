import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAutenticacao } from "../contexts/Autenticacao.context";

export default function AplicacaoLayout() {
  const { token, usuario, userType, logout } = useAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  // Sidebar: SEMPRE fechada inicialmente
  // Só abre quando o usuário clicar no botão
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Efeito para simular verificação inicial de autenticação
  useEffect(() => {
    // Simular pequeno delay para verificação de autenticação
    const timer = setTimeout(() => {
      setCarregandoInicial(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fechar sidebar automaticamente quando redimensionar para mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      // Apenas fecha no mobile, não abre automaticamente no desktop
      if (isMobile && sidebarAberta) {
        setSidebarAberta(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarAberta]);

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
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarAberta ? 'sidebar-aberta' : 'sidebar-fechada'}`}>
            {/* Botão X para fechar (visível APENAS no mobile) */}
            <button
              className="sidebar-close-mobile"
              onClick={() => setSidebarAberta(false)}
              aria-label="Fechar menu"
              title="Fechar menu"
            >
              ✕
            </button>

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
                    to="/artista/agenda"
                    className={`nav-item ${location.pathname === "/artista/agenda" ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">📅</span>
                    {sidebarAberta && <span className="nav-texto">Minha Agenda</span>}
                  </Link>
                  <Link
                    to="/artista/servicos"
                    className={`nav-item ${location.pathname === "/artista/servicos" ? "nav-item-ativo" : ""}`}
                  >
                    <span className="nav-icon">🎭</span>
                    {sidebarAberta && <span className="nav-texto">Meus Serviços</span>}
                  </Link>
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

          {/* Overlay para mobile - aparece quando sidebar está aberta */}
          {sidebarAberta && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarAberta(false)}
            />
          )}
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
