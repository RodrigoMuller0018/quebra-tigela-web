import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useAutenticacao } from "../contexts/Autenticacao.context";

export default function Pagina404() {
  const { token, modoAtivo } = useAutenticacao();

  // Pra quem tá logado, "voltar ao início" leva ao dashboard do modo atual.
  // Pra quem não tá, leva pro login (que é a rota /).
  const destino = !token
    ? "/login"
    : modoAtivo === "artista"
      ? "/artista"
      : "/cliente";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-display text-7xl font-black text-gradient-brand">
        404
      </h1>
      <h2 className="font-display text-2xl font-bold">Página não encontrada</h2>
      <p className="max-w-md text-[color:var(--muted)]">
        Parece que esta tela ainda não existe ou foi movida.
      </p>
      <Link to={destino}>
        <Button
          variant="primary"
          size="lg"
          className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
        >
          <ArrowLeft size={18} className="mr-2" />
          Voltar ao início
        </Button>
      </Link>
    </div>
  );
}
