import { Outlet, useNavigate } from "react-router-dom";
import { useAutenticacao } from "../contexts/Autenticacao.context";

export default function AplicacaoLayout() {
  const { token, logout } = useAutenticacao();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-content">
          <strong className="brand">Quebra-Tigela</strong>

          {token && token.trim().length > 0 && (
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Sair
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
