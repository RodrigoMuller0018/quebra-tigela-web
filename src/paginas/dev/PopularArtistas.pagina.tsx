import { useState } from "react";
import { popularBancoComArtistas } from "../../scripts/popularArtistas";
import { Cartao, Botao } from "../../componentes/ui";
import { Stack, Container } from "../../componentes/layout";

export default function PopularArtistasDevPagina() {
  const [executando, setExecutando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  async function handlePopularBanco() {
    setExecutando(true);
    setLogs([]);

    // Capturar logs do console
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
      originalError(...args);
    };

    try {
      await popularBancoComArtistas();
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      // Restaurar console original
      console.log = originalLog;
      console.error = originalError;
      setExecutando(false);
    }
  }

  return (
    <Container>
      <Stack spacing="large">
        <Stack spacing="small" align="center">
          <h1 className="title">🎨 Popular Banco - Artistas Fictícios</h1>
          <p className="subtitle">Página de desenvolvimento para cadastrar artistas de exemplo</p>
        </Stack>

        <Cartao>
          <Stack spacing="medium">
            <div>
              <h2>Artistas que serão cadastrados:</h2>
              <ul style={{ margin: "16px 0", paddingLeft: "20px", lineHeight: "1.6" }}>
                <li><strong>Marina Silva Santos</strong> - Pintura e Arte Abstrata (Florianópolis)</li>
                <li><strong>Carlos Eduardo Müller</strong> - Escultura e Artesanato (Blumenau)</li>
                <li><strong>Ana Carolina Rodrigues</strong> - Fotografia e Retratos (Joinville)</li>
                <li><strong>Rafael Gomes Oliveira</strong> - Música e Composição (Chapecó)</li>
                <li><strong>Juliana Costa Pereira</strong> - Dança e Coreografia (Lages)</li>
              </ul>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Todos os artistas terão a senha: <code>teste123</code>
              </p>
            </div>

            <Botao
              onClick={handlePopularBanco}
              disabled={executando}
              className="btn-primary"
            >
              {executando ? "Executando..." : "🚀 Popular Banco de Dados"}
            </Botao>

            {logs.length > 0 && (
              <div>
                <h3>Logs de Execução:</h3>
                <div style={{
                  backgroundColor: "#1a1a1a",
                  padding: "16px",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  maxHeight: "300px",
                  overflowY: "auto",
                  border: "1px solid var(--border)"
                }}>
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "4px",
                        color: log.includes('[ERROR]') ? "#ff6b6b" : "#50fa7b"
                      }}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Stack>
        </Cartao>

        <Cartao>
          <Stack spacing="small">
            <h3>📋 Instruções:</h3>
            <ol style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>Clique no botão acima para cadastrar os 5 artistas fictícios</li>
              <li>Aguarde a execução (pode levar alguns segundos)</li>
              <li>Após o cadastro, vá para a página de busca para ver os resultados</li>
              <li>Você pode fazer login como qualquer um dos artistas com a senha <code>teste123</code></li>
            </ol>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              ⚠️ Esta é uma página de desenvolvimento. Remova após o teste.
            </p>
          </Stack>
        </Cartao>
      </Stack>
    </Container>
  );
}