import axios, { type AxiosError } from "axios";
import { info } from "../utilitarios/avisos";

const baseURL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// anexar token se existir em localStorage (chave "token")
// EXCETO para endpoints de autenticação
http.interceptors.request.use((config) => {
  try {
    // NÃO adicionar Authorization header para endpoints de auth
    const isAuthEndpoint = config.url?.includes('/api/auth/');

    if (!isAuthEndpoint) {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// interceptor de resposta para tratamento central de erros
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error?.response?.status;
    const isAuthEndpoint = error?.config?.url?.includes('/api/auth/');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      try {
        localStorage.removeItem("token");
      } catch {
        // ignore
      }
      try {
        info("Sessão expirada. Faça login novamente.");
      } catch {
        // ignore
      }

      // Mantém a estrutura original do erro mas customiza a mensagem
      const customError = new Error("Sessão expirada") as AxiosError;
      customError.response = error.response;
      customError.config = error.config;
      return Promise.reject(customError);
    }

    // Para outros erros, mantém a estrutura original do axios
    // mas pode customizar a mensagem se necessário
    const serverMessage = (error?.response?.data as any)?.message;
    if (serverMessage) {
      const customError = new Error(serverMessage) as AxiosError;
      customError.response = error.response;
      customError.config = error.config;
      return Promise.reject(customError);
    }

    // Se não há mensagem customizada, passa o erro original
    return Promise.reject(error);
  }
);
