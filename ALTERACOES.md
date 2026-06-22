# Alterações aplicadas no quebra-tigela-web

Este arquivo documenta a refatoração do frontend e quaisquer ajustes futuros. O formato segue o mesmo do `quebra-tigela-api/ALTERACOES.md`: **o que foi alterado**, **o motivo**, e **como reproduzir** quando relevante.

---

## Refatoração completa do frontend (HeroUI v3 + Tailwind CSS v4 + Vibe B)

Refatoração end-to-end do frontend a partir de uma stack baseada em Bootstrap 5 + componentes UI customizados para uma stack moderna baseada em **HeroUI v3 + Tailwind CSS v4 + Framer Motion**, com identidade visual "criativa/artística" (gradientes rosa→violeta, dark mode nativo, tipografia Inter/Outfit).

**Por que:** o frontend antigo tinha CSS espalhado em 11+ arquivos (~3000 linhas no total), dois conjuntos de componentes UI duplicados (`componentes/Botao.tsx` + `componentes/ui/Botao/`, `componentes/CampoTexto.tsx` + `componentes/ui/CampoTexto/`), e várias inconsistências visuais. A intenção era ter uma base mais simples de alterar, mais responsiva e visualmente alinhada à proposta de "plataforma de artistas".

**Como aplicar a partir de zero:** rode os passos abaixo após dar `git pull`, ou para entender o que mudou.

---

### 1. Pré-requisitos do ambiente

- **Node.js ≥ 20.19** (Vite 7 e HeroUI v3 exigem). Foi usado **Node 24 LTS** durante a refatoração.

### 2. Dependências instaladas / removidas

```bash
# Adicionadas
npm install @heroui/react@^3 framer-motion
npm install -D tailwindcss@^4 @tailwindcss/vite

# Removidas
npm uninstall bootstrap
```

**Por que:** HeroUI v3 é construído sobre Tailwind v4 (não v3) e usa Framer Motion para animações. Bootstrap deixou de ter qualquer função no projeto.

### 3. Configurações de build

#### `vite.config.ts`

Adicionado o plugin `@tailwindcss/vite`. Tailwind v4 não usa mais PostCSS — integra direto com Vite.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

#### `index.html`

- Removidos os `<link>` de Bootstrap CSS e Bootstrap Icons via CDN
- Removido o `<script>` do Bootstrap Bundle JS
- Adicionada classe `class="dark"` no `<html>` para ativar dark mode por padrão

#### `src/main.tsx`

- Removidos imports de todos os CSS antigos (`bootstrap-integration.css`, `tema.css`, `theme-dark-orange.css`, `forms-simple.css`, `buttons-dark.css`, `App.css`)
- Adicionado `<ToastProvider placement="top end" />` do HeroUI dentro do `<StrictMode>`

### 4. Tema (`src/index.css`)

Reescrito do zero. Importa o CSS do HeroUI (que traz Tailwind embutido) e sobrescreve as variáveis OKLCH com a paleta vibe B:

- **Light mode:** background quase-branco com tom levemente lilás, accent rosa vibrante `oklch(0.65 0.24 0)`, secondary violeta criativo, tertiary âmbar caloroso
- **Dark mode (padrão):** background escuro `oklch(0.12 0.015 285)` com tom violáceo, accent rosa ainda mais brilhante, foco em contraste e legibilidade
- **Gradientes utilitários:** `--gradient-brand` (rosa → violeta), `--gradient-warm` (âmbar → rosa), `--gradient-mesh` (radial duplo) — usados em CTAs, hero sections e perfis
- Fontes **Inter** (texto) e **Outfit** (display/títulos) carregadas do Google Fonts
- Classes utilitárias: `.text-gradient-brand`, `.bg-gradient-brand`, `.bg-gradient-warm`, `.bg-gradient-mesh`, `.font-display`

**Observação técnica do import do HeroUI styles:** o `package.json` do `@heroui/react` exporta `./styles.css` apenas com a condição `style`, que o Vite resolve em dev mas não no build. Por isso o import usa o caminho relativo direto:

```css
@import "../node_modules/@heroui/react/node_modules/@heroui/styles/dist/index.css";
```

Se em algum momento atualizar `@heroui/react` e o build quebrar, esse é o lugar a olhar.

### 5. Componentes wrapper criados

Como HeroUI v3 expõe primitivas `react-aria-components` que precisam de composição (TextField + Label + Input, Checkbox + Control + Indicator + Content, Modal + Backdrop + Container + Dialog + Header + Body), foram criados dois wrappers leves para reduzir verbosidade nas páginas:

- **[componentes/ui/Campo.tsx](src/componentes/ui/Campo.tsx)** — exporta `Campo` (input com label), `AreaTexto` (textarea com label) e `Caixa` (checkbox)
- **[componentes/ui/Dialogo.tsx](src/componentes/ui/Dialogo.tsx)** — exporta `Dialogo` (modal com backdrop, container, header e body já compostos)

Esses wrappers seguem o estilo da identidade (radius arredondado, foco accent, transições suaves).

### 6. Layout principal

[layout/Aplicacao.layout.tsx](src/layout/Aplicacao.layout.tsx) reescrito com:

- **Sidebar fixa no desktop** (≥ lg, 288 px) com avatar gradiente, links de navegação animados (item ativo vira gradiente brand) e botão de logout
- **Drawer lateral no mobile** (HeroUI `Drawer`) abre via topbar
- **Topbar mobile** com hambúrguer + brand + avatar
- **Layout de auth** (rotas `/login`, `/registro`, `/autenticacao/*`) com fundo `bg-gradient-mesh` em tela cheia, sem sidebar

### 7. Rotas e Context

- [rotas/RotaProtegida.tsx](src/rotas/RotaProtegida.tsx) limpo (sem logs de debug)
- [rotas/AppRotas.tsx](src/rotas/AppRotas.tsx) e [contexts/Autenticacao.context.tsx](src/contexts/Autenticacao.context.tsx) preservados (já estavam corretos)
- [utilitarios/avisos.ts](src/utilitarios/avisos.ts) refatorado para usar `toast.success` / `toast.danger` / `toast.info` do HeroUI ao invés de `alert()`

### 8. Páginas refatoradas

Todas as páginas e componentes foram reescritos preservando 100% da lógica de negócio (chamadas de API, hooks, contexts, validações), trocando apenas a camada de UI:

| Página/componente | Caminho |
|-------------------|---------|
| Login | [src/paginas/autenticacao/Login.pagina.tsx](src/paginas/autenticacao/Login.pagina.tsx) |
| Registro (Tabs Cliente/Artista) | [src/paginas/autenticacao/Registro.pagina.tsx](src/paginas/autenticacao/Registro.pagina.tsx) |
| Esqueci senha (3 etapas) | [src/paginas/autenticacao/EsqueciSenha.pagina.tsx](src/paginas/autenticacao/EsqueciSenha.pagina.tsx) |
| Home Cliente (hero, drawer de filtros, grid de cards) | [src/paginas/clientes/HomeCliente.pagina.tsx](src/paginas/clientes/HomeCliente.pagina.tsx) |
| Perfil Cliente | [src/paginas/clientes/PerfilCliente.pagina.tsx](src/paginas/clientes/PerfilCliente.pagina.tsx) |
| Home Artista (dashboard) | [src/paginas/artistas/HomeArtista.pagina.tsx](src/paginas/artistas/HomeArtista.pagina.tsx) |
| Detalhe Artista (edição/preview) | [src/paginas/artistas/DetalheArtista.pagina.tsx](src/paginas/artistas/DetalheArtista.pagina.tsx) |
| Lista Artistas (grid + paginação) | [src/paginas/artistas/ListaArtistas.pagina.tsx](src/paginas/artistas/ListaArtistas.pagina.tsx) |
| Agenda Artista | [src/paginas/artistas/AgendaArtista.pagina.tsx](src/paginas/artistas/AgendaArtista.pagina.tsx) |
| Serviços Artista | [src/paginas/artistas/ServicosArtista.pagina.tsx](src/paginas/artistas/ServicosArtista.pagina.tsx) |
| Página 404 | [src/paginas/Pagina404.tsx](src/paginas/Pagina404.tsx) |
| Popular Artistas (dev) | [src/paginas/dev/PopularArtistas.pagina.tsx](src/paginas/dev/PopularArtistas.pagina.tsx) |

### 9. Componentes auxiliares refatorados

| Componente | Caminho |
|------------|---------|
| Calendário da agenda | [src/componentes/agenda/CalendarioAgenda.tsx](src/componentes/agenda/CalendarioAgenda.tsx) |
| Lista de horários | [src/componentes/agenda/ListaHorarios.tsx](src/componentes/agenda/ListaHorarios.tsx) |
| Formulário de horário (lote/único) | [src/componentes/agenda/FormularioHorario.tsx](src/componentes/agenda/FormularioHorario.tsx) |
| Modal de dia da agenda | [src/componentes/agenda/ModalDiaAgenda.tsx](src/componentes/agenda/ModalDiaAgenda.tsx) |
| Agenda do cliente (visualizar + reservar) | [src/componentes/agenda/AgendaCliente.tsx](src/componentes/agenda/AgendaCliente.tsx) |
| Lista de serviços | [src/componentes/servicos/ListaServicos.tsx](src/componentes/servicos/ListaServicos.tsx) |
| Formulário de serviço | [src/componentes/servicos/FormularioServico.tsx](src/componentes/servicos/FormularioServico.tsx) |
| Perfil público do artista | [src/componentes/artistas/PerfilPublicoArtista.tsx](src/componentes/artistas/PerfilPublicoArtista.tsx) |
| Verificação de identidade (face comparison) | [src/componentes/verificacao/VerificacaoIdentidade.tsx](src/componentes/verificacao/VerificacaoIdentidade.tsx) |
| Seletor estado/cidade (selects nativos estilizados) | [src/componentes/SeletorEstadoCidade.tsx](src/componentes/SeletorEstadoCidade.tsx) |

### 10. Limpeza

Os seguintes arquivos/pastas foram **removidos** porque deixaram de ser usados após a refatoração:

**Componentes UI customizados antigos** (substituídos por HeroUI):
- `src/componentes/Botao.tsx` (loose)
- `src/componentes/CampoTexto.tsx` (loose)
- `src/componentes/ui/Botao/`
- `src/componentes/ui/Buttons/`
- `src/componentes/ui/CampoTexto/`
- `src/componentes/ui/Cartao/`
- `src/componentes/ui/CaixaSelecao/`
- `src/componentes/ui/FormInputs/`
- `src/componentes/ui/Icons/`
- `src/componentes/ui/Modal/`
- `src/componentes/ui/Seletor/`
- `src/componentes/ui/Switch/`
- `src/componentes/ui/Tabela/`
- `src/componentes/ui/ToggleUsuario/`
- `src/componentes/ui/index.ts`

**Layout primitives antigas** (substituídas por classes Tailwind `flex`/`grid`/`gap`):
- `src/componentes/layout/` (Stack, Cluster, Container, index.ts)

**CSS antigos** (substituídos por Tailwind + tema HeroUI):
- `src/App.css` (~1630 linhas)
- `src/estilos/bootstrap-custom.scss`
- `src/estilos/bootstrap-integration.css`
- `src/estilos/buttons-dark.css`
- `src/estilos/forms-dark.css`
- `src/estilos/forms-simple.css`
- `src/estilos/responsive.css`
- `src/estilos/tema.css`
- `src/estilos/theme-dark-orange.css`
- `src/estilos/utilities.css`
- `src/estilos/tokens.ts`
- `src/componentes/agenda/CalendarioAgenda.css`
- `src/componentes/agenda/ListaHorarios.css`
- `src/componentes/servicos/ListaServicos.css`
- `src/componentes/verificacao/VerificacaoIdentidade.css`

**Outros:**
- `src/paginas/autenticacao/Login.exemplo-bootstrap.tsx` (exemplo antigo)

### 11. O que foi preservado

Conforme o combinado, foram mantidos sem alteração estrutural:

- `src/api/` — camada HTTP (axios + interceptors JWT)
- `src/tipos/` — tipos TypeScript das entidades
- `src/contexts/Autenticacao.context.tsx` — context de auth
- `src/hooks/` — `useDebounce`, `useAgenda`
- `src/utilitarios/` — JWT, validação, dataUtils, dispositivo, googleCalendar, tagColors, cn (apenas `avisos.ts` foi refatorado pra usar toast do HeroUI)
- `src/rotas/` — `AppRotas`, `RotaProtegida`
- `src/scripts/popularArtistas.ts`
- `src/constantes/agenda.ts`

---

## Polimento pós-refatoração

Após a primeira rodada de refatoração foram aplicados estes ajustes a partir de feedback de uso:

### 12. Ícones Lucide substituem emojis decorativos

**O que mudou:** instalado [`lucide-react`](https://lucide.dev) e todos os emojis decorativos da UI (paleta 🎨, máscara 🎭, lápis ✏️, lupa 🔍, casa 🏠, pessoa 👤, calendário 📅, etc.) foram trocados por ícones SVG da Lucide. Emojis semânticos visuais que agregavam pouco (☰, ←, →, ✕, 🚪, 💾, 🕐, 🗑️) também viraram ícones Lucide (`Menu`, `ArrowLeft`, `ChevronRight`, `X`, `LogOut`, `Save`, `Clock`, `Trash2`, …).

**Por que:** a mistura de emojis com a paleta nova criava ruído visual e parecia inconsistente. Lucide é leve (cada ícone vira só o SVG usado no bundle, tree-shaken), mantém peso visual constante, herda a cor do CSS (`color`) e combina muito melhor com a vibe minimalista/criativa.

**Arquivos afetados:** layout principal, todas as páginas (Login, Registro, EsqueciSenha, HomeCliente, PerfilCliente, HomeArtista, DetalheArtista, ListaArtistas, AgendaArtista, ServicosArtista, Pagina404, PopularArtistas) e todos os componentes de feature (CalendarioAgenda, ListaHorarios, FormularioHorario, ModalDiaAgenda, AgendaCliente, ListaServicos, FormularioServico, PerfilPublicoArtista, VerificacaoIdentidade).

**Onde os emojis sobreviveram (intencionalmente):** apenas em `console.log` da camada de API (`api/*.ts`, `scripts/popularArtistas.ts`), que são logs de debug que não chegam à UI. Os logs do `Autenticacao.context.tsx` foram removidos por completo — eram ruído.

### 13. `CampoSenha` com toggle de visualizar

**Arquivo:** [src/componentes/ui/Campo.tsx](src/componentes/ui/Campo.tsx) — adicionado export `CampoSenha`.

**O que faz:** componente de input de senha com botão olho dentro do campo (`Eye` / `EyeOff` da Lucide) que alterna o `type` entre `"password"` e `"text"`. Mantém o estado de visibilidade interno; o consumidor não precisa controlar nada além do `value`/`onChange`.

**Por que:** padrão UX em qualquer formulário de senha hoje — usuário precisa conferir o que digitou pra evitar erro silencioso. Não tinha no projeto.

**Onde foi aplicado:** [Login.pagina.tsx](src/paginas/autenticacao/Login.pagina.tsx) (campo Senha), [Registro.pagina.tsx](src/paginas/autenticacao/Registro.pagina.tsx) (Senha + Confirmar senha pra cliente E artista), [EsqueciSenha.pagina.tsx](src/paginas/autenticacao/EsqueciSenha.pagina.tsx) (Nova senha + Confirmar nova senha).

### 14. Drawer de filtros do HomeCliente reescrito

**Arquivo:** [src/paginas/clientes/HomeCliente.pagina.tsx](src/paginas/clientes/HomeCliente.pagina.tsx).

**O que mudou:** o drawer de filtros estava usando o componente `Drawer` do HeroUI v3, que renderizava o conteúdo no fluxo da página em vez de portar pro `body`. Resultado: a sidebar ficava sobreposta visualmente ao drawer (z-index conflitante), e cliques no overlay não fechavam corretamente.

**Solução:** substituído pelo padrão "drawer custom" — um `<div>` fixed-position com z-index 50 + um `<div>` backdrop com z-index 40 e `onClick` que fecha. Mesma técnica usada no drawer mobile do layout. Garante que sempre renderize por cima de tudo, em qualquer viewport.

**Por que:** drawers do HeroUI v3 ainda têm bug de portal em algumas configurações; recriar com `position: fixed` é trivial em Tailwind, livra de qualquer problema de stacking context, e é mais fácil de customizar visualmente (header, body scrollável, footer fixo).

### 15. Logs de debug removidos do `Autenticacao.context.tsx`

**Arquivo:** [src/contexts/Autenticacao.context.tsx](src/contexts/Autenticacao.context.tsx).

**O que mudou:** removidos vários `console.log` com emojis (🔐 CONTEXT DEBUG, ✅ CONTEXT DEBUG, etc.) que rodavam no browser a cada login. Toda a lógica de auth foi mantida intacta.

### 17. `CampoSenha` reescrito sem o `<Input>` da HeroUI

**Arquivos:** [src/componentes/ui/Campo.tsx](src/componentes/ui/Campo.tsx), [src/index.css](src/index.css).

**Problema:** a primeira versão do `CampoSenha` posicionava o botão olho via `position: absolute` em cima do `<Input>` da HeroUI. Como o `Input` tem o próprio border/padding, o botão flutuava por fora da borda visual e, em layouts grid (Senha + Confirmar senha lado a lado), invadia o campo vizinho.

**Tentativa intermediária (não funcionou):** envolver o `<Input>` da HeroUI num `<div>` wrapper visual e tornar o input "transparente" via classes Tailwind (`border-0 bg-transparent focus:outline-none`). Falhou porque a classe `.input` da HeroUI aplica `@apply rounded-field border bg-field shadow-field outline-none ...` direto via PostCSS — o resultado vinha numa cascade layer mais alta que o utilitário, então a borda interna sempre reaparecia, gerando dupla borda + botão olho ainda do lado de fora. Confirmado lendo `node_modules/@heroui/react/node_modules/@heroui/styles/dist/components/input.css`.

**Solução (padrão usado por shadcn/ui, Mantine, Park UI):** abandonar `<TextField>` + `<Input>` da HeroUI nesse caso específico e renderizar um `<input>` HTML puro dentro de um wrapper:

- O `<div>` wrapper é o "input visual": tem o border, `bg`, `rounded`, `shadow-sm` e ganha focus ring via `focus-within:ring-2 focus-within:ring-[color:var(--accent)]/30`
- Dentro: `<input>` HTML nativo sem border próprio (`border-0 bg-transparent outline-none focus:ring-0`) com `flex-1`
- Botão olho ao lado, dentro do wrapper, alinhado por flex com `shrink-0`
- Botão recebe `tabIndex={-1}` pra não atrapalhar a navegação por Tab no formulário
- API mantida: o componente continua aceitando `label`, `value`, `onChange`, `isRequired`, etc. — os call sites em Login/Registro/EsqueciSenha não precisam mudar

**CSS extra em [index.css](src/index.css):** seletores `::-ms-reveal`, `::-ms-clear` (Edge/IE) e `::-webkit-credentials-auto-fill-button`, `::-webkit-strong-password-auto-fill-button` (Chrome/Safari) são forçados a `display: none` + `width/height: 0`. Sem isso, o navegador desenha um segundo olhinho ou um chaveirinho de autofill dentro do campo, competindo pelo mesmo espaço.

**Resultado:** o campo agora tem visual idêntico ao `Campo` normal, com um botão olho integrado à direita, sem sobreposição em qualquer layout (single column, grid, em zoom). Funciona em Chrome, Edge e Safari.

### 16. Filtros do HomeCliente: Estado/Cidade viraram selects (single-select dependente)

**Arquivo:** [src/paginas/clientes/HomeCliente.pagina.tsx](src/paginas/clientes/HomeCliente.pagina.tsx).

**O que mudou:** o drawer de filtros tinha **lista enorme de checkboxes** para os 27 estados + lista enorme de checkboxes para todas as cidades. Era ruim de escanear visualmente, principalmente porque na prática o usuário filtra por uma localização só.

Trocado para o padrão de mercado (Airbnb, Mercado Livre, OLX):
- **Estado:** `<select>` nativo single-choice estilizado com Tailwind, "Todos os estados" como opção default
- **Cidade:** `<select>` dependente — aparece desabilitado com texto "Selecione um estado primeiro" até o usuário escolher um estado, depois carrega as cidades do IBGE para aquele estado
- **Tipos de arte:** continuam multi-select, mas agora como **chips clicáveis** (pílulas que ficam com gradiente da brand quando ativas), em vez de checkboxes

**Por que:** select dropdown é o padrão universal pra escolher 1 valor de uma lista longa; o usuário não precisa rolar a lista inteira pra encontrar SC. E manter chips para tipos de arte preserva a opção de combinar múltiplos filtros (ex: "Pintura" + "Escultura"), que é o caso real onde multi faz sentido.

**Estado interno:** `estadosSelecionados: string[]` virou `estado: string`; `cidadesSelecionadas: string[]` virou `cidade: string`; `tiposSelecionados: string[]` mantido. Lógica de filtragem simplificada: estado/cidade vão direto pra API, tipos filtram client-side.

---

## Funcionalidades novas integradas ao backend (rodada A)

Implementadas as 5 features priorizadas como **opção A** do gap-analysis: tudo o que dava pra fazer só no frontend, sem precisar mexer no backend. Os endpoints já existiam — só faltava UI.

### 18. Sistema de Solicitações (Requests) completo

**Por que:** o backend tem 4 rotas em `/api/requests` (criar, listar por cliente, listar por artista, atualizar status) há tempos, mas nenhuma delas era consumida — ou seja, **o cliente não conseguia contratar um artista**, que é a função core do marketplace. Implementado o fluxo end-to-end.

**Novos arquivos:**
- [tipos/requests.ts](src/tipos/requests.ts) — tipos `Solicitacao`, `NovaSolicitacao`, `StatusSolicitacao` + maps `STATUS_LABELS` (pt-BR) e `STATUS_TONE` (classes Tailwind por status)
- [api/requests.api.ts](src/api/requests.api.ts) — `criarSolicitacao`, `listarSolicitacoesPorUsuario`, `listarSolicitacoesPorArtista`, `atualizarStatusSolicitacao`
- [componentes/requests/SolicitarServicoModal.tsx](src/componentes/requests/SolicitarServicoModal.tsx) — modal com select de serviço (carrega serviços ativos do artista), datepicker, local, detalhes
- [componentes/requests/CardSolicitacao.tsx](src/componentes/requests/CardSolicitacao.tsx) — card compartilhado pelas duas listagens, mostra status colorido + ações configuráveis + botão "Avaliar" condicional
- [paginas/clientes/SolicitacoesCliente.pagina.tsx](src/paginas/clientes/SolicitacoesCliente.pagina.tsx) — agrupa por status (Em andamento, Concluídas, Recusadas/canceladas), permite cancelar e avaliar
- [paginas/artistas/SolicitacoesArtista.pagina.tsx](src/paginas/artistas/SolicitacoesArtista.pagina.tsx) — destaca pedidos pendentes, permite aceitar/recusar/marcar como concluída, com modal de confirmação em cada ação destrutiva

**Fluxo:** cliente vê perfil de artista → botão "Solicitar serviço" → modal preenche dados → POST `/api/requests` (status `pending`) → artista vê em "Solicitações" → aceita/recusa via PATCH `/api/requests/:id/status` → quando completar, marca como `completed` → cliente recebe a opção de avaliar.

### 19. Sistema de Avaliações (Reviews)

**Por que:** o backend tem `POST /api/reviews` e `GET /api/reviews/artist/:id` implementados, e o endpoint `/api/artists/:id/profile` já calcula `rating.avg` e `rating.count`, mas o front ignorava tudo. Sem avaliações, marketplace de talentos perde confiança.

**Novos arquivos:**
- [tipos/reviews.ts](src/tipos/reviews.ts) — tipos `Review` e `NovaReview`
- [api/reviews.api.ts](src/api/reviews.api.ts) — `criarReview` e `listarReviewsPorArtista`
- [componentes/reviews/AvaliarModal.tsx](src/componentes/reviews/AvaliarModal.tsx) — 5 estrelas clicáveis (com hover preview e label "Péssimo/Ruim/Razoável/Bom/Excelente"), comentário opcional
- [componentes/reviews/ListaReviews.tsx](src/componentes/reviews/ListaReviews.tsx) — header com nota média + total, lista de cards com estrelas e comentário, suporta `limite` pra mostrar só X primeiras

**Onde aparece:**
- **PerfilPublicoArtista** ([componentes/artistas/PerfilPublicoArtista.tsx](src/componentes/artistas/PerfilPublicoArtista.tsx)): nova seção "Avaliações" com até 5 reviews
- **HomeArtista** ([paginas/artistas/HomeArtista.pagina.tsx](src/paginas/artistas/HomeArtista.pagina.tsx)): card "Minhas avaliações" no dashboard, com até 3 reviews recentes
- **SolicitacoesCliente**: botão "Avaliar" aparece automaticamente em solicitações com status `completed`

### 20. Edição real do perfil cliente + exclusão de conta

**Arquivos:** [paginas/clientes/PerfilCliente.pagina.tsx](src/paginas/clientes/PerfilCliente.pagina.tsx) reescrito; [api/usuarios.api.ts](src/api/usuarios.api.ts) ganhou `atualizarUsuario(id, dados)` e `excluirUsuario(id)`.

**O que mudou:**
- Antes salvava com um `setTimeout(400)` simulado e nunca persistia. Agora carrega dados reais via `GET /api/users/:id` ao montar e persiste via `PATCH /api/users/:id` no submit.
- Adicionada uma **Zona de perigo** (card com border vermelho) com botão "Excluir minha conta" → abre `ConfirmacaoModal` destrutivo → `DELETE /api/users/:id` → logout + redirect para login.

### 21. Exclusão de conta de artista

**Arquivo:** [paginas/artistas/DetalheArtista.pagina.tsx](src/paginas/artistas/DetalheArtista.pagina.tsx).

Mesma "Zona de perigo" aparece no modo edição do próprio artista, chamando `DELETE /api/artists/:id` (a função `excluirArtista` já existia em `api/artistas.api.ts`, só não tinha botão).

### 22. Próximos agendamentos no dashboard do artista

**Arquivo:** [paginas/artistas/HomeArtista.pagina.tsx](src/paginas/artistas/HomeArtista.pagina.tsx).

Card novo "Próximos agendamentos" usa `obterHorariosFuturos(artistId)` (rota `GET /api/schedule/artist/:id/future` que já existia mas não era consumida). Mostra até 5 próximos horários com data, hora e status (Reservado/Disponível).

Bônus: o card "Ações rápidas" agora tem badge no botão "Solicitações" mostrando quantos pedidos pendentes existem (`listarSolicitacoesPorArtista`).

### 23. Componente reutilizável `ConfirmacaoModal`

**Arquivo:** [componentes/ui/ConfirmacaoModal.tsx](src/componentes/ui/ConfirmacaoModal.tsx).

Modal genérico de confirmação com `variante="padrao"` ou `"destrutivo"`. No modo destrutivo, mostra ícone de alerta vermelho e o botão de confirmar fica vermelho. Usado em: cancelar solicitação (cliente), aceitar/recusar/concluir solicitação (artista), excluir conta (cliente e artista).

### 24. Novas rotas e itens no menu

**Arquivos:** [rotas/AppRotas.tsx](src/rotas/AppRotas.tsx), [layout/Aplicacao.layout.tsx](src/layout/Aplicacao.layout.tsx).

Adicionadas rotas `/cliente/solicitacoes` e `/artista/solicitacoes` (ambas protegidas). Cada perfil ganhou um item "Solicitações" / "Minhas Solicitações" no menu lateral, com ícone `Inbox` da Lucide.

---

## Registro de alterações futuras

Conforme forem surgindo novos ajustes durante uso real do frontend (bugs visuais, ajustes de responsividade, novos componentes), adicionar aqui seguindo o mesmo formato.
