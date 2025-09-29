import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  acaoTexto?: string;
  onAcaoClick?: () => void;
  className?: string;
};

export function CampoTexto({ label, acaoTexto, onAcaoClick, className = "", ...rest }: Props) {
  const cls = ["field", className].filter(Boolean).join(" ");
  const inputCls = ["field__input", (rest.type === "password" ? "pr" : "")].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <input {...rest} placeholder=" " className={inputCls} />
      {label && <label className="field__label">{label}</label>}
      {acaoTexto && (
        <button type="button" className="field__action" onClick={onAcaoClick}>
          {acaoTexto}
        </button>
      )}
    </div>
  );
}
