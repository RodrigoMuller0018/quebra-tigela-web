import { http } from "./http";

export async function autenticar(email: string, senha: string) {
  console.log("🔍 LOGIN DEBUG - Iniciando tentativa dupla de login");

  // Tentativa 1: Login como cliente
  try {
    console.log("🔍 LOGIN DEBUG - Tentativa 1: Cliente");
    const { data } = await http.post("/api/auth/login", {
      email,
      password: senha,
      accountType: "client"
    });

    console.log("✅ LOGIN DEBUG - Sucesso como CLIENTE:", data);

    const token: string | undefined =
      data?.access_token ?? data?.jwt ?? data?.token;

    if (token) {
      localStorage.setItem("token", token);
      console.log("✅ LOGIN DEBUG - Token cliente salvo:", token.substring(0, 20) + "...");
      return {
        token,
        userData: data,
        userType: "client" as const
      };
    }

    throw new Error("Token não encontrado na resposta do login");
  } catch (clientError: any) {
    console.log("❌ LOGIN DEBUG - Tentativa cliente falhou:", {
      status: clientError?.response?.status,
      message: clientError?.response?.data?.message || clientError?.message
    });

    // Se não foi erro 401, não tenta como artista
    const clientStatus = clientError?.response?.status;
    console.log("🔍 LOGIN DEBUG - Status do erro cliente:", { clientStatus, hasResponse: !!clientError?.response });

    if (clientStatus !== 401) {
      console.error("❌ LOGIN DEBUG - Erro não-401, abortando:", clientError?.message);
      throw new Error(clientError?.response?.data?.message || clientError?.message || "Erro no login");
    }

    // Tentativa 2: Login como artista
    try {
      console.log("🔍 LOGIN DEBUG - Tentativa 2: Artista");
      const { data } = await http.post("/api/auth/login", {
        email,
        password: senha,
        accountType: "artist"
      });

      console.log("✅ LOGIN DEBUG - Sucesso como ARTISTA:", data);

      const token: string | undefined =
        data?.access_token ?? data?.jwt ?? data?.token;

      if (token) {
        localStorage.setItem("token", token);
        console.log("✅ LOGIN DEBUG - Token artista salvo:", token.substring(0, 20) + "...");
        return {
          token,
          userData: data,
          userType: "artist" as const
        };
      }

      throw new Error("Token não encontrado na resposta do login");
    } catch (artistError: any) {
      console.error("❌ LOGIN DEBUG - Tentativa artista falhou:", {
        status: artistError?.response?.status,
        message: artistError?.response?.data?.message || artistError?.message
      });

      // Ambas tentativas falharam
      console.error("❌ LOGIN DEBUG - Ambas tentativas falharam");

      // Se ambas deram 401, são credenciais inválidas
      const artistStatus = artistError?.response?.status;
      console.log("🔍 LOGIN DEBUG - Status do erro artista:", { artistStatus, hasResponse: !!artistError?.response });

      if (artistStatus === 401) {
        throw new Error("Credenciais inválidas");
      }

      // Outros erros
      throw new Error(artistError?.response?.data?.message || artistError?.message || "Erro no login");
    }
  }
}

export function sair() {
  localStorage.removeItem("token");
}

export function obterToken() {
  return localStorage.getItem("token");
}
