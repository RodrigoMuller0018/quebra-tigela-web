import { Campo } from "./Campo";
import {
  aplicarMascaraTelefone,
  formatarTelefoneExibicao,
  normalizarTelefone,
} from "../../utilitarios/telefone";

interface Props {
  /** Valor normalizado (55 + DDD + 9 + 8 dígitos) ou vazio. */
  value: string;
  /** Recebe o valor JÁ NORMALIZADO (com DDI 55), pronto pra enviar ao backend. */
  onChange: (normalizado: string) => void;
  label?: string;
  isRequired?: boolean;
  description?: string;
  isDisabled?: boolean;
}

/**
 * Campo de telefone celular BR com máscara progressiva.
 * O valor exibido tem máscara visual; o valor entregue no onChange é normalizado.
 */
export function CampoTelefone({
  value,
  onChange,
  label = "Telefone celular",
  isRequired,
  description,
  isDisabled,
}: Props) {
  const visivel = formatarTelefoneExibicao(value);

  function handleChange(novoValor: string) {
    const comMascara = aplicarMascaraTelefone(novoValor);
    onChange(normalizarTelefone(comMascara));
  }

  return (
    <Campo
      label={label}
      value={visivel}
      onChange={handleChange}
      isRequired={isRequired}
      isDisabled={isDisabled}
      type="tel"
      autoComplete="tel-national"
      placeholder="(11) 99999-8888"
      inputClassName="font-mono"
      description={description ?? "Usado pra clientes te chamarem no WhatsApp"}
    />
  );
}
