import { useEffect, type ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  tamanho?: "pequeno" | "medio" | "grande";
}

export function Modal({ aberto, aoFechar, titulo, children, tamanho = "medio" }: ModalProps) {
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [aberto]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && aberto) {
        aoFechar();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={aoFechar}>
      <div
        className={`modal-content modal-content--${tamanho}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-titulo">{titulo}</h2>
          <button className="modal-fechar" onClick={aoFechar} aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
