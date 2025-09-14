import { useEffect, useState } from "react";
import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import "./App.css";

/* ==== Tipos ==== */
type LoginResponse =
  | { access_token: string }
  | { token: string }
  | { jwt: string }
  | { data?: { access_token?: string } }
  | Record<string, unknown>;

type RegisterUserBody = {
  name: string;
  email: string;
  password: string;
  city?: string;
  state?: string;
};

type RegisterArtistBody = {
  name: string;
  email: string;
  password: string;
  city: string;
  state: string;
  bio?: string;
  artTypes?: string[];
};

type Role = "client" | "artist";
type Mode = "login" | "register";

/* IBGE */
type UF = { id: number; sigla: string; nome: string };
type City = { id: number; nome: string };

/* ==== Config ==== */
const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH ?? "/api/auth/login";
const REGISTER_USER_PATH =
  import.meta.env.VITE_REGISTER_USER_PATH ?? "/api/auth/register/user";
const REGISTER_ARTIST_PATH =
  import.meta.env.VITE_REGISTER_ARTIST_PATH ?? "/api/auth/register/artist";

/* ==== Componentes de Campo (label flutuante) ==== */
type FieldInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "placeholder"
> & {
  id: string;
  label: string;
  rightSlot?: ReactNode;
  wrapClass?: string; // text-left | text-center | text-right
};

function FieldInput({ id, label, rightSlot, wrapClass, ...rest }: FieldInputProps) {
  const hasRight = Boolean(rightSlot);
  return (
    <div className={`field ${wrapClass ?? ""}`}>
      <input id={id} className={`field__input ${hasRight ? "pr" : ""}`} placeholder=" " {...rest} />
      <label className="field__label" htmlFor={id}>{label}</label>
      {rightSlot}
    </div>
  );
}

type FieldSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  id: string;
  label: string;
  filled?: boolean;
  children: ReactNode;
  wrapClass?: string;
};

function FieldSelect({ id, label, filled, children, wrapClass, ...rest }: FieldSelectProps) {
  return (
    <div className={`field field--select ${wrapClass ?? ""}`} data-filled={filled ? "true" : "false"}>
      <select id={id} className="field__input" {...rest}>{children}</select>
      <label className="field__label" htmlFor={id}>{label}</label>
    </div>
  );
}

/* ==== App ==== */
export default function App() {
  const [mode, setMode] = useState<Mode>("login");

  // papel (só usado no CADASTRO)
  const [role, setRole] = useState<Role>("client");

  // login
  const [email, setEmail] = useState(localStorage.getItem("last_email") ?? "");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // cadastro
  const [reg, setReg] = useState<RegisterUserBody & Partial<RegisterArtistBody>>({
    name: "",
    email: "",
    password: "",
    city: "",
    state: "",
    bio: "",
    artTypes: [],
  });
  const [regConfirm, setRegConfirm] = useState("");
  const [regShowPwd, setRegShowPwd] = useState(false);
  const [regShowPwd2, setRegShowPwd2] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // IBGE
  const [ufs, setUfs] = useState<UF[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [ufsLoading, setUfsLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [geoErr, setGeoErr] = useState<string | null>(null);

  useEffect(() => {
    if (remember) localStorage.setItem("last_email", email);
  }, [email, remember]);

  // Carrega UFs
  useEffect(() => {
    (async () => {
      setUfsLoading(true);
      setGeoErr(null);
      try {
        const r = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        const data: UF[] = await r.json();
        setUfs(data);
      } catch {
        setGeoErr("Falha ao carregar estados. Tente novamente.");
      } finally {
        setUfsLoading(false);
      }
    })();
  }, []);

  // Carrega cidades ao escolher UF
  useEffect(() => {
    if (!reg.state) { setCities([]); return; }
    const ufObj = ufs.find((u) => u.sigla === reg.state);
    if (!ufObj) return;

    (async () => {
      setCitiesLoading(true);
      setGeoErr(null);
      try {
        const r = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufObj.id}/municipios?orderBy=nome`
        );
        const data: City[] = await r.json();
        setCities(data);
      } catch {
        setGeoErr("Falha ao carregar cidades. Tente novamente.");
      } finally {
        setCitiesLoading(false);
      }
    })();
  }, [reg.state, ufs]);

  function switchToRegister() {
    setMode("register");
    setError(null);
    setSuccess(null);
  }
  function switchToLogin() {
    setMode("login");
    setRegError(null);
    setRegSuccess(null);
  }

  /* ==== Login ==== */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      // Login agora NÃO envia tipo de conta
      const res = await fetch(`${API}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let body: LoginResponse | any = {};
      try { body = await res.json(); } catch {}

      if (!res.ok) {
        const msg = (body as any)?.message || `Falha no login (HTTP ${res.status})`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const token =
        (body as any).access_token ??
        (body as any).token ??
        (body as any).jwt ??
        (body as any).data?.access_token;

      if (!token) throw new Error("Resposta sem token.");

      localStorage.setItem("token", String(token));
      if (remember) localStorage.setItem("last_email", email);
      setSuccess("Login realizado.");
      setPassword("");
    } catch (err: any) {
      setError(err?.message ?? "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  /* ==== Cadastro ==== */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError(null); setRegSuccess(null);

    if (reg.password !== regConfirm) {
      setRegError("As senhas não conferem.");
      return;
    }

    setRegLoading(true);
    try {
      const path = role === "artist" ? REGISTER_ARTIST_PATH : REGISTER_USER_PATH;
      const body =
        role === "artist"
          ? ({
              name: reg.name,
              email: reg.email,
              password: reg.password,
              city: reg.city,
              state: reg.state,
              bio: reg.bio || undefined,
              artTypes: reg.artTypes || undefined,
            } as RegisterArtistBody)
          : ({
              name: reg.name,
              email: reg.email,
              password: reg.password,
              city: reg.city || undefined,
              state: reg.state || undefined,
            } as RegisterUserBody);

      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data as any)?.message || `Falha no cadastro (HTTP ${res.status})`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      setRegSuccess("Conta criada! Você já pode entrar.");
      setEmail(reg.email);
      setMode("login");
    } catch (err: any) {
      setRegError(err?.message ?? "Erro inesperado");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div className="brand">Quebra-Tigela</div>
      </header>

      <main className="main">
        <div className="card form-card">
          {mode === "login" ? (
            <form onSubmit={handleLogin} aria-busy={loading}>
              <h1 className="title">Entrar</h1>
              <p className="subtitle">Acesse sua conta para continuar</p>

              {error && <div className="alert"><strong>Erro:</strong> {error}</div>}
              {success && <div className="alert ok">{success}</div>}

              <FieldInput
                id="login-email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                wrapClass="text-left"
              />

              <FieldInput
                id="login-password"
                label="Senha"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                wrapClass="text-left"
                rightSlot={
                  <button
                    type="button"
                    className="field__action"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPwd ? "OCULTAR" : "EXIBIR"}
                  </button>
                }
              />

              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Lembrar e-mail neste dispositivo</span>
              </label>

              <button className="btn btn-primary btn-big" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
              </button>

              <div className="shortcuts">
                <button
                  type="button"
                  className="shortcut"
                  onClick={() => alert("Recuperação de senha: em breve")}
                >
                  ESQUECEU A SENHA?
                </button>
                <span className="shortcut-sep" aria-hidden="true">|</span>
                <button type="button" className="shortcut" onClick={switchToRegister}>
                  CRIAR CONTA
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} aria-busy={regLoading}>
              <h1 className="title">Criar conta</h1>
              <p className="subtitle">
                Você pode começar como cliente e, se preferir, já se cadastrar como artista.
              </p>

              {/* Toggle Cliente | Artista — AGORA SÓ NO CADASTRO */}
              <div className="seg" role="tablist" aria-label="Tipo de cadastro">
                <button
                  type="button"
                  role="tab"
                  aria-selected={role === "client"}
                  className={`seg-item ${role === "client" ? "active" : ""}`}
                  onClick={() => setRole("client")}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={role === "artist"}
                  className={`seg-item ${role === "artist" ? "active" : ""}`}
                  onClick={() => setRole("artist")}
                >
                  Artista
                </button>
              </div>

              {regError && <div className="alert"><strong>Erro:</strong> {regError}</div>}
              {regSuccess && <div className="alert ok">{regSuccess}</div>}

              <FieldInput
                id="reg-name"
                label="Nome"
                value={reg.name}
                onChange={(e) => setReg((r) => ({ ...r, name: e.target.value }))}
                required
                wrapClass="text-left"
              />

              <FieldInput
                id="reg-email"
                label="E-mail"
                type="email"
                value={reg.email}
                onChange={(e) => setReg((r) => ({ ...r, email: e.target.value }))}
                required
                autoComplete="email"
                wrapClass="text-left"
              />

              <FieldInput
                id="reg-password"
                label="Senha"
                type={regShowPwd ? "text" : "password"}
                value={reg.password}
                onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))}
                required
                autoComplete="new-password"
                wrapClass="text-left"
                rightSlot={
                  <button
                    type="button"
                    className="field__action"
                    onClick={() => setRegShowPwd((v) => !v)}
                  >
                    {regShowPwd ? "OCULTAR" : "EXIBIR"}
                  </button>
                }
              />

              <FieldInput
                id="reg-password2"
                label="Confirmar senha"
                type={regShowPwd2 ? "text" : "password"}
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                required
                autoComplete="new-password"
                wrapClass="text-left"
                rightSlot={
                  <button
                    type="button"
                    className="field__action"
                    onClick={() => setRegShowPwd2((v) => !v)}
                  >
                    {regShowPwd2 ? "OCULTAR" : "EXIBIR"}
                  </button>
                }
              />

              {role === "artist" && (
                <>
                  {geoErr && <div className="alert"><strong>Erro:</strong> {geoErr}</div>}

                  <div className="grid-2">
                    <FieldSelect
                      id="reg-uf"
                      label="Estado (UF)"
                      value={reg.state}
                      onChange={(e) => setReg((r) => ({ ...r, state: e.target.value, city: "" }))}
                      filled={!!reg.state}
                      required
                      wrapClass="text-left"
                    >
                      <option value="">{ufsLoading ? "Carregando estados..." : " "}</option>
                      {ufs.map((u) => (
                        <option key={u.id} value={u.sigla}>
                          {u.nome} ({u.sigla})
                        </option>
                      ))}
                    </FieldSelect>

                    <FieldSelect
                      id="reg-city"
                      label="Cidade"
                      value={reg.city}
                      onChange={(e) => setReg((r) => ({ ...r, city: e.target.value }))}
                      disabled={!reg.state || citiesLoading || cities.length === 0}
                      filled={!!reg.city}
                      required
                      wrapClass="text-left"
                    >
                      <option value="">
                        {!reg.state ? " " : citiesLoading ? "Carregando…" : " "}
                      </option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.nome}>
                          {c.nome}
                        </option>
                      ))}
                    </FieldSelect>
                  </div>
                </>
              )}

              <button className="btn btn-primary btn-big" type="submit" disabled={regLoading}>
                {regLoading ? "Criando conta…" : "Criar conta"}
              </button>

              <div className="shortcuts">
                <span className="shortcut-muted">Já tem conta?</span>
                <span className="shortcut-sep" aria-hidden="true">|</span>
                <button type="button" className="shortcut" onClick={switchToLogin}>
                  ENTRAR
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}