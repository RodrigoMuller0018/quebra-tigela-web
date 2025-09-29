import type { InputHTMLAttributes } from "react";
import s from "./CaixaSelecao.module.css";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { texto?: string; className?: string };

export function CaixaSelecao({ texto, className = "", ...rest }: Props) {
  return (
    <label className={[s.wrap, className].join(" ").trim()}>
      <input type="checkbox" className={s.box} {...rest} />
      {texto ? <span className={s.txt}>{texto}</span> : null}
    </label>
  );
}
