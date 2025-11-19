import { createContext, useContext, useState, type ReactNode } from "react";
import { decodificarToken, type TokenPayload } from "../utilitarios/jwt";

type UserType = "client" | "artist";

type AuthContextType = {
  token: string | null;
  usuario: TokenPayload | null;
  userType: UserType | null;
  role: "client" | "artist" | "admin" | null;
  login: (token: string, userType: UserType) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  usuario: null,
  userType: null,
  role: null,
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

  const [role, setRole] = useState<"client" | "artist" | "admin" | null>(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const payload = storedToken ? decodificarToken(storedToken) : null;
      return payload?.role || null;
    } catch {
      return null;
    }
  });

  function login(newToken: string, newUserType: UserType) {
    console.log("🔐 CONTEXT DEBUG - login() chamado:", { userType: newUserType });

    try {
      localStorage.setItem("token", newToken);
      localStorage.setItem("userType", newUserType);
      console.log("✅ CONTEXT DEBUG - userType salvo no localStorage:", newUserType);
    } catch (error) {
      console.error("❌ CONTEXT DEBUG - Erro ao salvar no localStorage:", error);
    }

    const payload = decodificarToken(newToken);
    console.log("🔐 CONTEXT DEBUG - Token decodificado:", {
      sub: payload?.sub,
      email: payload?.email,
      role: payload?.role
    });

    setToken(newToken);
    setUserType(newUserType);
    setUsuario(payload);
    setRole(payload?.role || null);

    console.log("✅ CONTEXT DEBUG - Estado atualizado:", {
      userType: newUserType,
      role: payload?.role
    });
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
    setRole(null);
  }

  return <AuthContext.Provider value={{ token, usuario, userType, role, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAutenticacao() {
  return useContext(AuthContext);
}
