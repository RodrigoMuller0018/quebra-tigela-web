import { useState } from "react";
import type { Service, ServiceMedia } from "../../tipos/servicos";
import { CampoTexto, Botao } from "../ui";
import { Stack } from "../layout";

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
  const [description, setDescription] = useState(servicoInicial?.description || "");
  const [active, setActive] = useState(servicoInicial?.active ?? true);

  // URLs de mídia temporárias (simplificado)
  // Inicializar com URLs existentes se estiver editando
  const imagemInicial = servicoInicial?.media?.find(m => m.type === "image")?.url || "";
  const videoInicial = servicoInicial?.media?.find(m => m.type === "video")?.url || "";

  const [imageUrl, setImageUrl] = useState(imagemInicial);
  const [videoUrl, setVideoUrl] = useState(videoInicial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const media: ServiceMedia[] = [];
    if (imageUrl.trim()) {
      media.push({ type: "image", url: imageUrl.trim() });
    }
    if (videoUrl.trim()) {
      media.push({ type: "video", url: videoUrl.trim() });
    }

    const dadosParaEnviar = {
      title: title.trim(),
      description: description.trim() || undefined,
      media: media.length > 0 ? media : undefined,
      active,
    };

    console.log("📋 FORMULARIO SERVICO - Submetendo dados:", dadosParaEnviar);

    await onSubmit(dadosParaEnviar);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="medium">
        <CampoTexto
          id="servico-titulo"
          name="titulo"
          label="Título do Serviço *"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex: Show acústico, Apresentação de circo..."
        />

        <div className="field">
          <textarea
            id="servico-descricao"
            name="descricao"
            className="field__input"
            placeholder=" "
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ resize: "vertical", minHeight: "100px" }}
          />
          <label htmlFor="servico-descricao" className="field__label">
            Descrição
          </label>
        </div>

        <CampoTexto
          id="servico-imagem"
          name="imagem"
          label="URL da Imagem (opcional)"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
        />

        <CampoTexto
          id="servico-video"
          name="video"
          label="URL do Vídeo (opcional)"
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://exemplo.com/video.mp4"
        />

        <label htmlFor="servico-ativo" className="remember">
          <input
            type="checkbox"
            id="servico-ativo"
            name="ativo"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Serviço ativo (visível para clientes)
        </label>

        <div style={{ display: "flex", gap: "1rem" }}>
          <Botao type="submit" variante="primaria" grande disabled={carregando}>
            {carregando ? "Salvando..." : servicoInicial ? "Atualizar" : "Criar Serviço"}
          </Botao>

          {onCancelar && (
            <Botao type="button" variante="fantasma" onClick={onCancelar} disabled={carregando}>
              Cancelar
            </Botao>
          )}
        </div>
      </Stack>
    </form>
  );
}
