import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function CampoTexto({ label, ...rest }: Props) {
  return (
    <div className="campo-texto-simples">
      {label && <label className="label-simples">{label}</label>}
      <input {...rest} className="input-simples" />
    </div>
  );
}
