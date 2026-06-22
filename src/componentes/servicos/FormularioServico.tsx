import { useState } from "react";
import { Button } from "@heroui/react";
import type { Servico, MidiaServico } from "../../tipos/servicos";
import { Campo, AreaTexto, Caixa } from "../ui/Campo";

interface FormularioServicoProps {
  servicoInicial?: Servico;
  onSubmit: (dados: {
    titulo: string;
    descricao?: string;
    midia?: MidiaServico[];
    ativo: boolean;
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
  const [titulo, setTitulo] = useState(servicoInicial?.titulo || "");
  const [descricao, setDescricao] = useState(
    servicoInicial?.descricao || "",
  );
  const [ativo, setAtivo] = useState(servicoInicial?.ativo ?? true);

  const imagemInicial =
    servicoInicial?.midia?.find((m) => m.tipo === "imagem")?.url || "";
  const videoInicial =
    servicoInicial?.midia?.find((m) => m.tipo === "video")?.url || "";

  const [imageUrl, setImageUrl] = useState(imagemInicial);
  const [videoUrl, setVideoUrl] = useState(videoInicial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const midia: MidiaServico[] = [];
    if (imageUrl.trim()) midia.push({ tipo: "imagem", url: imageUrl.trim() });
    if (videoUrl.trim()) midia.push({ tipo: "video", url: videoUrl.trim() });

    await onSubmit({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      midia: midia.length > 0 ? midia : undefined,
      ativo,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Campo
        label="Título do serviço"
        value={titulo}
        onChange={setTitulo}
        isRequired
        placeholder="Ex: Show acústico, Apresentação de circo..."
      />
      <AreaTexto
        label="Descrição"
        value={descricao}
        onChange={setDescricao}
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
      <Caixa isSelected={ativo} onChange={setAtivo}>
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
