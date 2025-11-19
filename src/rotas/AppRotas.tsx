import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPagina from "../paginas/autenticacao/Login.pagina";
import RegistroPagina from "../paginas/autenticacao/Registro.pagina";
import DetalheArtista from "../paginas/artistas/DetalheArtista.pagina";
import HomeClientePagina from "../paginas/clientes/HomeCliente.pagina";
import PerfilCliente from "../paginas/clientes/PerfilCliente.pagina";
import HomeArtistaPagina from "../paginas/artistas/HomeArtista.pagina";
import AgendaArtistaPagina from "../paginas/artistas/AgendaArtista.pagina";
import ServicosArtistaPagina from "../paginas/artistas/ServicosArtista.pagina";
import EsqueciSenha from "../paginas/autenticacao/EsqueciSenha.pagina";
import PopularArtistasDevPagina from "../paginas/dev/PopularArtistas.pagina";
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

      // Rota de desenvolvimento - remover em produção
      { path: "/dev/popular-artistas", element: <PopularArtistasDevPagina /> },

      // Rotas protegidas (requerem autenticação)

      // Rotas para clientes
      {
        path: "/cliente",
        element: (
          <RotaProtegida>
            <HomeClientePagina />
          </RotaProtegida>
        )
      },
      {
        path: "/cliente/perfil",
        element: (
          <RotaProtegida>
            <PerfilCliente />
          </RotaProtegida>
        )
      },

      // Rotas para artistas
      {
        path: "/artista",
        element: (
          <RotaProtegida>
            <HomeArtistaPagina />
          </RotaProtegida>
        )
      },
      {
        path: "/artista/agenda",
        element: (
          <RotaProtegida>
            <AgendaArtistaPagina />
          </RotaProtegida>
        )
      },
      {
        path: "/artista/servicos",
        element: (
          <RotaProtegida>
            <ServicosArtistaPagina />
          </RotaProtegida>
        )
      },

      // Rotas para explorar artistas
      // Nota: /artistas usa HomeClientePagina que mostra a lista de artistas
      // Tanto clientes quanto artistas podem visualizar a lista
      {
        path: "/artistas",
        element: (
          <RotaProtegida>
            <HomeClientePagina />
          </RotaProtegida>
        )
      },
      {
        path: "/artistas/:id",
        element: (
          <RotaProtegida>
            <DetalheArtista />
          </RotaProtegida>
        )
      },

      // Rota 404 - deve estar por último
      {
        path: "*",
        element: <Pagina404 />
      },
    ],
  },
]);

export function AppRotas() {
  return <RouterProvider router={router} />;
}
