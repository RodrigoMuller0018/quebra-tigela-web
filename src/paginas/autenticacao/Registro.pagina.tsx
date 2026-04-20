import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  TabList,
  Tab,
} from "@heroui/react";
import { cadastrarUsuario } from "../../api/usuarios.api";
import { cadastrarArtista } from "../../api/artistas.api";
import type { NovoUsuario } from "../../tipos/usuarios";
import type { NovoArtista } from "../../tipos/artistas";
import {
  sucesso as avisoSucesso,
  erro as avisoErro,
} from "../../utilitarios/avisos";
import { Sparkles } from "lucide-react";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";
import { Campo, CampoSenha, AreaTexto } from "../../componentes/ui/Campo";

type TipoConta = "cliente" | "artista";

interface FormularioCliente {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
}

interface FormularioArtista extends FormularioCliente {
  artTypes: string;
  bio: string;
}

const INICIAL_CLIENTE: FormularioCliente = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  city: "",
  state: "",
};

const INICIAL_ARTISTA: FormularioArtista = {
  ...INICIAL_CLIENTE,
  artTypes: "",
  bio: "",
};

export default function RegistroPagina() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoConta>("cliente");
  const [salvando, setSalvando] = useState(false);
  const [formCliente, setFormCliente] =
    useState<FormularioCliente>(INICIAL_CLIENTE);
  const [formArtista, setFormArtista] =
    useState<FormularioArtista>(INICIAL_ARTISTA);

  const ehArtista = tipo === "artista";

  function validar(): string | null {
    const form = ehArtista ? formArtista : formCliente;
    if (!form.name.trim()) return "Nome é obrigatório";
    if (!form.email.trim()) return "E-mail é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "E-mail inválido";
    if (form.password.length < 6) return "Senha deve ter pelo menos 6 caracteres";
    if (form.password !== form.confirmPassword) return "As senhas não conferem";
    if (ehArtista) {
      const tipos = formArtista.artTypes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (tipos.length === 0) return "Tipos de arte são obrigatórios";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validar();
    if (err) {
      avisoErro(err);
      return;
    }
    setSalvando(true);
    try {
      if (ehArtista) {
        const artTypesArray = formArtista.artTypes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const dados: NovoArtista = {
          name: formArtista.name,
          email: formArtista.email,
          password: formArtista.password,
          artTypes: artTypesArray,
          bio: formArtista.bio || undefined,
          city: formArtista.city || undefined,
          state: formArtista.state || undefined,
        };
        await cadastrarArtista(dados);
        avisoSucesso("Conta de artista criada com sucesso!");
      } else {
        const dados: NovoUsuario = {
          name: formCliente.name,
          email: formCliente.email,
          password: formCliente.password,
          city: formCliente.city || undefined,
          state: formCliente.state || undefined,
        };
        await cadastrarUsuario(dados);
        avisoSucesso("Conta de cliente criada com sucesso!");
      }
      navigate("/login");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao criar conta");
    } finally {
      setSalvando(false);
    }
  }

  function setCampoCliente<K extends keyof FormularioCliente>(
    campo: K,
    valor: FormularioCliente[K]
  ) {
    setFormCliente((p) => ({ ...p, [campo]: valor }));
  }

  function setCampoArtista<K extends keyof FormularioArtista>(
    campo: K,
    valor: FormularioArtista[K]
  ) {
    setFormArtista((p) => ({ ...p, [campo]: valor }));
  }

  return (
    <Card className="w-full max-w-xl border border-[color:var(--border)] bg-[color:var(--surface)]/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
          <Sparkles size={24} />
        </span>
        <h1 className="font-display text-3xl font-bold text-gradient-brand">
          Criar conta
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Escolha o tipo de conta e preencha seus dados
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        <Tabs
          selectedKey={tipo}
          onSelectionChange={(k) => setTipo(k as TipoConta)}
          className="w-full"
          aria-label="Tipo de conta"
        >
          <TabList className="grid grid-cols-2 gap-2">
            <Tab id="cliente">Cliente</Tab>
            <Tab id="artista">Artista</Tab>
          </TabList>
        </Tabs>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!ehArtista ? (
            <>
              <Campo
                label="Nome completo"
                value={formCliente.name}
                onChange={(v) => setCampoCliente("name", v)}
                isRequired
              />
              <Campo
                label="E-mail"
                type="email"
                value={formCliente.email}
                onChange={(v) => setCampoCliente("email", v)}
                isRequired
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoSenha
                  label="Senha"
                  value={formCliente.password}
                  onChange={(v) => setCampoCliente("password", v)}
                  isRequired
                  autoComplete="new-password"
                  description="Mínimo 6 caracteres"
                />
                <CampoSenha
                  label="Confirmar senha"
                  value={formCliente.confirmPassword}
                  onChange={(v) => setCampoCliente("confirmPassword", v)}
                  isRequired
                  autoComplete="new-password"
                />
              </div>
              <SeletorEstadoCidade
                idPrefix="cliente"
                estadoSelecionado={formCliente.state}
                cidadeSelecionada={formCliente.city}
                onEstadoChange={(uf) => setCampoCliente("state", uf)}
                onCidadeChange={(c) => setCampoCliente("city", c)}
              />
            </>
          ) : (
            <>
              <Campo
                label="Nome completo"
                value={formArtista.name}
                onChange={(v) => setCampoArtista("name", v)}
                isRequired
              />
              <Campo
                label="E-mail"
                type="email"
                value={formArtista.email}
                onChange={(v) => setCampoArtista("email", v)}
                isRequired
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoSenha
                  label="Senha"
                  value={formArtista.password}
                  onChange={(v) => setCampoArtista("password", v)}
                  isRequired
                  autoComplete="new-password"
                  description="Mínimo 6 caracteres"
                />
                <CampoSenha
                  label="Confirmar senha"
                  value={formArtista.confirmPassword}
                  onChange={(v) => setCampoArtista("confirmPassword", v)}
                  isRequired
                  autoComplete="new-password"
                />
              </div>
              <Campo
                label="Tipos de arte"
                value={formArtista.artTypes}
                onChange={(v) => setCampoArtista("artTypes", v)}
                isRequired
                description="Separe por vírgulas. Ex: Pintura, Escultura, Fotografia"
              />
              <AreaTexto
                label="Bio"
                value={formArtista.bio}
                onChange={(v) => setCampoArtista("bio", v)}
                description="Conte um pouco sobre seu trabalho"
                rows={3}
              />
              <SeletorEstadoCidade
                idPrefix="artista"
                estadoSelecionado={formArtista.state}
                cidadeSelecionada={formArtista.city}
                onEstadoChange={(uf) => setCampoArtista("state", uf)}
                onCidadeChange={(c) => setCampoArtista("city", c)}
              />
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isDisabled={salvando}
            fullWidth
            className="bg-gradient-brand font-semibold text-white shadow-lg shadow-[color:var(--accent)]/30"
          >
            {salvando
              ? "Criando conta..."
              : `Criar conta ${ehArtista ? "Artista" : "Cliente"}`}
          </Button>
        </form>

        <div className="mt-2 text-center text-sm text-[color:var(--muted)]">
          Já tem conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-[color:var(--accent)] hover:underline"
          >
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
