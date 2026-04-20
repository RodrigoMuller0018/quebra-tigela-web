import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalCloseTrigger,
} from "@heroui/react";
import type { ReactNode } from "react";

type Tamanho = "sm" | "md" | "lg" | "xl";

interface DialogoProps {
  aberto: boolean;
  aoFechar: (aberto: boolean) => void;
  titulo?: ReactNode;
  children: ReactNode;
  tamanho?: Tamanho;
}

const SIZE_CLASS: Record<Tamanho, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  children,
  tamanho = "md",
}: DialogoProps) {
  return (
    <Modal isOpen={aberto} onOpenChange={aoFechar}>
      <ModalBackdrop>
        <ModalContainer>
          <ModalDialog
            className={`w-full ${SIZE_CLASS[tamanho]} rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl`}
          >
            {titulo && (
              <ModalHeader className="flex items-center justify-between border-b border-[color:var(--border)] px-6 py-4">
                <ModalHeading className="font-display text-lg font-bold">
                  {titulo}
                </ModalHeading>
                <ModalCloseTrigger className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]">
                  ✕
                </ModalCloseTrigger>
              </ModalHeader>
            )}
            <ModalBody className="px-6 py-5">{children}</ModalBody>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}
