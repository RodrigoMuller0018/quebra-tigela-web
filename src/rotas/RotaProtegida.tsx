import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAutenticacao } from "../contexts/Autenticacao.context";

interface RotaProtegidaProps {
  children: ReactNode;
}

export default function RotaProtegida({ children }: RotaProtegidaProps) {
  const { token, userType } = useAutenticacao();

  console.log("🛡️ ROTA PROTEGIDA DEBUG - Verificando acesso:", {
    hasToken: !!token,
    userType,
    pathname: window.location.pathname
  });

  // Se não há token, redireciona para login
  if (!token) {
    console.log("❌ ROTA PROTEGIDA DEBUG - Sem token, redirecionando para /login");
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza o conteúdo protegido
  console.log("✅ ROTA PROTEGIDA DEBUG - Acesso permitido, renderizando conteúdo");
  return <>{children}</>;
}
