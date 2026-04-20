import { useState, useRef } from "react";
import { Button, Card, CardContent, Spinner } from "@heroui/react";
import {
  Camera,
  Smile,
  IdCard,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { verificarIdentidadeArtista } from "../../api/verificacao.api";
import type { ResultadoVerificacao } from "../../tipos/verificacao";
import { erro as avisoErro } from "../../utilitarios/avisos";

interface VerificacaoIdentidadeProps {
  artistId: string;
  onSucesso: () => void;
  onCancelar: () => void;
}

type Etapa = "instrucoes" | "captura" | "processando" | "resultado";

const FORMATOS_VALIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const TAMANHO_MAX = 10 * 1024 * 1024;

export function VerificacaoIdentidade({
  artistId,
  onSucesso,
  onCancelar,
}: VerificacaoIdentidadeProps) {
  const [etapa, setEtapa] = useState<Etapa>("instrucoes");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [documento, setDocumento] = useState<File | null>(null);
  const [previewSelfie, setPreviewSelfie] = useState("");
  const [previewDocumento, setPreviewDocumento] = useState("");
  const [resultado, setResultado] = useState<ResultadoVerificacao | null>(null);

  const inputSelfieRef = useRef<HTMLInputElement>(null);
  const inputDocumentoRef = useRef<HTMLInputElement>(null);

  function lerArquivo(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string) => void
  ) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > TAMANHO_MAX) {
      avisoErro("Foto muito grande. Máximo 10MB");
      return;
    }
    if (!FORMATOS_VALIDOS.includes(arquivo.type)) {
      avisoErro("Formato inválido. Use JPG, PNG ou WEBP");
      return;
    }
    setFile(arquivo);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(arquivo);
  }

  async function handleEnviar() {
    if (!selfie || !documento) {
      avisoErro("Por favor, envie as duas fotos");
      return;
    }
    setEtapa("processando");
    try {
      const res = await verificarIdentidadeArtista(selfie, documento, artistId);
      setResultado(res);
      setEtapa("resultado");
      if (res.verified && res.status === "APPROVED") {
        setTimeout(onSucesso, 3000);
      }
    } catch (err: any) {
      setEtapa("captura");
      avisoErro(err?.message ?? "Erro ao verificar identidade.");
    }
  }

  function handleTentarNovamente() {
    setSelfie(null);
    setDocumento(null);
    setPreviewSelfie("");
    setPreviewDocumento("");
    setResultado(null);
    setEtapa("captura");
  }

  if (etapa === "instrucoes") {
    return (
      <div className="flex flex-col gap-5">
        <header className="text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
            <Camera size={28} />
          </span>
          <h2 className="font-display text-2xl font-bold text-gradient-brand">
            Verificação de identidade
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            Para receber solicitações, precisamos verificar sua identidade
          </p>
        </header>

        <Card className="border border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
          <CardContent className="flex flex-col gap-3">
            <h3 className="font-bold">Como funciona</h3>
            <ol className="flex flex-col gap-2 pl-5 text-sm leading-relaxed">
              <li>
                <strong>Tire uma selfie</strong> — câmera frontal do celular
              </li>
              <li>
                <strong>Foto do documento</strong> — RG, CNH ou outro com foto
              </li>
              <li>
                <strong>Aguarde análise</strong> — verificamos se as fotos
                conferem
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[color:var(--accent)] bg-[color:var(--accent)]/5">
          <CardContent className="flex flex-col gap-2">
            <h4 className="font-bold">Dicas</h4>
            <ul className="flex flex-col gap-1 text-sm">
              <li>• Use um local bem iluminado</li>
              <li>• Retire óculos e acessórios</li>
              <li>• Centralize o rosto na câmera</li>
              <li>• Documento legível, sem reflexos</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="lg"
            onPress={() => setEtapa("captura")}
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            Começar verificação
          </Button>
          <Button variant="ghost" onPress={onCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (etapa === "captura") {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-center font-display text-2xl font-bold text-gradient-brand">
          Enviar fotos
        </h2>

        <FotoSecao
          titulo="Passo 1: Selfie"
          descricao="Foto do seu rosto usando a câmera frontal"
          Icone={Smile}
          preview={previewSelfie}
          onClick={() => inputSelfieRef.current?.click()}
        />
        <input
          ref={inputSelfieRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="user"
          className="hidden"
          onChange={(e) => lerArquivo(e, setSelfie, setPreviewSelfie)}
        />

        <FotoSecao
          titulo="Passo 2: Documento"
          descricao="RG, CNH ou outro documento com foto"
          Icone={IdCard}
          preview={previewDocumento}
          onClick={() => inputDocumentoRef.current?.click()}
        />
        <input
          ref={inputDocumentoRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => lerArquivo(e, setDocumento, setPreviewDocumento)}
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="primary"
            size="lg"
            onPress={handleEnviar}
            isDisabled={!selfie || !documento}
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            Enviar para análise
          </Button>
          <Button variant="ghost" onPress={onCancelar}>
            <ArrowLeft size={16} className="mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (etapa === "processando") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Spinner size="lg" color="accent" />
        <h2 className="font-display text-2xl font-bold text-gradient-brand">
          Analisando suas fotos...
        </h2>
        <p className="text-sm text-[color:var(--muted)]">
          Por favor, aguarde alguns segundos
        </p>
      </div>
    );
  }

  if (etapa === "resultado" && resultado) {
    const aprovado = resultado.verified && resultado.status === "APPROVED";
    if (aprovado) {
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)]">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </span>
          <h2 className="font-display text-2xl font-bold text-[color:var(--success)]">
            Verificação aprovada!
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            Sua identidade foi verificada com{" "}
            <strong>{resultado.confidence}%</strong> de confiança
          </p>
          <Card className="w-full border-l-4 border-l-[color:var(--success)] bg-[color:var(--success)]/5 text-left">
            <CardContent>
              <h3 className="mb-2 font-bold">Agora você pode:</h3>
              <ul className="flex flex-col gap-1 text-sm">
                <li>• Receber solicitações de shows</li>
                <li>• Aparecer nas buscas de clientes</li>
                <li>• Criar e gerenciar serviços</li>
                <li>• Ter o selo "Verificado" no perfil</li>
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-[color:var(--muted)]">
            Redirecionando em 3 segundos...
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--danger)]/15 text-[color:var(--danger)]">
          <XCircle size={36} strokeWidth={2.5} />
        </span>
        <h2 className="font-display text-2xl font-bold text-[color:var(--danger)]">
          Verificação não aprovada
        </h2>
        <p className="text-sm text-[color:var(--muted)]">
          Similaridade: {resultado.confidence}%
        </p>
        <Card className="w-full border-l-4 border-l-[color:var(--warning)] bg-[color:var(--warning)]/5 text-left">
          <CardContent>
            <h3 className="mb-2 font-bold">Possíveis motivos:</h3>
            <ul className="flex flex-col gap-1 text-sm">
              <li>• Iluminação muito diferente entre as fotos</li>
              <li>• Ângulos muito distintos</li>
              <li>• Foto do documento desfocada ou com reflexo</li>
              <li>• Acessórios cobrindo o rosto</li>
            </ul>
          </CardContent>
        </Card>
        <p className="text-sm">{resultado.message}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onPress={handleTentarNovamente}
            className="bg-gradient-brand font-semibold text-white"
          >
            Tentar novamente
          </Button>
          <Button variant="ghost" onPress={onCancelar}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function FotoSecao({
  titulo,
  descricao,
  Icone,
  preview,
  onClick,
}: {
  titulo: string;
  descricao: string;
  Icone: typeof Camera;
  preview: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-bold">{titulo}</h3>
      <p className="text-sm text-[color:var(--muted)]">{descricao}</p>
      {preview ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-secondary)] p-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-60 rounded-xl object-contain"
          />
          <Button variant="outline" size="sm" onPress={onClick}>
            Trocar foto
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)] p-8 transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/5"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--surface)] text-[color:var(--accent)]">
            <Icone size={28} />
          </span>
          <span className="text-sm font-semibold text-[color:var(--accent)]">
            Toque para tirar a foto
          </span>
        </button>
      )}
    </div>
  );
}
