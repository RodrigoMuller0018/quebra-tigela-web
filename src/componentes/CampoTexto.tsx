import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function CampoTexto({ label, ...rest }: Props) {
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <label style={{ display: "block", marginBottom: 4 }}>{label}</label>}
      <input {...rest} style={{ padding: 8, width: "100%" }} />
    </div>
  );
}
