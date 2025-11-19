import { AppRotas } from "./rotas/AppRotas";
import { AutenticacaoProvider } from "./contexts/Autenticacao.context";

export default function App() {
  return (
    <AutenticacaoProvider>
      <AppRotas />
    </AutenticacaoProvider>
  );
}
