import { useState, useRef } from "react";
import { verificarIdentidadeArtista } from "../../api/verificacao.api";
import type { ResultadoVerificacao } from "../../tipos/verificacao";
import { Botao, Cartao } from "../ui";
import { Stack } from "../layout";
import { erro as avisoErro } from "../../utilitarios/avisos";
import "./VerificacaoIdentidade.css";

interface VerificacaoIdentidadeProps {
  artistId: string;
  onSucesso: () => void;
  onCancelar: () => void;
}

type Etapa = 'instrucoes' | 'captura' | 'processando' | 'resultado';

export function VerificacaoIdentidade({
  artistId,
  onSucesso,
  onCancelar,
}: VerificacaoIdentidadeProps) {
  const [etapa, setEtapa] = useState<Etapa>('instrucoes');
  const [selfie, setSelfie] = useState<File | null>(null);
  const [documento, setDocumento] = useState<File | null>(null);
  const [previewSelfie, setPreviewSelfie] = useState<string>("");
  const [previewDocumento, setPreviewDocumento] = useState<string>("");
  const [resultado, setResultado] = useState<ResultadoVerificacao | null>(null);

  const inputSelfieRef = useRef<HTMLInputElement>(null);
  const inputDocumentoRef = useRef<HTMLInputElement>(null);

  function handleSelecionarSelfie(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    // Validar tamanho (10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      avisoErro("Foto muito grande. Máximo 10MB");
      return;
    }

    // Validar formato
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      avisoErro("Formato inválido. Use JPG, PNG ou WEBP");
      return;
    }

    setSelfie(arquivo);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewSelfie(reader.result as string);
    };
    reader.readAsDataURL(arquivo);
  }

  function handleSelecionarDocumento(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    // Validar tamanho (10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      avisoErro("Foto muito grande. Máximo 10MB");
      return;
    }

    // Validar formato
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      avisoErro("Formato inválido. Use JPG, PNG ou WEBP");
      return;
    }

    setDocumento(arquivo);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewDocumento(reader.result as string);
    };
    reader.readAsDataURL(arquivo);
  }

  async function handleEnviarVerificacao() {
    if (!selfie || !documento) {
      avisoErro("Por favor, envie as duas fotos");
      return;
    }

    setEtapa('processando');

    try {
      const res = await verificarIdentidadeArtista(selfie, documento, artistId);
      setResultado(res);
      setEtapa('resultado');

      // Se foi aprovado, chamar callback de sucesso
      if (res.verified && res.status === 'APPROVED') {
        setTimeout(() => {
          onSucesso();
        }, 3000); // Aguardar 3s para mostrar mensagem de sucesso
      }
    } catch (err: any) {
      console.error("Erro na verificação:", err);
      setEtapa('captura');
      avisoErro(err?.message ?? "Erro ao verificar identidade. Tente novamente.");
    }
  }

  function handleTentarNovamente() {
    setSelfie(null);
    setDocumento(null);
    setPreviewSelfie("");
    setPreviewDocumento("");
    setResultado(null);
    setEtapa('captura');
  }

  // Renderizar instruções
  if (etapa === 'instrucoes') {
    return (
      <Cartao>
        <div className="verificacao-container">
          <h2 className="verificacao-titulo">📸 Verificação de Identidade</h2>
          <p className="verificacao-subtitulo">
            Para receber solicitações de shows, precisamos verificar sua identidade
          </p>

          <div className="verificacao-instrucoes">
            <h3>📋 Como Funciona:</h3>
            <ol>
              <li>
                <strong>Tire uma selfie</strong> - Use a câmera frontal do celular
              </li>
              <li>
                <strong>Foto do documento</strong> - RG, CNH ou outro documento com foto
              </li>
              <li>
                <strong>Aguarde análise</strong> - Verificaremos se as fotos conferem
              </li>
            </ol>

            <div className="verificacao-dicas">
              <h4>💡 Dicas para uma boa foto:</h4>
              <ul>
                <li>Use um local bem iluminado</li>
                <li>Retire óculos, bonés e acessórios</li>
                <li>Centralize o rosto na câmera</li>
                <li>Documento deve estar legível e sem reflexos</li>
                <li>Evite fotos tremidas ou desfocadas</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Botao
              variante="primaria"
              grande
              onClick={() => setEtapa('captura')}
            >
              Começar Verificação
            </Botao>
            <Botao
              variante="fantasma"
              onClick={onCancelar}
            >
              Cancelar
            </Botao>
          </div>
        </div>
      </Cartao>
    );
  }

  // Renderizar captura de fotos
  if (etapa === 'captura') {
    return (
      <Cartao>
        <div className="verificacao-container">
          <h2 className="verificacao-titulo">📸 Enviar Fotos</h2>

          <Stack spacing="large">
            {/* Selfie */}
            <div className="foto-secao">
              <h3>📷 Passo 1: Selfie</h3>
              <p className="foto-descricao">Tire uma foto do seu rosto usando a câmera frontal</p>

              {previewSelfie ? (
                <div className="foto-preview">
                  <img src={previewSelfie} alt="Preview selfie" />
                  <Botao
                    variante="secundaria"
                    onClick={() => inputSelfieRef.current?.click()}
                  >
                    Tirar Nova Selfie
                  </Botao>
                </div>
              ) : (
                <div className="foto-placeholder">
                  <div className="foto-icone">🤳</div>
                  <Botao
                    variante="primaria"
                    onClick={() => inputSelfieRef.current?.click()}
                  >
                    📸 Tirar Selfie
                  </Botao>
                </div>
              )}

              <input
                ref={inputSelfieRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="user"
                style={{ display: 'none' }}
                onChange={handleSelecionarSelfie}
              />
            </div>

            {/* Documento */}
            <div className="foto-secao">
              <h3>📄 Passo 2: Documento</h3>
              <p className="foto-descricao">Tire uma foto do seu RG, CNH ou outro documento com foto</p>

              {previewDocumento ? (
                <div className="foto-preview">
                  <img src={previewDocumento} alt="Preview documento" />
                  <Botao
                    variante="secundaria"
                    onClick={() => inputDocumentoRef.current?.click()}
                  >
                    Tirar Nova Foto
                  </Botao>
                </div>
              ) : (
                <div className="foto-placeholder">
                  <div className="foto-icone">🪪</div>
                  <Botao
                    variante="primaria"
                    onClick={() => inputDocumentoRef.current?.click()}
                  >
                    📸 Foto do Documento
                  </Botao>
                </div>
              )}

              <input
                ref={inputDocumentoRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleSelecionarDocumento}
              />
            </div>

            {/* Botões de ação */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Botao
                variante="primaria"
                grande
                onClick={handleEnviarVerificacao}
                disabled={!selfie || !documento}
              >
                Enviar para Análise
              </Botao>
              <Botao
                variante="fantasma"
                onClick={onCancelar}
              >
                Cancelar
              </Botao>
            </div>
          </Stack>
        </div>
      </Cartao>
    );
  }

  // Renderizar processando
  if (etapa === 'processando') {
    return (
      <Cartao>
        <div className="verificacao-container verificacao-processando">
          <div className="loading-spinner"></div>
          <h2 className="verificacao-titulo">⏳ Analisando suas fotos...</h2>
          <p className="verificacao-subtitulo">
            Por favor, aguarde alguns segundos
          </p>
        </div>
      </Cartao>
    );
  }

  // Renderizar resultado
  if (etapa === 'resultado' && resultado) {
    const aprovado = resultado.verified && resultado.status === 'APPROVED';

    return (
      <Cartao>
        <div className="verificacao-container">
          {aprovado ? (
            <>
              <div className="verificacao-sucesso">
                <div className="verificacao-icone-grande">🎉</div>
                <h2 className="verificacao-titulo">✅ Verificação Aprovada!</h2>
                <p className="verificacao-subtitulo">
                  Sua identidade foi verificada com <strong>{resultado.confidence}%</strong> de confiança
                </p>

                <div className="verificacao-beneficios">
                  <h3>Agora você pode:</h3>
                  <ul>
                    <li>✓ Receber solicitações de shows</li>
                    <li>✓ Aparecer nas buscas de clientes</li>
                    <li>✓ Criar e gerenciar serviços</li>
                    <li>✓ Ter o selo "Verificado" no perfil</li>
                  </ul>
                </div>

                <p className="verificacao-info">
                  Redirecionando em 3 segundos...
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="verificacao-falha">
                <div className="verificacao-icone-grande">❌</div>
                <h2 className="verificacao-titulo">Verificação Não Aprovada</h2>
                <p className="verificacao-subtitulo">
                  Similaridade: {resultado.confidence}%
                </p>

                <div className="verificacao-motivos">
                  <h3>Possíveis motivos:</h3>
                  <ul>
                    <li>Fotos com iluminação muito diferente</li>
                    <li>Ângulos muito distintos</li>
                    <li>Foto do documento desfocada ou com reflexo</li>
                    <li>Acessórios cobrindo o rosto</li>
                  </ul>
                </div>

                <p className="verificacao-mensagem">{resultado.message}</p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <Botao
                    variante="primaria"
                    grande
                    onClick={handleTentarNovamente}
                  >
                    Tentar Novamente
                  </Botao>
                  <Botao
                    variante="fantasma"
                    onClick={onCancelar}
                  >
                    Voltar
                  </Botao>
                </div>
              </div>
            </>
          )}
        </div>
      </Cartao>
    );
  }

  return null;
}
