/**
 * CampoTexto com Composition Pattern
 * Permite composição flexível de campos de formulário
 *
 * @example
 * <CampoTexto>
 *   <CampoTexto.Input type="email" />
 *   <CampoTexto.Label>E-mail</CampoTexto.Label>
 *   <CampoTexto.Helper>Digite seu e-mail</CampoTexto.Helper>
 *   <CampoTexto.Error>E-mail inválido</CampoTexto.Error>
 * </CampoTexto>
 */

import { createContext, useContext, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../../utilitarios/cn';
import styles from './CampoTexto.module.css';
import { Eye, EyeOff } from '../Icons';

// ===== CONTEXT =====
interface CampoTextoContextValue {
  id: string;
  hasError: boolean;
  setHasError: (hasError: boolean) => void;
}

const CampoTextoContext = createContext<CampoTextoContextValue | null>(null);

function useCampoTexto() {
  const context = useContext(CampoTextoContext);
  if (!context) {
    throw new Error('CampoTexto compound components must be used within CampoTexto');
  }
  return context;
}

// ===== ROOT =====
interface CampoTextoProps {
  children: ReactNode;
  className?: string;
}

export function CampoTextoRoot({ children, className }: CampoTextoProps) {
  const [id] = useState(() => `input-${Math.random().toString(36).substr(2, 9)}`);
  const [hasError, setHasError] = useState(false);

  return (
    <CampoTextoContext.Provider value={{ id, hasError, setHasError }}>
      <div className={cn(styles.field, className)}>{children}</div>
    </CampoTextoContext.Provider>
  );
}

// ===== INPUT =====
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function Input({ className, id: customId, name, ...rest }: InputProps) {
  const { id } = useCampoTexto();
  const inputId = customId || id;

  return (
    <input
      {...rest}
      id={inputId}
      name={name || inputId}
      placeholder=" "
      className={cn(styles.input, className)}
    />
  );
}

// ===== LABEL =====
interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

function Label({ children, htmlFor: customFor, className }: LabelProps) {
  const { id } = useCampoTexto();
  const labelFor = customFor || id;

  return (
    <label htmlFor={labelFor} className={cn(styles.label, className)}>
      {children}
    </label>
  );
}

// ===== HELPER TEXT =====
interface HelperProps {
  children: ReactNode;
  className?: string;
}

function Helper({ children, className }: HelperProps) {
  return <p className={cn(styles.helper, className)}>{children}</p>;
}

// ===== ERROR MESSAGE =====
interface ErrorProps {
  children?: ReactNode;
  className?: string;
  show?: boolean;
}

function Error({ children, className, show = true }: ErrorProps) {
  const { setHasError } = useCampoTexto();

  // Notify parent when error is shown/hidden
  if (show && children) {
    setHasError(true);
  }

  if (!show || !children) return null;

  return <p className={cn(styles.erro, className)}>{children}</p>;
}

// ===== PASSWORD INPUT (com ícones) =====
interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

function PasswordInput({ className, ...rest }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { id } = useCampoTexto();

  return (
    <>
      <input
        {...rest}
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={rest.name || id}
        placeholder=" "
        className={cn(styles.input, styles.inputWithIcon, className)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={styles.iconButton}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    </>
  );
}

// ===== EXPORTS =====
export const CampoTexto = Object.assign(CampoTextoRoot, {
  Input,
  Label,
  Helper,
  Error,
  Password: PasswordInput,
});
