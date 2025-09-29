import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variante = "primaria" | "fantasma" | "perigo";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: Variante;
    primaria?: boolean;
    grande?: boolean;
  }
>;

export function Botao({
  variante,
  primaria,
  grande,
  className = "",
  children,
  ...rest
}: Props) {
  const modo: Variante =
    variante ?? (primaria === false ? "fantasma" : "primaria");

  const classes = [
    "btn",
    grande ? "btn-big" : "",
    modo === "primaria" ? "btn-primary" : "",
    modo === "fantasma" ? "btn-ghost" : "",
    modo === "perigo" ? "btn-danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
