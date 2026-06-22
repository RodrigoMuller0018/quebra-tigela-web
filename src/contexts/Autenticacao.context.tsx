import { createContext, useContext, useState, type ReactNode } from "react";
import { decodificarToken, type PayloadToken } from "../utilitarios/jwt";

export type ModoAtivo = "cliente" | "artista";

type AuthContextType = {
  token: string | null;
  usuario: PayloadToken | null;
  papel: "cliente" | "admin" | null;
  /** Tem perfil de artista linkado (independente do modo ativo) */
  temPerfilArtista: boolean;
  /** Artista._id se temPerfilArtista=true */
  artistaId: string | null;
  /** Modo atual da UI ('cliente' ou 'artista') */
  modoAtivo: ModoAtivo;
  alternarModo: () => void;
  setModoAtivo: (modo: ModoAtivo) => void;
  login: (token: string) => void;
  logout: () => void;
  /**
   * Contador incrementado quando o usuário atualiza dados do próprio perfil
   * (ex: salva foto, nome, cidade). Componentes que cacheiam dados do usuário
   * em outras telas (ex: avatar na sidebar) usam isso como dep do useEffect
   * pra refetch sem precisar de navegação.
   */
  perfilAtualizadoEm: number;
  marcarPerfilAtualizado: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  usuario: null,
  papel: null,
  temPerfilArtista: false,
  artistaId: null,
  modoAtivo: "cliente",
  alternarModo: () => {},
  setModoAtivo: () => {},
  login: () => {},
  logout: () => {},
  perfilAtualizadoEm: 0,
  marcarPerfilAtualizado: () => {},
});

const STORAGE_MODE_KEY = "modoAtivo";

function lerModoSalvo(temArtista: boolean): ModoAtivo {
  try {
    const salvo = localStorage.getItem(STORAGE_MODE_KEY);
    if (salvo === "cliente" || salvo === "artista") {
      if (salvo === "artista" && !temArtista) return "cliente";
      return salvo;
    }
  } catch {
    // ignore
  }
  return temArtista ? "artista" : "cliente";
}

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [usuario, setUsuario] = useState<PayloadToken | null>(() => {
    try {
      const tokenGuardado = localStorage.getItem("token");
      return tokenGuardado ? decodificarToken(tokenGuardado) : null;
    } catch {
      return null;
    }
  });

  const papel = usuario?.papel === "admin" ? "admin" : usuario ? "cliente" : null;
  const temPerfilArtista = !!usuario?.temPerfilArtista;
  const artistaId = usuario?.artistaId ?? null;

  const [modoAtivo, setModoAtivoState] = useState<ModoAtivo>(() =>
    lerModoSalvo(!!usuario?.temPerfilArtista),
  );

  const [perfilAtualizadoEm, setPerfilAtualizadoEm] = useState(0);
  function marcarPerfilAtualizado() {
    setPerfilAtualizadoEm(Date.now());
  }

  function setModoAtivo(modo: ModoAtivo) {
    if (modo === "artista" && !temPerfilArtista) return;
    try {
      localStorage.setItem(STORAGE_MODE_KEY, modo);
    } catch {
      // ignore
    }
    setModoAtivoState(modo);
  }

  function alternarModo() {
    if (!temPerfilArtista) return;
    setModoAtivo(modoAtivo === "cliente" ? "artista" : "cliente");
  }

  function login(novoToken: string) {
    try {
      localStorage.setItem("token", novoToken);
    } catch {
      // ignore
    }

    const payload = decodificarToken(novoToken);
    const novoTemArtista = !!payload?.temPerfilArtista;
    const novoModo = lerModoSalvo(novoTemArtista);

    setToken(novoToken);
    setUsuario(payload);
    setModoAtivoState(novoModo);
    try {
      localStorage.setItem(STORAGE_MODE_KEY, novoModo);
    } catch {
      // ignore
    }
  }

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem(STORAGE_MODE_KEY);
    } catch {
      // ignore
    }
    setToken(null);
    setUsuario(null);
    setModoAtivoState("cliente");
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        papel,
        temPerfilArtista,
        artistaId,
        modoAtivo,
        alternarModo,
        setModoAtivo,
        login,
        logout,
        perfilAtualizadoEm,
        marcarPerfilAtualizado,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAutenticacao() {
  return useContext(AuthContext);
}
