import type { InputHTMLAttributes } from "react";
import s from "./CaixaSelecao.module.css";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { texto?: string; className?: string };

export function CaixaSelecao({ texto, className = "", id, name, ...rest }: Props) {
  // Gerar ID único se não fornecido
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={checkboxId} className={[s.wrap, className].join(" ").trim()}>
      <input
        type="checkbox"
        id={checkboxId}
        name={name || checkboxId}
        className={s.box}
        {...rest}
      />
      {texto ? <span className={s.txt}>{texto}</span> : null}
    </label>
  );
}
