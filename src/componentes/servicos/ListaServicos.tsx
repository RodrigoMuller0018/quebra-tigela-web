import type { Service } from "../../tipos/servicos";
import { Botao } from "../ui";
import "./ListaServicos.css";

interface ListaServicosProps {
  servicos: Service[];
  modo?: "artista" | "publico";
  onEditar?: (servico: Service) => void;
  onDeletar?: (id: string) => void;
  onAlternarStatus?: (id: string, active: boolean) => void;
}

export function ListaServicos({
  servicos,
  modo = "publico",
  onEditar,
  onDeletar,
  onAlternarStatus,
}: ListaServicosProps) {
  if (servicos.length === 0) {
    return (
      <div className="servicos-vazio">
        <p>Nenhum serviço cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="lista-servicos">
      {servicos.map((servico) => {
        return (
        <div key={servico._id} className="servico-card">
          {/* Mídia */}
          {servico.media && servico.media.length > 0 && (
            <div className="servico-media">
              {servico.media.map((item, index) => (
                <div key={index} className="media-item">
                  {item.type === "image" ? (
                    <img src={item.url} alt={servico.title} className="servico-imagem" />
                  ) : (
                    <video src={item.url} controls className="servico-video" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Conteúdo */}
          <div className="servico-conteudo">
            <h3 className="servico-titulo">{servico.title}</h3>

            {servico.description && (
              <p className="servico-descricao">{servico.description}</p>
            )}

            {/* Ações (apenas para artistas) */}
            {modo === "artista" && onEditar && (
              <div className="servico-acoes">
                <Botao
                  variante="secundaria"
                  onClick={() => onEditar(servico)}
                >
                  ✏️ Editar
                </Botao>
              </div>
            )}
          </div>
        </div>
      )})}
    </div>
  );
}
