import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Avatar, AvatarFallback, Spinner } from "@heroui/react";
import {
  Home,
  Users,
  User,
  LayoutDashboard,
  UserCog,
  Calendar,
  Briefcase,
  Search,
  LogOut,
  Menu,
  X,
  Palette,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { useAutenticacao } from "../contexts/Autenticacao.context";

type ItemNav = {
  rota: string;
  Icone: LucideIcon;
  titulo: string;
  ativo: (pathname: string) => boolean;
};

const ROTAS_AUTH = new Set([
  "/",
  "/login",
  "/registro",
  "/autenticacao/esqueci-senha",
  "/autenticacao/redefinir-senha",
]);

export default function AplicacaoLayout() {
  const { token, usuario, userType, logout } = useAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [drawerAberto, setDrawerAberto] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCarregandoInicial(false), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setDrawerAberto(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const estaEmAuth = ROTAS_AUTH.has(location.pathname);
  const userId = usuario?.sub;
  const mostrarShell = Boolean(token && usuario && !estaEmAuth);

  const itensCliente: ItemNav[] = [
    { rota: "/cliente", Icone: Home, titulo: "Início", ativo: (p) => p === "/cliente" },
    { rota: "/artistas", Icone: Users, titulo: "Artistas", ativo: (p) => p.startsWith("/artistas") },
    { rota: "/cliente/solicitacoes", Icone: Inbox, titulo: "Minhas Solicitações", ativo: (p) => p === "/cliente/solicitacoes" },
    { rota: "/cliente/perfil", Icone: User, titulo: "Meu Perfil", ativo: (p) => p === "/cliente/perfil" },
  ];

  const itensArtista: ItemNav[] = [
    { rota: "/artista", Icone: LayoutDashboard, titulo: "Dashboard", ativo: (p) => p === "/artista" },
    ...(userId
      ? [{
          rota: `/artistas/${userId}`,
          Icone: UserCog,
          titulo: "Editar Perfil",
          ativo: (p: string) => p === `/artistas/${userId}`,
        }]
      : []),
    { rota: "/artista/agenda", Icone: Calendar, titulo: "Minha Agenda", ativo: (p) => p === "/artista/agenda" },
    { rota: "/artista/servicos", Icone: Briefcase, titulo: "Meus Serviços", ativo: (p) => p === "/artista/servicos" },
    { rota: "/artista/solicitacoes", Icone: Inbox, titulo: "Solicitações", ativo: (p) => p === "/artista/solicitacoes" },
    { rota: "/artistas", Icone: Search, titulo: "Explorar Artistas", ativo: (p) => p === "/artistas" },
  ];

  const itens = userType === "client" ? itensCliente : userType === "artist" ? itensArtista : [];

  if (carregandoInicial) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  if (!mostrarShell) {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-gradient-mesh">
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-70" />
        <main className="relative z-10 flex min-h-dvh items-center justify-center p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    );
  }

  const iniciais = (usuario?.email?.[0] || "?").toUpperCase();
  const nome = usuario?.email?.split("@")[0] ?? "Usuário";
  const labelTipo = userType === "client" ? "Cliente" : "Artista";

  const menuConteudo = (
    <>
      <div className="flex items-center gap-3 px-6 py-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30">
          <Palette size={20} />
        </span>
        <div className="font-display text-xl font-bold text-gradient-brand">
          Quebra Tigela
        </div>
      </div>

      <div className="mx-3 flex items-center gap-3 rounded-2xl bg-[color:var(--surface-secondary)] p-3">
        <Avatar className="h-11 w-11 shrink-0 bg-gradient-brand text-sm font-bold text-white">
          <AvatarFallback>{iniciais}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[color:var(--foreground)]">
            {nome}
          </div>
          <div className="text-xs text-[color:var(--muted)]">{labelTipo}</div>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
        {itens.map((item) => {
          const ativo = item.ativo(location.pathname);
          const Icone = item.Icone;
          return (
            <Link
              key={item.rota}
              to={item.rota}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                ativo
                  ? "bg-gradient-brand text-white shadow-lg shadow-[color:var(--accent)]/30"
                  : "text-[color:var(--foreground)] hover:bg-[color:var(--surface-secondary)]"
              }`}
            >
              <Icone size={18} />
              <span>{item.titulo}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Button
          variant="danger-soft"
          onPress={handleLogout}
          fullWidth
          className="justify-start"
        >
          <LogOut size={18} className="mr-2" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="relative min-h-dvh">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] lg:flex">
        {menuConteudo}
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 px-4 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant="ghost"
            onPress={() => setDrawerAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Palette size={14} />
            </span>
            <span className="font-display font-bold text-gradient-brand">
              Quebra Tigela
            </span>
          </div>
        </div>
        <Avatar className="h-9 w-9 bg-gradient-brand text-xs font-bold text-white">
          <AvatarFallback>{iniciais}</AvatarFallback>
        </Avatar>
      </header>

      {/* Drawer mobile (custom, fixed-position) */}
      {drawerAberto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerAberto(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] shadow-2xl lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerAberto(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 rounded-lg p-2 text-[color:var(--muted)] transition hover:bg-[color:var(--surface-secondary)] hover:text-[color:var(--foreground)]"
            >
              <X size={20} />
            </button>
            {menuConteudo}
          </aside>
        </>
      )}

      {/* Conteúdo */}
      <main className="min-h-dvh lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
