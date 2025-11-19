import type { ReactNode } from "react";
import styles from "./Tabela.module.css";

export interface CelulaTabela {
  conteudo: ReactNode;
  className?: string;
  colspan?: number;
  rowspan?: number;
}

export interface LinhaTabela {
  celulas: CelulaTabela[];
  className?: string;
}

export interface TabelaProps {
  /**
   * Linhas da tabela com suas células
   */
  linhas: LinhaTabela[];

  /**
   * Classe CSS adicional para a tabela
   */
  className?: string;

  /**
   * Se true, usa layout de grid responsivo (recomendado para estatísticas)
   * Se false, usa table HTML nativa
   */
  usarGrid?: boolean;

  /**
   * Número de colunas quando usar grid (padrão: 2)
   */
  colunas?: number;

  /**
   * Label para acessibilidade
   */
  ariaLabel?: string;
}

/**
 * Componente Tabela genérico e reutilizável
 *
 * Suporta dois modos:
 * 1. Grid mode (usarGrid=true): Usa CSS Grid, ideal para cards/estatísticas
 * 2. Table mode (usarGrid=false): Usa <table> HTML, ideal para dados tabulares
 *
 * @example
 * // Modo Grid (2x2 para estatísticas)
 * <Tabela
 *   usarGrid
 *   colunas={2}
 *   linhas={[
 *     { celulas: [{ conteudo: <div>Célula 1</div> }, { conteudo: <div>Célula 2</div> }] },
 *     { celulas: [{ conteudo: <div>Célula 3</div> }, { conteudo: <div>Célula 4</div> }] }
 *   ]}
 * />
 */
export function Tabela({
  linhas,
  className = "",
  usarGrid = false,
  colunas = 2,
  ariaLabel
}: TabelaProps) {
  if (usarGrid) {
    // Modo Grid: Usa CSS Grid para layout responsivo
    return (
      <div
        className={`${styles.tabelaGrid} ${styles[`colunas-${colunas}`]} ${className}`}
        role="table"
        aria-label={ariaLabel}
      >
        {linhas.map((linha, linhaIdx) =>
          linha.celulas.map((celula, celulaIdx) => (
            <div
              key={`${linhaIdx}-${celulaIdx}`}
              className={`${styles.celula} ${celula.className || ""}`}
              role="cell"
            >
              {celula.conteudo}
            </div>
          ))
        )}
      </div>
    );
  }

  // Modo Table: Usa <table> HTML nativa
  return (
    <table
      className={`${styles.tabela} ${className}`}
      aria-label={ariaLabel}
    >
      <tbody>
        {linhas.map((linha, linhaIdx) => (
          <tr key={linhaIdx} className={linha.className}>
            {linha.celulas.map((celula, celulaIdx) => (
              <td
                key={celulaIdx}
                className={celula.className}
                colSpan={celula.colspan}
                rowSpan={celula.rowspan}
              >
                {celula.conteudo}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
