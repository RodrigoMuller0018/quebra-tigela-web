import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LoginPagina from "../paginas/autenticacao/Login.pagina";
import RegistroPagina from "../paginas/autenticacao/Registro.pagina";
import ListaArtistas from "../paginas/artistas/ListaArtistas.pagina";
import DetalheArtista from "../paginas/artistas/DetalheArtista.pagina";
import HomeClientePagina from "../paginas/clientes/HomeCliente.pagina";
import HomeArtistaPagina from "../paginas/artistas/HomeArtista.pagina";
import EsqueciSenha from "../paginas/autenticacao/EsqueciSenha.pagina";
import RedefinirSenha from "../paginas/autenticacao/RedefinirSenha.pagina";
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
      { path: "/autenticacao/redefinir-senha", element: <RedefinirSenha /> },

      // Rotas protegidas (requerem autenticação)

      // Rota home para clientes
      {
        path: "/cliente",
        element: (
          <RotaProtegida>
            <HomeClientePagina />
          </RotaProtegida>
        )
      },

      // Rota home para artistas
      {
        path: "/artista",
        element: (
          <RotaProtegida>
            <HomeArtistaPagina />
          </RotaProtegida>
        )
      },

      // Rotas para explorar artistas
      {
        path: "/artistas",
        element: (
          <RotaProtegida>
            <ListaArtistas />
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
    ],
  },
]);

export function AppRotas() {
  return <RouterProvider router={router} />;
}
