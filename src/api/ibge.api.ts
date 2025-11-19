import axios from "axios";

const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades";

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

/**
 * Busca todos os estados brasileiros ordenados por nome
 */
export async function listarEstados(): Promise<Estado[]> {
  const response = await axios.get<Estado[]>(`${IBGE_BASE_URL}/estados?orderBy=nome`);
  return response.data;
}

/**
 * Busca todas as cidades de um estado específico ordenadas por nome
 * @param uf - Sigla do estado (ex: "SP", "RJ")
 */
export async function listarCidadesPorEstado(uf: string): Promise<Cidade[]> {
  const response = await axios.get<Cidade[]>(
    `${IBGE_BASE_URL}/estados/${uf}/municipios?orderBy=nome`
  );
  return response.data;
}
