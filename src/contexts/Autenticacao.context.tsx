import { createContext, useContext, useState, type ReactNode } from "react";
import { decodificarToken, type TokenPayload } from "../utilitarios/jwt";

type UserType = "client" | "artist";

type AuthContextType = {
  token: string | null;
  usuario: TokenPayload | null;
  userType: UserType | null;
  login: (token: string, userType: UserType) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  usuario: null,
  userType: null,
  login: () => {},
  logout: () => {},
});

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [userType, setUserType] = useState<UserType | null>(() => {
    try {
      return localStorage.getItem("userType") as UserType;
    } catch {
      return null;
    }
  });

  const [usuario, setUsuario] = useState<TokenPayload | null>(() => {
    try {
      const storedToken = localStorage.getItem("token");
      return storedToken ? decodificarToken(storedToken) : null;
    } catch {
      return null;
    }
  });

  function login(newToken: string, newUserType: UserType) {
    try {
      localStorage.setItem("token", newToken);
      localStorage.setItem("userType", newUserType);
    } catch {
      // ignore
    }
    setToken(newToken);
    setUserType(newUserType);
    setUsuario(decodificarToken(newToken));
  }

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
    } catch {
      // ignore
    }
    setToken(null);
    setUserType(null);
    setUsuario(null);
  }

  return <AuthContext.Provider value={{ token, usuario, userType, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAutenticacao() {
  return useContext(AuthContext);
}
