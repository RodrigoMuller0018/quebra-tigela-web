import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@heroui/react";
import { Wrench, Play } from "lucide-react";
import { popularBancoComArtistas } from "../../scripts/popularArtistas";

export default function PopularArtistasDevPagina() {
  const [executando, setExecutando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  async function handlePopular() {
    setExecutando(true);
    setLogs([]);

    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs((prev) => [...prev, `[LOG] ${args.join(" ")}`]);
      originalLog(...args);
    };
    console.error = (...args) => {
      setLogs((prev) => [...prev, `[ERROR] ${args.join(" ")}`]);
      originalError(...args);
    };

    try {
      await popularBancoComArtistas();
    } catch (error) {
      console.error("Erro geral:", error);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      setExecutando(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--warning)]/15 px-3 py-1 text-xs font-medium text-[color:var(--warning)]">
          <Wrench size={12} />
          Página de desenvolvimento
        </span>
        <h1 className="font-display text-3xl font-bold text-gradient-brand">
          Popular banco — artistas fictícios
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Cria 5 artistas de exemplo no banco para testar a aplicação
        </p>
      </header>

      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader>
          <h2 className="font-display text-xl font-bold">
            Artistas que serão cadastrados
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <strong>Marina Silva Santos</strong> — Pintura e Arte Abstrata
              (Florianópolis)
            </li>
            <li>
              <strong>Carlos Eduardo Müller</strong> — Escultura e Artesanato
              (Blumenau)
            </li>
            <li>
              <strong>Ana Carolina Rodrigues</strong> — Fotografia e Retratos
              (Joinville)
            </li>
            <li>
              <strong>Rafael Gomes Oliveira</strong> — Música e Composição
              (Chapecó)
            </li>
            <li>
              <strong>Juliana Costa Pereira</strong> — Dança e Coreografia
              (Lages)
            </li>
          </ul>
          <p className="text-sm text-[color:var(--muted)]">
            Todos os artistas terão a senha:{" "}
            <code className="rounded bg-[color:var(--surface-secondary)] px-2 py-0.5 font-mono text-xs">
              teste123
            </code>
          </p>

          <Button
            variant="primary"
            size="lg"
            onPress={handlePopular}
            isDisabled={executando}
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            <Play size={16} className="mr-2" />
            {executando ? "Executando..." : "Popular banco"}
          </Button>

          {logs.length > 0 && (
            <div className="mt-2">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-[color:var(--muted)]">
                Logs de execução
              </h3>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-black/80 p-4 font-mono text-xs">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.includes("[ERROR]")
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <CardHeader>
          <h2 className="font-display text-base font-bold">Instruções</h2>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-1 text-sm leading-relaxed">
            <li>1. Clique no botão acima para cadastrar os 5 artistas</li>
            <li>2. Aguarde a execução (alguns segundos)</li>
            <li>3. Vá para a página de busca para ver os resultados</li>
            <li>
              4. Você pode logar como qualquer um dos artistas com a senha{" "}
              <code className="rounded bg-[color:var(--surface)] px-1.5 py-0.5 font-mono text-xs">
                teste123
              </code>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
