import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPagina from "../paginas/autenticacao/Login.pagina";
import RegistroPagina from "../paginas/autenticacao/Registro.pagina";
import DetalheArtista from "../paginas/artistas/DetalheArtista.pagina";
import HomeClientePagina from "../paginas/clientes/HomeCliente.pagina";
import PerfilCliente from "../paginas/clientes/PerfilCliente.pagina";
import SolicitacoesClientePagina from "../paginas/clientes/SolicitacoesCliente.pagina";
import HomeArtistaPagina from "../paginas/artistas/HomeArtista.pagina";
import AgendaArtistaPagina from "../paginas/artistas/AgendaArtista.pagina";
import ServicosArtistaPagina from "../paginas/artistas/ServicosArtista.pagina";
import SolicitacoesArtistaPagina from "../paginas/artistas/SolicitacoesArtista.pagina";
import TornarSeArtistaPagina from "../paginas/clientes/TornarSeArtista.pagina";
import EsqueciSenha from "../paginas/autenticacao/EsqueciSenha.pagina";
import Pagina404 from "../paginas/Pagina404";
import AplicacaoLayout from "../layout/Aplicacao.layout";
import RotaProtegida from "./RotaProtegida";

const router = createBrowserRouter([
  {
    element: <AplicacaoLayout />,
    children: [
      // Rotas públicas (autenticação)
      { path: "/", element: <LoginPagina /> },
      { path: "/login", element: <LoginPagina /> },
      { path: "/registro", element: <RegistroPagina /> },
      { path: "/autenticacao/esqueci-senha", element: <EsqueciSenha /> },

      // Modo CLIENTE
      {
        path: "/cliente",
        element: (
          <RotaProtegida modos={["cliente"]}>
            <HomeClientePagina />
          </RotaProtegida>
        ),
      },
      {
        path: "/cliente/perfil",
        element: (
          <RotaProtegida modos={["cliente"]}>
            <PerfilCliente />
          </RotaProtegida>
        ),
      },
      {
        path: "/cliente/solicitacoes",
        element: (
          <RotaProtegida modos={["cliente"]}>
            <SolicitacoesClientePagina />
          </RotaProtegida>
        ),
      },
      {
        path: "/cliente/tornar-se-artista",
        element: (
          <RotaProtegida modos={["cliente"]}>
            <TornarSeArtistaPagina />
          </RotaProtegida>
        ),
      },

      // Modo ARTISTA — exige temArtistProfile=true E modoAtivo='artist'
      {
        path: "/artista",
        element: (
          <RotaProtegida modos={["artista"]}>
            <HomeArtistaPagina />
          </RotaProtegida>
        ),
      },
      {
        path: "/artista/agenda",
        element: (
          <RotaProtegida modos={["artista"]}>
            <AgendaArtistaPagina />
          </RotaProtegida>
        ),
      },
      {
        path: "/artista/servicos",
        element: (
          <RotaProtegida modos={["artista"]}>
            <ServicosArtistaPagina />
          </RotaProtegida>
        ),
      },
      {
        path: "/artista/solicitacoes",
        element: (
          <RotaProtegida modos={["artista"]}>
            <SolicitacoesArtistaPagina />
          </RotaProtegida>
        ),
      },
      // Edição do próprio perfil (JWT-based, sem id na URL)
      {
        path: "/artista/perfil",
        element: (
          <RotaProtegida modos={["artista"]}>
            <DetalheArtista />
          </RotaProtegida>
        ),
      },

      // Rotas compartilhadas — qualquer logado pode ver
      {
        path: "/artistas",
        element: (
          <RotaProtegida>
            <HomeClientePagina />
          </RotaProtegida>
        ),
      },
      // Perfil público pelo handle (estilo @username) — handle no param vem com @ na frente
      {
        path: "/artistas/:handle",
        element: (
          <RotaProtegida>
            <DetalheArtista />
          </RotaProtegida>
        ),
      },

      { path: "*", element: <Pagina404 /> },
    ],
  },
]);

export function AppRotas() {
  return <RouterProvider router={router} />;
}
