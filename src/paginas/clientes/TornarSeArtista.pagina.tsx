import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@heroui/react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Campo, AreaTexto } from "../../componentes/ui/Campo";
import { CampoTelefone } from "../../componentes/ui/CampoTelefone";
import { CampoHandle } from "../../componentes/ui/CampoHandle";
import { SeletorTiposArte } from "../../componentes/ui/SeletorTiposArte";
import { ehTelefoneValidoBR } from "../../utilitarios/telefone";
import { tornarSeArtista } from "../../api/artistas.api";
import { useAutenticacao } from "../../contexts/Autenticacao.context";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";

export default function TornarSeArtistaPagina() {
  const nav = useNavigate();
  const { token, login, temPerfilArtista, usuario } = useAutenticacao();

  const [bio, setBio] = useState("");
  const [artTypes, setArtTypes] = useState<string[]>([]);
  const [telefone, setTelefone] = useState("");
  const [handle, setHandle] = useState("");
  const [handleDisponivel, setHandleDisponivel] = useState(false);
  const [artisticName, setArtisticName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Base pra sugerir handle: parte antes do @ do email do usuário logado
  const sugestaoBase = usuario?.email?.split("@")[0] ?? "";

  if (temPerfilArtista) {
    return (
      <Card className="mx-auto max-w-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardContent className="flex flex-col items-start gap-3 py-8 text-center">
          <Sparkles className="text-[color:var(--accent)]" size={32} />
          <h2 className="font-display text-xl font-bold">
            Você já é artista!
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            Use o toggle no header para alternar entre os modos Cliente e Artista.
          </p>
          <Button variant="primary" onPress={() => nav("/artista")}>
            Ir pro Dashboard de Artista
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (artTypes.length === 0) {
      avisoErro("Selecione pelo menos 1 tipo de arte");
      return;
    }
    if (!ehTelefoneValidoBR(telefone)) {
      avisoErro("Informe um celular válido (DDD + 9 + 8 dígitos)");
      return;
    }
    if (!handleDisponivel) {
      avisoErro("Escolha um handle válido e disponível");
      return;
    }
    setSalvando(true);
    try {
      await tornarSeArtista({
        bio: bio || undefined,
        tiposArte: artTypes,
        telefone,
        handle,
        nomeArtistico: artisticName || undefined,
        dataNascimento: birthDate || undefined,
        portfolio: portfolio || undefined,
      });
      avisoSucesso("Perfil de artista criado! Faça login novamente pra ativar.");
      // Força relogin pra atualizar o JWT com hasArtistProfile/artistId
      if (token) {
        login(token);
      }
      nav("/artista");
    } catch (err: any) {
      avisoErro(err?.response?.data?.message ?? err?.message ?? "Erro ao criar perfil");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Button
        variant="ghost"
        onPress={() => nav(-1)}
        className="self-start"
      >
        <ArrowLeft size={16} className="mr-1" /> Voltar
      </Button>

      <Card className="border border-[color:var(--border)] bg-[color:var(--surface)]">
        <CardHeader className="flex flex-col items-start gap-2 pb-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
            <Sparkles size={24} />
          </span>
          <h1 className="font-display text-2xl font-bold text-gradient-brand">
            Virar artista
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Crie seu perfil artístico. Você continua sendo cliente — vai poder
            alternar entre os dois modos a qualquer momento.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SeletorTiposArte
              value={artTypes}
              onChange={setArtTypes}
              label="Tipos de arte"
              isRequired
            />

            <CampoHandle
              value={handle}
              onChange={setHandle}
              baseSugestao={sugestaoBase}
              onDisponibilidadeChange={setHandleDisponivel}
              isRequired
            />

            <CampoTelefone
              value={telefone}
              onChange={setTelefone}
              isRequired
            />

            <Campo
              label="Nome artístico (opcional)"
              value={artisticName}
              onChange={setArtisticName}
              placeholder="Como você quer ser conhecido nos palcos"
            />

            <AreaTexto
              label="Bio"
              value={bio}
              onChange={setBio}
              placeholder="Conte um pouco sobre você, sua arte, sua trajetória..."
              rows={5}
            />

            <Campo
              label="Data de nascimento"
              type="date"
              value={birthDate}
              onChange={setBirthDate}
            />

            <Campo
              label="Portfólio (URL)"
              type="url"
              value={portfolio}
              onChange={setPortfolio}
              placeholder="https://meusite.com ou https://behance.net/seu-nome"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isDisabled={salvando}
              fullWidth
              className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
            >
              {salvando ? "Criando perfil..." : "Criar perfil de artista"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
