import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Camera, Trash2, Upload } from "lucide-react";
import { AvatarPerfil } from "./AvatarPerfil";
import { erro as avisoErro } from "../../utilitarios/avisos";

interface UploadFotoPerfilProps {
  /** Foto atual (data URL ou URL). Mostrada como preview. */
  fotoAtual?: string;
  /** Nome — usado como fallback de iniciais quando não há foto */
  nome: string;
  /** Disparado quando uma nova foto é selecionada e processada (data URL base64) */
  onChange: (novaFoto: string | undefined) => void;
  /** Dimensão alvo (quadrada). Default 512. */
  tamanhoAlvo?: number;
  /** Qualidade JPEG (0–1). Default 0.85. */
  qualidade?: number;
  /** Tamanho máximo do arquivo de entrada em MB. Default 8MB. */
  tamanhoMaxMB?: number;
  /** Desabilita interação enquanto processa/salva externamente */
  desabilitado?: boolean;
}

const TIPOS_ACEITOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Faz crop centrado quadrado + resize via canvas, devolve data URL JPEG.
 * Mantém tudo no cliente — nenhum dado original sai do browser.
 */
function processarImagem(
  file: File,
  tamanhoAlvo: number,
  qualidade: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo não é uma imagem válida"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tamanhoAlvo;
        canvas.height = tamanhoAlvo;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Navegador não suporta canvas"));
          return;
        }
        // Crop quadrado centrado
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, tamanhoAlvo, tamanhoAlvo);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function UploadFotoPerfil({
  fotoAtual,
  nome,
  onChange,
  tamanhoAlvo = 512,
  qualidade = 0.85,
  tamanhoMaxMB = 8,
  desabilitado,
}: UploadFotoPerfilProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo

    if (!file) return;

    if (!TIPOS_ACEITOS.includes(file.type)) {
      avisoErro("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > tamanhoMaxMB * 1024 * 1024) {
      avisoErro(`Arquivo muito grande. Máximo ${tamanhoMaxMB}MB.`);
      return;
    }

    setProcessando(true);
    try {
      const dataUrl = await processarImagem(file, tamanhoAlvo, qualidade);
      onChange(dataUrl);
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao processar imagem");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <AvatarPerfil
          foto={fotoAtual}
          nome={nome}
          tamanho="xl"
          className="ring-2 ring-[color:var(--accent)]/30"
        />
        {fotoAtual && (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-lg">
            <Camera size={12} />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEITOS.join(",")}
          onChange={handleArquivo}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onPress={() => inputRef.current?.click()}
            isDisabled={desabilitado || processando}
          >
            <Upload size={14} className="mr-1" />
            {processando
              ? "Processando..."
              : fotoAtual
                ? "Trocar foto"
                : "Enviar foto"}
          </Button>
          {fotoAtual && (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => onChange(undefined)}
              isDisabled={desabilitado || processando}
              className="text-[color:var(--danger)]"
            >
              <Trash2 size={14} className="mr-1" />
              Remover
            </Button>
          )}
        </div>
        <p className="text-xs text-[color:var(--muted)]">
          JPG, PNG ou WEBP. Será redimensionada pra {tamanhoAlvo}×{tamanhoAlvo}px.
        </p>
      </div>
    </div>
  );
}
