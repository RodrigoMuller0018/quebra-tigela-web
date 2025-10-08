import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  acaoTexto?: string;
  onAcaoClick?: () => void;
  className?: string;
};

export function CampoTexto({ label, acaoTexto, onAcaoClick, className = "", id, name, ...rest }: Props) {
  const cls = ["field", className].filter(Boolean).join(" ");
  const inputCls = ["field__input", (rest.type === "password" ? "pr" : "")].filter(Boolean).join(" ");

  // Gerar ID único se não fornecido
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cls}>
      <input
        {...rest}
        id={inputId}
        name={name || inputId}
        placeholder=" "
        className={inputCls}
      />
      {label && <label htmlFor={inputId} className="field__label">{label}</label>}
      {acaoTexto && (
        <button type="button" className="field__action" onClick={onAcaoClick}>
          {acaoTexto}
        </button>
      )}
    </div>
  );
}
