import "./Switch.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel: string;
  rightLabel: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false,
  className = ""
}: SwitchProps) {
  const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={`switch-container ${className}`}>
      <input
        id={switchId}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="switch-input"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
      />
      <label htmlFor={switchId} className="switch-label">
        <div className="switch-track">
          <div className="switch-option">
            {leftLabel}
          </div>
          <div className="switch-option">
            {rightLabel}
          </div>
        </div>
      </label>
    </div>
  );
}