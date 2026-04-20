import { useState } from "react";
import { Button } from "@heroui/react";
import type { Service, ServiceMedia } from "../../tipos/servicos";
import { Campo, AreaTexto, Caixa } from "../ui/Campo";

interface FormularioServicoProps {
  servicoInicial?: Service;
  onSubmit: (dados: {
    title: string;
    description?: string;
    media?: ServiceMedia[];
    active: boolean;
  }) => Promise<void>;
  onCancelar?: () => void;
  carregando?: boolean;
}

export function FormularioServico({
  servicoInicial,
  onSubmit,
  onCancelar,
  carregando = false,
}: FormularioServicoProps) {
  const [title, setTitle] = useState(servicoInicial?.title || "");
  const [description, setDescription] = useState(
    servicoInicial?.description || ""
  );
  const [active, setActive] = useState(servicoInicial?.active ?? true);

  const imagemInicial =
    servicoInicial?.media?.find((m) => m.type === "image")?.url || "";
  const videoInicial =
    servicoInicial?.media?.find((m) => m.type === "video")?.url || "";

  const [imageUrl, setImageUrl] = useState(imagemInicial);
  const [videoUrl, setVideoUrl] = useState(videoInicial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const media: ServiceMedia[] = [];
    if (imageUrl.trim()) media.push({ type: "image", url: imageUrl.trim() });
    if (videoUrl.trim()) media.push({ type: "video", url: videoUrl.trim() });

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      media: media.length > 0 ? media : undefined,
      active,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Campo
        label="Título do serviço"
        value={title}
        onChange={setTitle}
        isRequired
        placeholder="Ex: Show acústico, Apresentação de circo..."
      />
      <AreaTexto
        label="Descrição"
        value={description}
        onChange={setDescription}
        rows={4}
        placeholder="Descreva o serviço em detalhes..."
      />
      <Campo
        label="URL da imagem"
        type="url"
        value={imageUrl}
        onChange={setImageUrl}
        placeholder="https://exemplo.com/imagem.jpg"
        description="Opcional"
      />
      <Campo
        label="URL do vídeo"
        type="url"
        value={videoUrl}
        onChange={setVideoUrl}
        placeholder="https://exemplo.com/video.mp4"
        description="Opcional"
      />
      <Caixa isSelected={active} onChange={setActive}>
        Serviço ativo (visível para clientes)
      </Caixa>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="submit"
          variant="primary"
          isDisabled={carregando}
          className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
        >
          {carregando
            ? "Salvando..."
            : servicoInicial
              ? "Atualizar"
              : "Criar serviço"}
        </Button>
        {onCancelar && (
          <Button
            type="button"
            variant="ghost"
            onPress={onCancelar}
            isDisabled={carregando}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
