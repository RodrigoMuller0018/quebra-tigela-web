import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function Botao(props: Props) {
  return (
    <button {...props} className="botao-simples">
      {props.children}
    </button>
  );
}
