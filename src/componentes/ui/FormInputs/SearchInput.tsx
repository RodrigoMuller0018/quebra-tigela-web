import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

/**
 * Input de busca moderno com ícone e botão de limpar
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, showClearButton = true, value, onChange, className = '', ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '');

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    const displayValue = value !== undefined ? value : internalValue;

    return (
      <div className="input-group mb-3">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          ref={ref}
          type="search"
          className={`form-control ${className}`}
          value={displayValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            onChange?.(e);
          }}
          {...props}
        />
        {showClearButton && displayValue && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
