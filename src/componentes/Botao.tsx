import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function Botao(props: Props) {
  return (
    <button {...props} style={{ padding: "8px 12px", cursor: "pointer" }}>
      {props.children}
    </button>
  );
}
