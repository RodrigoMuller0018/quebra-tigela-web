import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obterArtistaPorId, obterMeuPerfil, atualizarArtista } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, CampoTexto, Botao, CaixaSelecao } from "../../componentes/ui";
import { Container, Stack } from "../../componentes/layout";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";
import { obterIdDoToken, obterRoleDoToken } from "../../utilitarios/jwt";
import { PerfilPublicoArtista } from "../../componentes/artistas/PerfilPublicoArtista";

export default function DetalheArtistaPagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Verificar se o usuário logado é o próprio artista
  const usuarioLogadoId = obterIdDoToken();
  const userRole = obterRoleDoToken();
  // Verificar se é o próprio artista ANTES de carregar os dados
  const ehProprioArtista = usuarioLogadoId && id && usuarioLogadoId === id;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setCarregando(true);
      try {
        let data: Artista;

        // Se for o próprio artista, usar obterMeuPerfil (que usa /api/artists/${id} sem /profile)
        // Caso contrário, usar obterArtistaPorId (que usa /api/artists/${id}/profile para perfis públicos)
        if (ehProprioArtista) {
          console.log("DetalheArtista - Carregando MEU perfil usando obterMeuPerfil");
          data = await obterMeuPerfil();
        } else {
          console.log("DetalheArtista - Carregando perfil de OUTRO artista usando obterArtistaPorId");
          data = await obterArtistaPorId(id);
        }

        console.log("DetalheArtista - dados recebidos da API:", data);
        setArtista(data);
      } catch (e: any) {
        console.error("DetalheArtista - erro ao buscar:", e);
        avisoErro(e?.message ?? "Erro ao buscar artista");
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, ehProprioArtista]);

  // Callbacks para mudança de estado e cidade (evita recriação a cada render)
  const handleEstadoChange = useCallback((estado: string) => {
    setArtista(prev => prev ? { ...prev, state: estado } : null);
  }, []);

  const handleCidadeChange = useCallback((cidade: string) => {
    setArtista(prev => prev ? { ...prev, city: cidade } : null);
  }, []);

  async function handleSalvar() {
    if (!id || !artista) return;
    setSalvando(true);
    try {
      const dados = {
        name: artista.name,
        bio: artista.bio,
        city: artista.city,
        state: artista.state,
        artTypes: artista.artTypes,
      };
      await atualizarArtista(id, dados);
      avisoSucesso("Perfil atualizado com sucesso!");
      navigate("/artista");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar perfil");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (!artista) return <p>Artista não encontrado</p>;

  // Determinar para onde voltar baseado no tipo de usuário
  const voltarPara = userRole === "artist" ? "/artista" : "/artistas";
  const textoVoltar = userRole === "artist" ? "Voltar para Dashboard" : "Voltar para Artistas";

  // Se não for o próprio artista, mostrar perfil público (visualização readonly)
  if (!ehProprioArtista) {
    return (
      <Container>
        <div style={{ marginBottom: "1.5rem" }}>
          <Botao
            variante="fantasma"
            onClick={() => navigate(voltarPara)}
            className="btn-voltar"
          >
            <span style={{ fontSize: "1.1rem" }}>←</span>
            {textoVoltar}
          </Botao>
        </div>
        <PerfilPublicoArtista artista={artista} />
      </Container>
    );
  }

  // Se for o próprio artista, mostrar formulário editável
  return (
    <Container>
      <div style={{ marginBottom: "1.5rem" }}>
        <Botao
          variante="fantasma"
          onClick={() => navigate(voltarPara)}
          className="btn-voltar"
        >
          <span style={{ fontSize: "1.1rem" }}>←</span>
          {textoVoltar}
        </Botao>
      </div>

      <Cartao>
        <h2 className="perfil-header" style={{ textAlign: "center", fontSize: "1.5rem", fontWeight: "700" }}>
          Editar Meu Perfil
        </h2>

        <Stack spacing="medium">
          <CampoTexto
            id="nome-detalhe"
            name="nome"
            label="Nome Artístico"
            type="text"
            value={artista.name}
            onChange={(e) => setArtista({ ...artista, name: e.target.value })}
            required
          />

          <CampoTexto
            id="bio-detalhe"
            name="bio"
            label="Biografia"
            type="text"
            value={artista.bio || ""}
            onChange={(e) => setArtista({ ...artista, bio: e.target.value })}
            placeholder="Conte um pouco sobre você e seu trabalho..."
          />

          <CampoTexto
            id="tipos-arte-detalhe"
            name="tiposArte"
            label="Tipos de Arte (separados por vírgula)"
            type="text"
            value={artista.artTypes.join(", ")}
            onChange={(e) =>
              setArtista({
                ...artista,
                artTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
            placeholder="Ex: Pintura, Escultura, Fotografia"
            required
          />

          <SeletorEstadoCidade
            estadoSelecionado={artista.state || ""}
            cidadeSelecionada={artista.city || ""}
            onEstadoChange={handleEstadoChange}
            onCidadeChange={handleCidadeChange}
            idPrefix="artista-detalhe"
          />

          <CaixaSelecao
            id="verificado-detalhe"
            name="verificado"
            texto="Perfil Verificado"
            checked={artista.verified}
            disabled={true}
          />

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Botao variante="primaria" onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : "💾 Salvar Alterações"}
            </Botao>
            <Botao variante="fantasma" onClick={() => navigate(voltarPara)}>
              Cancelar
            </Botao>
          </div>
        </Stack>
      </Cartao>
    </Container>
  );
}
