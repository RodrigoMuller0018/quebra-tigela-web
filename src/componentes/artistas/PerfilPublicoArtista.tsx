import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Artista } from "../../tipos/artistas";
import type { Service } from "../../tipos/servicos";
import { Cartao, Botao } from "../ui";
import { Stack } from "../layout";
import { AgendaCliente } from "../agenda";
import { ListaServicos } from "../servicos";
import { listarServicosPorArtista } from "../../api/servicos.api";

interface Props {
  artista: Artista;
}

export function PerfilPublicoArtista({ artista }: Props) {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Service[]>([]);
  const [carregandoServicos, setCarregandoServicos] = useState(false);

  // Debug detalhado - verificar TODA a estrutura de dados
  console.log("=== DEBUG PERFIL PÚBLICO ===");
  console.log("1. Props recebidas:", artista);
  console.log("2. Tipo de dados:", typeof artista);
  console.log("3. É array?", Array.isArray(artista));
  console.log("4. Keys disponíveis:", artista ? Object.keys(artista) : "null");
  
  // Se artista vier dentro de um objeto aninhado (ex: { artist: {...} })
  console.log("5. Possível nested artist:", (artista as any)?.artist);
  console.log("6. Nome direto:", artista?.name);
  console.log("7. Email direto:", artista?.email);
  console.log("8. Art types direto:", artista?.artTypes);

  // Verificação de dados
  if (!artista) {
    return (
      <Stack spacing="large">
        <Botao variante="fantasma" onClick={() => navigate(-1)}>
          ← Voltar
        </Botao>
        <Cartao>
          <p>Carregando perfil...</p>
        </Cartao>
      </Stack>
    );
  }

  // Tentar acessar dados em diferentes estruturas possíveis
  const dadosArtista = (artista as any)?.artist || artista;
  
  console.log("9. Dados finais a serem usados:", dadosArtista);
  console.log("10. Nome final:", dadosArtista?.name);
  console.log("11. Email final:", dadosArtista?.email);
  console.log("12. Art Types final:", dadosArtista?.artTypes);

  // Extrair dados com fallbacks
  const nome = dadosArtista?.name || dadosArtista?.nome || "Nome não informado";
  const email = dadosArtista?.email || "Email não disponível";
  const bio = dadosArtista?.bio || dadosArtista?.biografia || null;
  const verificado = dadosArtista?.verified || dadosArtista?.verificado || false;
  const cidade = dadosArtista?.city || dadosArtista?.cidade || null;
  const estado = dadosArtista?.state || dadosArtista?.estado || null;
  const tiposArte = dadosArtista?.artTypes || dadosArtista?.tipos_arte || dadosArtista?.specialties || [];

  console.log("13. Valores extraídos:", { nome, email, bio, verificado, cidade, estado, tiposArte });

  // Carregar serviços do artista
  useEffect(() => {
    const artistaId = dadosArtista?.id || dadosArtista?._id;
    if (!artistaId) return;

    setCarregandoServicos(true);
    listarServicosPorArtista(artistaId)
      .then((dados) => {
        // Filtrar apenas serviços ativos para exibição pública
        const servicosAtivos = dados.filter((s) => s.active);
        setServicos(servicosAtivos);
      })
      .catch((err) => {
        console.error("Erro ao carregar serviços:", err);
        setServicos([]);
      })
      .finally(() => {
        setCarregandoServicos(false);
      });
  }, [dadosArtista?.id, dadosArtista?._id]);

  // Formatar localização
  const localizacao = cidade && estado
    ? `${cidade}, ${estado}`
    : cidade || estado || "Localização não informada";

  return (
    <Stack spacing="large">
      {/* Botão Voltar */}
      <Botao variante="fantasma" onClick={() => navigate(-1)}>
        ← Voltar
      </Botao>

      <Cartao>
        <Stack spacing="large">
          {/* Cabeçalho do Perfil */}
          <div>
            <Stack spacing="small">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                  {nome}
                </h1>
                {verificado && (
                  <span style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    ✓ Verificado
                  </span>
                )}
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: '500', margin: '8px 0 0 0' }}>
                📍 {localizacao}
              </p>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500', margin: '4px 0 0 0' }}>
                ✉️ {email}
              </p>
            </Stack>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

          {/* Biografia */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
              Sobre
            </h3>
            {bio ? (
              <p style={{ lineHeight: '1.7', color: 'var(--text)', fontSize: '1rem', fontWeight: '400' }}>
                {bio}
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: '400' }}>
                Este artista ainda não adicionou uma biografia.
              </p>
            )}
          </div>

          {/* Especialidades */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
              Especialidades
            </h3>
            {tiposArte && tiposArte.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tiposArte.map((tipo: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--text-on-primary)',
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}
                  >
                    {tipo}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: '400' }}>
                Nenhuma especialidade cadastrada ainda.
              </p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

          {/* Serviços Oferecidos */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
              Serviços Oferecidos
            </h3>
            {carregandoServicos ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: '400' }}>
                Carregando serviços...
              </p>
            ) : servicos.length > 0 ? (
              <ListaServicos servicos={servicos} modo="publico" />
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontWeight: '400' }}>
                Este artista ainda não cadastrou serviços.
              </p>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

          {/* Agenda - Horários Disponíveis */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
              Agendar Horário
            </h3>
            <AgendaCliente
              artistaId={dadosArtista?.id || dadosArtista?._id}
              artistaNome={nome}
              artistaEmail={email}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

          {/* Call to Action */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text)' }}>
              Interessado no trabalho?
            </h3>
            <p style={{ lineHeight: '1.7', color: 'var(--text)', fontSize: '1rem', fontWeight: '400', marginBottom: '16px' }}>
              Entre em contato com {nome?.split(' ')?.[0] || nome} para solicitar serviços e
              conhecer mais sobre seu portfólio.
            </p>
            <Botao variante="primaria" disabled grande>
              Solicitar Serviço (em breve)
            </Botao>
          </div>
        </Stack>
      </Cartao>


    </Stack>
  );
}