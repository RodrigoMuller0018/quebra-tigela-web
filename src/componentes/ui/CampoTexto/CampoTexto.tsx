import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "../Icons";

/**
 * CampoTexto - Migrado para Bootstrap 5
 *
 * Usa a classe .form-floating do Bootstrap para labels flutuantes.
 * Mantém compatibilidade com a API existente.
 *
 * @example
 * // Novo padrão (recomendado)
 * <CampoTexto label="Senha" type="password" showPasswordToggle />
 *
 * // Padrão antigo (ainda suportado)
 * <CampoTexto label="Senha" type={showPassword ? "text" : "password"} acaoTexto={showPassword ? "OCULTAR" : "EXIBIR"} onAcaoClick={() => setShowPassword(!showPassword)} />
 */

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  acaoTexto?: string; // Deprecated: use showPasswordToggle instead
  onAcaoClick?: () => void; // Deprecated: handled automatically
  showPasswordToggle?: boolean; // New: automatically show eye icon for password
  className?: string;
};

export function CampoTexto({
  label,
  acaoTexto,
  onAcaoClick,
  showPasswordToggle,
  className = "",
  id,
  name,
  type,
  ...rest
}: Props) {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  // Detectar se é campo de senha e deve mostrar toggle automaticamente
  const isPasswordField = type === "password" || showPasswordToggle;
  const shouldShowToggle = showPasswordToggle || (isPasswordField && !acaoTexto);

  // Determinar o tipo do input baseado no estado
  const inputType = shouldShowToggle
    ? (internalShowPassword ? "text" : "password")
    : type;

  // Classes do Bootstrap para floating labels
  const containerClasses = [
    "form-floating",  // Bootstrap floating label
    "mb-3",          // Margin bottom do Bootstrap
    "position-relative", // Para posicionar o botão de toggle
    className
  ].filter(Boolean).join(" ");

  const inputClasses = [
    "form-control",   // Bootstrap form control
  ].filter(Boolean).join(" ");

  // Gerar ID único se não fornecido
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleTogglePassword = () => {
    if (onAcaoClick) {
      // Usar callback externo se fornecido (compatibilidade)
      onAcaoClick();
    } else {
      // Usar estado interno
      setInternalShowPassword(!internalShowPassword);
    }
  };

  return (
    <div className={containerClasses}>
      {/* Label PRIMEIRO (em cima) */}
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}

      {/* Input DEPOIS */}
      <input
        {...rest}
        type={inputType}
        id={inputId}
        name={name || inputId}
        placeholder={label || ""}
        className={inputClasses}
      />

      {/* Botão de toggle senha */}
      {shouldShowToggle && (
        <button
          type="button"
          className="field__action field__action--icon"
          onClick={handleTogglePassword}
          aria-label={internalShowPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {internalShowPassword ? <EyeOff /> : <Eye />}
        </button>
      )}

      {/* Padrão antigo: texto (deprecated) */}
      {acaoTexto && !shouldShowToggle && (
        <button
          type="button"
          className="field__action"
          onClick={onAcaoClick}
        >
          {acaoTexto}
        </button>
      )}
    </div>
  );
}
