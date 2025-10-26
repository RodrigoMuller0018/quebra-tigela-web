import { Link } from "react-router-dom";
import { Botao } from "../componentes/ui";

export default function Pagina404() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "6rem", margin: "0", color: "var(--color-primary, #ff6b6b)" }}>
        404
      </h1>
      <h2 style={{ fontSize: "2rem", marginTop: "1rem", marginBottom: "0.5rem" }}>
        Página não encontrada
      </h2>
      <p style={{ marginBottom: "2rem", color: "var(--color-text-secondary, #666)", fontSize: "1.1rem" }}>
        A página que você está procurando não existe.
      </p>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Botao variante="primaria" grande>
          Voltar ao Início
        </Botao>
      </Link>
    </div>
  );
}
