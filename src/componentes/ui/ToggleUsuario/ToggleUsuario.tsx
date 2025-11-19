import { Switch } from "../Switch/Switch";

interface ToggleUsuarioProps {
  ehArtista: boolean;
  onChange: (ehArtista: boolean) => void;
  disabled?: boolean;
}

export function ToggleUsuario({ ehArtista, onChange, disabled = false }: ToggleUsuarioProps) {
  return (
    <Switch
      checked={ehArtista}
      onChange={onChange}
      leftLabel="Cliente"
      rightLabel="Artista"
      disabled={disabled}
    />
  );
}