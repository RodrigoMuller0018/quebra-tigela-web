import type { SelectHTMLAttributes } from "react";

export interface OpcaoSeletor {
  value: string;
  label: string;
}

type SeletorProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label?: string;
  options: OpcaoSeletor[];
  placeholder?: string;
  className?: string;
  id?: string;
};

export function Seletor({
  label,
  options,
  placeholder = "Selecione uma opção",
  className = "",
  value,
  disabled,
  id,
  name,
  ...rest
}: SeletorProps) {
  const isFilled = value !== undefined && value !== null && value !== "";

  // Gerar ID único se não fornecido
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`field field--select ${className}`}
      data-filled={isFilled}
    >
      <select
        {...rest}
        id={selectId}
        name={name || selectId}
        value={value}
        disabled={disabled}
        className="field__input"
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={option.value || `option-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {label && <label htmlFor={selectId} className="field__label">{label}</label>}
    </div>
  );
}
