import type { HTMLAttributes, PropsWithChildren } from "react";

export function Cartao({ className = "", children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return <div {...rest} className={["card", "form-card", className].join(" ").trim()}>{children}</div>;
}
