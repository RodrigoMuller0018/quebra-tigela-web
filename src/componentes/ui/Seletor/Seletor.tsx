import type { SelectHTMLAttributes } from "react";
import s from "./Seletor.module.css";

export function Seletor({ className = "", ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={[s.select, className].join(" ").trim()} />;
}
