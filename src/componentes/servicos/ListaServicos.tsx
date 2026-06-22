import { Button, Card, CardContent } from "@heroui/react";
import { Pencil } from "lucide-react";
import type { Servico } from "../../tipos/servicos";

interface ListaServicosProps {
  servicos: Servico[];
  modo?: "artista" | "publico";
  onEditar?: (servico: Servico) => void;
  onDeletar?: (id: string) => void;
  onAlternarStatus?: (id: string, ativo: boolean) => void;
}

export function ListaServicos({
  servicos,
  modo = "publico",
  onEditar,
}: ListaServicosProps) {
  if (servicos.length === 0) {
    return (
      <Card className="border-dashed border-[color:var(--border)] bg-[color:var(--surface-secondary)]">
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm text-[color:var(--muted)]">
            Nenhum serviço cadastrado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {servicos.map((servico) => (
        <Card
          key={servico._id}
          className="overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          {servico.midia && servico.midia.length > 0 && (
            <div className="relative h-44 overflow-hidden bg-[color:var(--surface-secondary)]">
              {servico.midia[0].tipo === "imagem" ? (
                <img
                  src={servico.midia[0].url}
                  alt={servico.titulo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={servico.midia[0].url}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-bold leading-tight">
                {servico.titulo}
              </h3>
              {modo === "artista" && (
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                    (servico.ativo
                      ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                      : "bg-[color:var(--muted)]/15 text-[color:var(--muted)]")
                  }
                >
                  {servico.ativo ? "Ativo" : "Inativo"}
                </span>
              )}
            </div>
            {servico.descricao && (
              <p className="line-clamp-3 text-sm text-[color:var(--muted)]">
                {servico.descricao}
              </p>
            )}
            {modo === "artista" && onEditar && (
              <Button
                variant="outline"
                size="sm"
                onPress={() => onEditar(servico)}
                className="mt-2"
              >
                <Pencil size={14} className="mr-1" />
                Editar
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
