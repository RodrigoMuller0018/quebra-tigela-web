import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Bootstrap Integration - loaded via CDN in index.html
import "./estilos/bootstrap-integration.css";

// Custom theme and styles
import "./estilos/tema.css";

// Dark theme with orange accent (overwrites light theme variables)
import "./estilos/theme-dark-orange.css";

// Simple forms system (Tailwind-style - labels acima, sem floating)
import "./estilos/forms-simple.css";

// Modern buttons system (Tailwind-inspired)
import "./estilos/buttons-dark.css";

import "./index.css";
import "./App.css";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Elemento #root não encontrado");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
