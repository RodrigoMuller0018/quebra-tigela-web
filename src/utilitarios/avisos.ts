import { toast } from "@heroui/react";

/**
 * Dedup curta pra evitar mensagens repetidas — sintomas comuns:
 *  - React.StrictMode rodando useEffect 2x em dev
 *  - Catch que chama avisoErro + tela que mostra erro ao tentar render
 *  - Promises encadeadas que rejeitam no mesmo tick
 *
 * Mantém a UX limpa sem precisar refatorar cada caller.
 */
const ULTIMAS = new Map<string, number>();
const JANELA_DEDUP_MS = 500;

function deveExibir(chave: string): boolean {
  const agora = Date.now();
  const ultima = ULTIMAS.get(chave);
  if (ultima && agora - ultima < JANELA_DEDUP_MS) return false;
  ULTIMAS.set(chave, agora);
  // Limpa entradas antigas (não cresce sem limite)
  if (ULTIMAS.size > 50) {
    for (const [k, t] of ULTIMAS) {
      if (agora - t > JANELA_DEDUP_MS) ULTIMAS.delete(k);
    }
  }
  return true;
}

export function sucesso(msg: string) {
  if (deveExibir(`success:${msg}`)) toast.success(msg);
}

export function erro(msg: string) {
  if (deveExibir(`danger:${msg}`)) toast.danger(msg);
}

export function info(msg: string) {
  if (deveExibir(`info:${msg}`)) toast.info(msg);
}
