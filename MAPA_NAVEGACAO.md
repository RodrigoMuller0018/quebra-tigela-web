# 🗺️ Mapa Completo de Navegação - Quebra Tigela

## 📊 Visão Geral

**Total de Rotas Configuradas:** 9 rotas
**Total de Navegações no Código:** 29 navegações
**Páginas com Navegação:** 8 páginas

---

## 🌐 Rotas Configuradas (AppRotas.tsx)

### Rotas Públicas (Sem Autenticação)
```
/                              → LoginPagina
/login                         → LoginPagina
/registro                      → RegistroPagina
/autenticacao/esqueci-senha    → EsqueciSenha
/autenticacao/redefinir-senha  → RedefinirSenha
/dev/popular-artistas          → PopularArtistasDevPagina (DEV ONLY)
```

### Rotas Protegidas (Requerem Autenticação)
```
/cliente                       → HomeClientePagina
/artista                       → HomeArtistaPagina
/artistas                      → HomeClientePagina (mesmo que /cliente)
/artistas/:id                  → DetalheArtista
```

---

## 🔀 Fluxo de Navegação por Página

### 1️⃣ **Login** (`/login`)

**Pode ir para:**
- ✅ `/cliente` - Após login bem-sucedido (userType === "client")
- ✅ `/artista` - Após login bem-sucedido (userType === "artist")
- ✅ `/autenticacao/esqueci-senha` - Link "ESQUECEU A SENHA?"
- ✅ `/registro` - Link "CRIAR CONTA"

**Pode vir de:**
- `/` (rota raiz)
- `/registro` (após criar conta)
- `/autenticacao/esqueci-senha` (após redefinir senha)
- `Aplicacao.layout` (após logout)

**Código:**
```tsx
// Linhas 44, 47, 50
if (userType === "client") nav("/cliente");
else if (userType === "artist") nav("/artista");
else nav("/cliente"); // fallback

// Linha 111
<Link to="/autenticacao/esqueci-senha">ESQUECEU A SENHA?</Link>

// Linha 113
<Link to="/registro">CRIAR CONTA</Link>
```

---

### 2️⃣ **Registro** (`/registro`)

**Pode ir para:**
- ✅ `/login` - Link "Já tem conta? ENTRAR"
- ✅ `/login` - Após cadastro bem-sucedido (navigate)

**Pode vir de:**
- `/login` (link "CRIAR CONTA")

**Código:**
```tsx
// Linha 105
navigate("/login"); // Após sucesso

// Linha 274
<Link to="/login">Já tem conta? <strong>ENTRAR</strong></Link>
```

---

### 3️⃣ **Esqueci Senha** (`/autenticacao/esqueci-senha`)

**Pode ir para:**
- ✅ `/login` - Link "Já lembrou? ENTRAR"
- ✅ `/login` - Após redefinir senha (2s delay)

**Pode vir de:**
- `/login` (link "ESQUECEU A SENHA?")

**Código:**
```tsx
// Linha 51
setTimeout(() => navigate("/login"), 2000);

// Linha 94
<Link to="/login">Já lembrou? <strong>ENTRAR</strong></Link>
```

---

### 4️⃣ **Home Cliente** (`/cliente` ou `/artistas`)

**Pode ir para:**
- ✅ `/artistas/:id` - Ver perfil de qualquer artista (cards)

**Pode vir de:**
- `/login` (após login como cliente)
- `/artista` (link "Ver Outros Artistas")

**Código:**
```tsx
// Linha 319 (HomeCliente.pagina.tsx)
<Link to={`/artistas/${artista.id}`}>Ver Perfil</Link>
```

**⚠️ OBSERVAÇÃO:** `/artistas` e `/cliente` apontam para a mesma página

---

### 5️⃣ **Home Artista** (`/artista`)

**Pode ir para:**
- ✅ `/artistas/:id` - Editar meu perfil (quando tem perfil)
- ✅ `/artistas/:id` - Ver como perfil público
- ✅ `/artistas/${usuario.sub}` - Completar perfil (quando incompleto)
- ✅ `/artistas/${usuario.sub}` - Ação rápida: Editar Meu Perfil
- ✅ `/cliente` - Ver Outros Artistas

**Pode vir de:**
- `/login` (após login como artista)
- `/artistas/:id` (após salvar perfil)

**Código:**
```tsx
// Linha 105
onClick={() => navigate(`/artistas/${artista.id}`)} // Editar Perfil

// Linha 111
<Link to={`/artistas/${artista.id}`}>👁️ Ver Como Perfil Público</Link>

// Linha 129
onClick={() => navigate(`/artistas/${usuario?.sub}`)} // Completar Perfil

// Linha 188
onClick={() => navigate(`/artistas/${usuario?.sub}`)} // Ação Rápida

// Linha 202
<Link to="/cliente">🎨 Ver Outros Artistas</Link>
```

---

### 6️⃣ **Detalhe Artista** (`/artistas/:id`)

**Pode ir para:**
- ✅ `/artista` - Após salvar perfil com sucesso
- ✅ `-1` (voltar) - Botão "← Voltar"

**Pode vir de:**
- `/cliente` (Ver perfil de artista)
- `/artista` (Editar meu perfil, Ver como público, Completar perfil)
- `/artistas` (Ver perfil de artista)

**Código:**
```tsx
// Linha 52
navigate("/artista"); // Após salvar

// Linha 75
<Botao onClick={() => navigate(-1)}>← Voltar</Botao>
```

---

### 7️⃣ **Layout Principal** (`Aplicacao.layout`)

**Pode ir para:**
- ✅ `/login` - Ao fazer logout

**Código:**
```tsx
// Linha 10
navigate("/login"); // Logout
```

---

## 🚨 ROTAS FALTANDO / PROBLEMAS IDENTIFICADOS

### ❌ 1. Redefinir Senha (`/autenticacao/redefinir-senha`)
- **Status:** Rota existe mas NÃO tem navegação para ela
- **Problema:** Página não é acessível de nenhum lugar
- **Solução Sugerida:**
  - Adicionar link no email de recuperação de senha
  - Ou remover rota se não for usada

---

### ❌ 2. Popular Artistas Dev (`/dev/popular-artistas`)
- **Status:** Rota existe mas é apenas para DEV
- **Problema:** Não tem navegação (esperado)
- **Solução:** OK para produção (remover rota em build)

---

### ⚠️ 3. Duplicação: `/cliente` e `/artistas`
- **Status:** Duas rotas para mesma página
- **Problema:** Pode causar confusão
- **Sugestão:**
  - Manter apenas `/artistas` para listar artistas
  - Criar `/cliente/dashboard` para home do cliente
  - Ou fazer redirect de uma para outra

---

### ⚠️ 4. Página Inicial (`/`)
- **Status:** Vai direto para `/login`
- **Problema:** Sem landing page ou página inicial
- **Sugestão:**
  - Criar landing page com apresentação do serviço
  - Ou redirecionar baseado em autenticação:
    - Se logado: `/cliente` ou `/artista`
    - Se não logado: `/login`

---

### ⚠️ 5. Sem Página 404
- **Status:** Não configurada
- **Problema:** URLs inválidas não têm feedback
- **Sugestão:** Adicionar rota catch-all:
  ```tsx
  { path: "*", element: <Pagina404 /> }
  ```

---

### ⚠️ 6. Sem Navegação Superior/Menu
- **Status:** Sem navbar/menu fixo
- **Problema:** Usuário não consegue navegar facilmente entre seções
- **Sugestão:** Adicionar no `Aplicacao.layout`:
  - Menu para Cliente: Home | Artistas | Perfil | Sair
  - Menu para Artista: Dashboard | Ver Artistas | Meu Perfil | Sair

---

### ⚠️ 7. Falta Rota de Perfil do Próprio Usuário Cliente
- **Status:** Cliente não tem página de perfil próprio
- **Problema:** Cliente não pode editar seus dados
- **Sugestão:** Criar:
  - `/cliente/perfil` - Para editar dados do cliente
  - `/cliente/favoritos` - Artistas favoritos (futuro)
  - `/cliente/solicitacoes` - Histórico de contatos (futuro)

---

## 📋 CHECKLIST DE NAVEGAÇÕES FALTANDO

### Prioridade Alta 🔴
- [ ] Link de navegação para `/autenticacao/redefinir-senha` (ou remover rota)
- [ ] Página 404 para rotas inválidas
- [ ] Menu de navegação no layout principal
- [ ] Perfil do cliente (`/cliente/perfil`)

### Prioridade Média 🟡
- [ ] Landing page na rota `/`
- [ ] Resolver duplicação `/cliente` vs `/artistas`
- [ ] Breadcrumbs para navegação contextual
- [ ] Botão "Voltar ao topo" em páginas longas

### Prioridade Baixa 🟢
- [ ] Favoritos (`/cliente/favoritos`)
- [ ] Histórico de contatos (`/cliente/solicitacoes`)
- [ ] Notificações (`/notificacoes`)
- [ ] Configurações (`/configuracoes`)

---

## 🎯 FLUXOS COMPLETOS

### Fluxo 1: Novo Usuário (Cliente)
```
1. / → /login (primeira visita)
2. /login → /registro (criar conta)
3. /registro → /login (após cadastro)
4. /login → /cliente (login como cliente)
5. /cliente → /artistas/:id (ver perfil artista)
6. /artistas/:id → -1 (voltar)
```

### Fluxo 2: Novo Usuário (Artista)
```
1. / → /login (primeira visita)
2. /login → /registro (criar conta como artista)
3. /registro → /login (após cadastro)
4. /login → /artista (login como artista)
5. /artista → /artistas/:id (completar perfil)
6. /artistas/:id → /artista (após salvar)
```

### Fluxo 3: Esqueceu Senha
```
1. /login → /autenticacao/esqueci-senha
2. /autenticacao/esqueci-senha → /login (após redefinir)
```

### Fluxo 4: Artista Explorando
```
1. /artista → /cliente (ver outros artistas)
2. /cliente → /artistas/:id (ver perfil)
3. /artistas/:id → -1 (voltar)
4. /cliente → (voltar para dashboard)
```

---

## 📐 Diagrama ASCII

```
┌─────────┐
│    /    │ (raiz)
└────┬────┘
     │
     v
┌──────────┐     ┌────────────┐     ┌──────────────────────┐
│  /login  │────→│  /registro │────→│  /login (após criar) │
└─────┬────┘     └────────────┘     └──────────────────────┘
      │
      ├──→ /autenticacao/esqueci-senha ──→ /login
      │
      ├──→ /cliente (login cliente)
      │         │
      │         └──→ /artistas/:id (ver perfil)
      │
      └──→ /artista (login artista)
                │
                ├──→ /artistas/:id (editar perfil)
                │         │
                │         └──→ /artista (após salvar)
                │
                └──→ /cliente (ver outros artistas)
```

---

## 🔧 PRÓXIMOS PASSOS RECOMENDADOS

1. **Criar Navbar/Menu** no `Aplicacao.layout.tsx`
2. **Adicionar Página 404**
3. **Resolver rota** `/autenticacao/redefinir-senha`
4. **Criar perfil do cliente** (`/cliente/perfil`)
5. **Landing page** na rota `/`
6. **Breadcrumbs** para contexto de navegação

---

**Última atualização:** 2025-10-25
