import {
  TextField,
  TextArea,
  Label,
  Input,
  Checkbox,
  CheckboxControl,
  CheckboxIndicator,
  CheckboxContent,
  type TextFieldRootProps,
  type CheckboxRootProps,
} from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

type CampoProps = Omit<TextFieldRootProps, "children"> & {
  label: string;
  description?: ReactNode;
  placeholder?: string;
  autoComplete?: string;
  inputClassName?: string;
};

export function Campo({
  label,
  description,
  placeholder,
  autoComplete,
  inputClassName,
  className,
  ...rest
}: CampoProps) {
  return (
    <TextField className={className ?? "flex flex-col gap-1.5"} {...rest}>
      <Label className="text-sm font-medium text-[color:var(--foreground)]">
        {label}
        {rest.isRequired && <span className="ml-1 text-[color:var(--accent)]">*</span>}
      </Label>
      <Input placeholder={placeholder} autoComplete={autoComplete} className={inputClassName} />
      {description && (
        <span className="text-xs text-[color:var(--muted)]">{description}</span>
      )}
    </TextField>
  );
}

type CampoSenhaProps = {
  label: string;
  description?: ReactNode;
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  minLength?: number;
};

/**
 * CampoSenha é totalmente custom (não usa o <Input> da HeroUI).
 * Motivo: o .input da HeroUI aplica border/bg/shadow via @apply, então
 * é praticamente impossível torná-lo "transparente dentro de um wrapper"
 * só com classes Tailwind — o border interno sempre aparece, gerando
 * dupla borda + botão olho fora. Aqui usamos <input> puro estilizado
 * pra ficar visualmente idêntico aos outros campos, e o wrapper ganha
 * o focus ring via :focus-within. Browser autofill key + ::-ms-reveal
 * são escondidos pelo CSS global em index.css.
 */
export function CampoSenha({
  label,
  description,
  placeholder,
  autoComplete = "current-password",
  value,
  onChange,
  isRequired,
  isDisabled,
  id,
  name,
  className,
  minLength,
}: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);
  const reactId = useId();
  const inputId = id ?? `senha-${reactId}`;

  return (
    <div className={className ?? "flex flex-col gap-1.5"}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[color:var(--foreground)]"
      >
        {label}
        {isRequired && (
          <span className="ml-1 text-[color:var(--accent)]">*</span>
        )}
      </label>
      <div
        className={
          "flex w-full items-center gap-1 rounded-[var(--field-radius,0.625rem)] border border-[color:var(--field-border,var(--border))] bg-[color:var(--field-background,var(--surface))] pr-1 shadow-sm transition focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/30 " +
          (isDisabled ? "cursor-not-allowed opacity-60" : "")
        }
      >
        <input
          id={inputId}
          name={name}
          type={visivel ? "text" : "password"}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={isRequired}
          disabled={isDisabled}
          minLength={minLength}
          className="campo-senha-input min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--field-placeholder,var(--muted))] focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
          disabled={isDisabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[color:var(--muted)] transition hover:bg-[color:var(--surface-secondary)] hover:text-[color:var(--foreground)] disabled:pointer-events-none"
        >
          {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {description && (
        <span className="text-xs text-[color:var(--muted)]">{description}</span>
      )}
    </div>
  );
}

type AreaTextoProps = {
  label: string;
  description?: ReactNode;
  placeholder?: string;
  isRequired?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  className?: string;
  textareaClassName?: string;
};

export function AreaTexto({
  label,
  description,
  placeholder,
  isRequired,
  value,
  onChange,
  rows,
  className,
  textareaClassName,
}: AreaTextoProps) {
  return (
    <TextField
      className={className ?? "flex flex-col gap-1.5"}
      value={value}
      onChange={onChange}
      isRequired={isRequired}
    >
      <Label className="text-sm font-medium text-[color:var(--foreground)]">
        {label}
        {isRequired && <span className="ml-1 text-[color:var(--accent)]">*</span>}
      </Label>
      <TextArea
        placeholder={placeholder}
        rows={rows}
        className={textareaClassName}
      />
      {description && (
        <span className="text-xs text-[color:var(--muted)]">{description}</span>
      )}
    </TextField>
  );
}

type CaixaProps = Omit<CheckboxRootProps, "children"> & {
  children: ReactNode;
};

export function Caixa({ children, className, ...rest }: CaixaProps) {
  return (
    <Checkbox
      className={className ?? "flex cursor-pointer items-center gap-2 text-sm"}
      {...rest}
    >
      <CheckboxControl className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-[color:var(--border)] bg-[color:var(--surface)] data-[selected=true]:border-[color:var(--accent)] data-[selected=true]:bg-[color:var(--accent)]">
        <CheckboxIndicator>
          {({ isSelected }) =>
            isSelected ? (
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-3.5 w-3.5 text-white"
              >
                <path
                  d="M5 10l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null
          }
        </CheckboxIndicator>
      </CheckboxControl>
      <CheckboxContent>{children}</CheckboxContent>
    </Checkbox>
  );
}
