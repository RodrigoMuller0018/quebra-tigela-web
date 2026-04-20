import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAutenticacao } from "../contexts/Autenticacao.context";

interface RotaProtegidaProps {
  children: ReactNode;
}

export default function RotaProtegida({ children }: RotaProtegidaProps) {
  const { token } = useAutenticacao();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
