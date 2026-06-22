import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAutenticacao, type ModoAtivo } from "../contexts/Autenticacao.context";

interface RotaProtegidaProps {
  children: ReactNode;
  /**
   * Modos permitidos para acessar essa rota.
   * - omitido: qualquer logado pode acessar (rotas compartilhadas).
   * - ['cliente']: rota só do contexto cliente.
   * - ['artista']: rota só do contexto artista (precisa ter perfil de artista
   *   E estar no modo 'artista').
   */
  modos?: ModoAtivo[];
}

function homePorModo(modo: ModoAtivo): string {
  return modo === "artista" ? "/artista" : "/cliente";
}

export default function RotaProtegida({ children, modos }: RotaProtegidaProps) {
  const { token, modoAtivo, temPerfilArtista } = useAutenticacao();

  const naoAutenticado = !token;
  const semPermissao =
    !naoAutenticado &&
    modos &&
    modos.length > 0 &&
    !modos.includes(modoAtivo);

  const tentandoArtistaSemPerfil =
    !naoAutenticado &&
    modos?.includes("artista") &&
    !temPerfilArtista;

  // Redireciona silenciosamente — sem toast. Quem clicou já sabe o motivo
  // (toggle de modo, tentativa de acesso direto via URL, etc).
  if (naoAutenticado) return <Navigate to="/login" replace />;
  if (tentandoArtistaSemPerfil) return <Navigate to="/cliente/perfil" replace />;
  if (semPermissao) return <Navigate to={homePorModo(modoAtivo)} replace />;

  return <>{children}</>;
}
