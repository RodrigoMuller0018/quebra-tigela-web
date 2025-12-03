import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { texto?: string; className?: string };

export function CaixaSelecao({ texto, className = "", id, name, ...rest }: Props) {
  // Gerar ID único se não fornecido
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <div className={`form-check caixa-selecao-wrapper ${className}`.trim()}>
        <input
          type="checkbox"
          id={checkboxId}
          name={name || checkboxId}
          className="form-check-input"
          {...rest}
        />
        {texto ? (
          <label className="form-check-label" htmlFor={checkboxId}>
            {texto}
          </label>
        ) : null}
      </div>

      <style>{`
        /* Checkbox padronizado com Bootstrap */
        .caixa-selecao-wrapper.form-check {
          margin: 0.55rem 0 !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        .caixa-selecao-wrapper .form-check-input[type="checkbox"] {
          width: 1.125rem !important;
          height: 1.125rem !important;
          margin: 0 !important;
          padding: 0 !important;
          flex-shrink: 0 !important;
          float: none !important;
          vertical-align: middle !important;
          background-color: #ffffff !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          background-size: contain !important;
          border: 1px solid #dee2e6 !important;
          border-radius: 0.25rem !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          print-color-adjust: exact !important;
          cursor: pointer !important;
        }

        .caixa-selecao-wrapper .form-check-input[type="checkbox"]:checked {
          background-color: #0d6efd !important;
          border-color: #0d6efd !important;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e") !important;
        }

        .caixa-selecao-wrapper .form-check-input[type="checkbox"]:focus {
          outline: 0 !important;
          border-color: #86b7fe !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        .caixa-selecao-wrapper .form-check-input[type="checkbox"]:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        .caixa-selecao-wrapper .form-check-label {
          color: var(--text-secondary) !important;
          font-size: 0.95rem !important;
          line-height: 1.125rem !important;
          margin: 0 !important;
          padding: 0 !important;
          cursor: pointer !important;
          user-select: none !important;
          display: inline-block !important;
          vertical-align: middle !important;
        }

        .caixa-selecao-wrapper .form-check-input[type="checkbox"]:disabled + .form-check-label {
          cursor: not-allowed !important;
          opacity: 0.7 !important;
        }
      `}</style>
    </>
  );
}
