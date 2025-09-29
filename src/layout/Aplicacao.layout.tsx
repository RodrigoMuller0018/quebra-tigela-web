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
        <strong className="brand">Quebra-Tigela</strong>

        {token && token.trim().length > 0 && (
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "auto",
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "1px solid #ccc",
              borderRadius: "4px"
            }}
          >
            Sair
          </button>
        )}
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
