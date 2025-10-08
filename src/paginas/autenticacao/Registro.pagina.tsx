import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cadastrarUsuario } from "../../api/usuarios.api";
import { cadastrarArtista } from "../../api/artistas.api";
import type { NovoUsuario } from "../../tipos/usuarios";
import type { NovoArtista } from "../../tipos/artistas";
import { sucesso as avisoSucesso, erro as avisoErro } from "../../utilitarios/avisos";
import { CampoTexto, ToggleUsuario } from "../../componentes/ui";
import { SeletorEstadoCidade } from "../../componentes/SeletorEstadoCidade";

interface FormularioCliente {
  name: string;
  email: string;
  password: string;
  city: string;
  state: string;
}

interface FormularioArtista {
  name: string;
  email: string;
  password: string;
  artTypes: string;
  bio: string;
  city: string;
  state: string;
}

export default function RegistroPagina() {
  const [ehArtista, setEhArtista] = useState(false); // true = Artista, false = Cliente
  const [salvando, setSalvando] = useState(false);
  const [verSenhaCliente, setVerSenhaCliente] = useState(false);
  const [verSenhaArtista, setVerSenhaArtista] = useState(false);
  const navigate = useNavigate();

  const [formCliente, setFormCliente] = useState<FormularioCliente>({
    name: "",
    email: "",
    password: "",
    city: "",
    state: ""
  });

  const [formArtista, setFormArtista] = useState<FormularioArtista>({
    name: "",
    email: "",
    password: "",
    artTypes: "",
    bio: "",
    city: "",
    state: ""
  });

  function validarFormulario(): string | null {
    const form = ehArtista ? formArtista : formCliente;

    if (!form.name.trim()) return "Nome é obrigatório";
    if (!form.email.trim()) return "E-mail é obrigatório";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "E-mail inválido";
    if (form.password.length < 6) return "Senha deve ter pelo menos 6 caracteres";

    if (ehArtista) {
      const artTypesArray = formArtista.artTypes.split(",").map(s => s.trim()).filter(Boolean);
      if (artTypesArray.length === 0) return "Tipos de arte são obrigatórios";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const erro = validarFormulario();
    if (erro) {
      avisoErro(erro);
      return;
    }

    setSalvando(true);
    try {
      if (ehArtista) {
        const artTypesArray = formArtista.artTypes.split(",").map(s => s.trim()).filter(Boolean);
        const dadosArtista: NovoArtista = {
          name: formArtista.name,
          email: formArtista.email,
          password: formArtista.password,
          artTypes: artTypesArray,
          bio: formArtista.bio || undefined,
          city: formArtista.city || undefined,
          state: formArtista.state || undefined
        };
        await cadastrarArtista(dadosArtista);
        avisoSucesso("Conta de artista criada com sucesso!");
      } else {
        const dadosCliente: NovoUsuario = {
          name: formCliente.name,
          email: formCliente.email,
          password: formCliente.password,
          city: formCliente.city || undefined,
          state: formCliente.state || undefined
        };
        await cadastrarUsuario(dadosCliente);
        avisoSucesso("Conta de cliente criada com sucesso!");
      }
      navigate("/login");
    } catch (err: any) {
      avisoErro(err?.message ?? "Erro ao criar conta");
    } finally {
      setSalvando(false);
    }
  }

  function setCampoCliente<K extends keyof FormularioCliente>(campo: K, valor: FormularioCliente[K]) {
    setFormCliente(prev => ({ ...prev, [campo]: valor }));
  }

  function setCampoArtista<K extends keyof FormularioArtista>(campo: K, valor: FormularioArtista[K]) {
    setFormArtista(prev => ({ ...prev, [campo]: valor }));
  }

  return (
    <div className="card form-card">
      <h1 className="title">Criar Conta</h1>
      <p className="subtitle">Preencha seus dados para se cadastrar</p>

      <ToggleUsuario
        ehArtista={ehArtista}
        onChange={setEhArtista}
        disabled={salvando}
      />

      <form onSubmit={handleSubmit}>
        {!ehArtista ? (
          <>
            <div className="field">
              <input
                id="nome-completo-cliente"
                name="nomeCompleto"
                className="field__input"
                type="text"
                placeholder=" "
                value={formCliente.name}
                onChange={(e) => setCampoCliente("name", e.target.value)}
                required
              />
              <label htmlFor="nome-completo-cliente" className="field__label">Nome completo *</label>
            </div>

            <div className="field">
              <input
                id="email-cliente"
                name="email"
                className="field__input"
                type="email"
                placeholder=" "
                value={formCliente.email}
                onChange={(e) => setCampoCliente("email", e.target.value)}
                required
              />
              <label htmlFor="email-cliente" className="field__label">E-mail *</label>
            </div>

            <CampoTexto
              id="senha-cliente"
              name="senha"
              label="Senha * (mín. 6 chars)"
              type={verSenhaCliente ? "text" : "password"}
              value={formCliente.password}
              onChange={(e) => setCampoCliente("password", e.target.value)}
              acaoTexto={verSenhaCliente ? "OCULTAR" : "EXIBIR"}
              onAcaoClick={() => setVerSenhaCliente(v => !v)}
              required
              minLength={6}
            />

            <SeletorEstadoCidade
              idPrefix="cliente"
              estadoSelecionado={formCliente.state}
              cidadeSelecionada={formCliente.city}
              onEstadoChange={(estado) => setCampoCliente("state", estado)}
              onCidadeChange={(cidade) => setCampoCliente("city", cidade)}
            />
          </>
        ) : (
          <>
            <div className="field">
              <input
                id="nome-completo-artista"
                name="nomeCompleto"
                className="field__input"
                type="text"
                placeholder=" "
                value={formArtista.name}
                onChange={(e) => setCampoArtista("name", e.target.value)}
                required
              />
              <label htmlFor="nome-completo-artista" className="field__label">Nome completo *</label>
            </div>

            <div className="field">
              <input
                id="email-artista"
                name="email"
                className="field__input"
                type="email"
                placeholder=" "
                value={formArtista.email}
                onChange={(e) => setCampoArtista("email", e.target.value)}
                required
              />
              <label htmlFor="email-artista" className="field__label">E-mail *</label>
            </div>

            <CampoTexto
              id="senha-artista"
              name="senha"
              label="Senha * (mín. 6 chars)"
              type={verSenhaArtista ? "text" : "password"}
              value={formArtista.password}
              onChange={(e) => setCampoArtista("password", e.target.value)}
              acaoTexto={verSenhaArtista ? "OCULTAR" : "EXIBIR"}
              onAcaoClick={() => setVerSenhaArtista(v => !v)}
              required
              minLength={6}
            />

            <div className="field">
              <input
                id="tipos-arte-artista"
                name="tiposArte"
                className="field__input"
                type="text"
                placeholder=" "
                value={formArtista.artTypes}
                onChange={(e) => setCampoArtista("artTypes", e.target.value)}
                required
              />
              <label htmlFor="tipos-arte-artista" className="field__label">Tipos de arte * (separados por vírgula)</label>
            </div>

            <div className="field">
              <input
                id="bio-artista"
                name="bio"
                className="field__input"
                type="text"
                placeholder=" "
                value={formArtista.bio}
                onChange={(e) => setCampoArtista("bio", e.target.value)}
              />
              <label htmlFor="bio-artista" className="field__label">Bio</label>
            </div>

            <SeletorEstadoCidade
              idPrefix="artista"
              estadoSelecionado={formArtista.state}
              cidadeSelecionada={formArtista.city}
              onEstadoChange={(estado) => setCampoArtista("state", estado)}
              onCidadeChange={(cidade) => setCampoArtista("city", cidade)}
            />
          </>
        )}

        <button
          className="btn btn-primary btn-big"
          type="submit"
          disabled={salvando}
        >
          {salvando ? "Criando conta..." : `Criar conta ${ehArtista ? "Artista" : "Cliente"}`}
        </button>
      </form>

      <div className="shortcuts">
        <Link to="/login" className="shortcut">
          Já tem conta? <strong>ENTRAR</strong>
        </Link>
      </div>
    </div>
  );
}