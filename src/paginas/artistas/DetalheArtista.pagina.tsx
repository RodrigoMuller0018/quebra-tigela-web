import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obterArtistaPorId, atualizarArtista } from "../../api/artistas.api";
import type { Artista } from "../../tipos/artistas";
import { Cartao, CampoTexto, Botao, CaixaSelecao } from "../../componentes/ui";
import { erro as avisoErro, sucesso as avisoSucesso } from "../../utilitarios/avisos";

export default function DetalheArtistaPagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artista, setArtista] = useState<Artista | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setCarregando(true);
      try {
        const data = await obterArtistaPorId(id);
        setArtista(data);
      } catch (e: any) {
        avisoErro(e?.message ?? "Erro ao buscar artista");
      } finally {
        setCarregando(false);
      }
    })();
  }, [id]);

  async function handleSalvar() {
    if (!id || !artista) return;
    setSalvando(true);
    try {
      const atual = {
        name: artista.name,
        bio: artista.bio,
        city: artista.city,
        state: artista.state,
        verified: artista.verified,
        artTypes: artista.artTypes,
      };
      await atualizarArtista(id, atual);
      avisoSucesso("Atualizado");
      navigate("/artistas");
    } catch (e: any) {
      avisoErro(e?.message ?? "Erro ao atualizar");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (!artista) return <p>Artista não encontrado</p>;

  return (
    <div>
      <h1>Detalhe — {artista.name}</h1>
      <Cartao style={{ maxWidth: 520 }}>
        <div className="form-grid" style={{ display: "grid", gap: 12 }}>
          <CampoTexto label="Nome" value={artista.name} onChange={(e) => setArtista({ ...artista, name: e.target.value })} />
          <CampoTexto label="Cidade" value={artista.city} onChange={(e) => setArtista({ ...artista, city: e.target.value })} />
          <CampoTexto label="Estado" value={artista.state} onChange={(e) => setArtista({ ...artista, state: e.target.value })} />
          <CampoTexto label="Bio" value={artista.bio || ""} onChange={(e) => setArtista({ ...artista, bio: e.target.value })} />
          <CaixaSelecao
            texto="Verificado"
            checked={artista.verified}
            onChange={(e) => setArtista({ ...artista, verified: e.target.checked })}
          />
          <CampoTexto
            label="Tipos de arte (vírgula)"
            value={artista.artTypes.join(", ")}
            onChange={(e) =>
              setArtista({
                ...artista,
                artTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
          <div>
            <Botao onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Botao>
          </div>
        </div>
      </Cartao>
    </div>
  );
}
