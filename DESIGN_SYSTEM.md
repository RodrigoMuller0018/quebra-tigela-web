# Sistema de Design - Quebra Tigela

Documentação do sistema de design implementado para escalabilidade e manutenibilidade.

## 📐 Arquitetura

### Hierarquia de Tokens

O sistema segue a hierarquia: **Primitivos → Semânticos → Componentes**

```
primitives (cores brutas, valores básicos)
    ↓
semantic (propósito/intenção)
    ↓
components (específicos de cada componente)
```

## 🎨 Design Tokens

### Localização

- **TypeScript**: `src/estilos/tokens.ts` - Definições tipadas para uso em JS/TS
- **CSS**: `src/estilos/tema.css` - Custom properties CSS para uso direto

### Uso

```tsx
// Em TypeScript
import { semantic } from '@/estilos/tokens';

const buttonStyle = {
  padding: semantic.spacing.md,
  borderRadius: semantic.radius.md,
};

// Em CSS
.meu-botao {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--primary);
}
```

### Categorias de Tokens

#### Espaçamento (Sistema 4px)
```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 40px
--spacing-3xl: 48px
--spacing-4xl: 64px
```

#### Border Radius
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 18px
--radius-xl: 24px
--radius-full: 9999px
```

#### Tipografia
```css
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-black: 900
```

## 🛠️ Utilities CSS

### Localização
`src/estilos/utilities.css`

### Categorias Disponíveis

#### Spacing
```html
<!-- Margin -->
<div class="mt-md mb-lg">Margem top médio e bottom grande</div>

<!-- Padding -->
<div class="px-lg py-md">Padding horizontal grande e vertical médio</div>

<!-- Gap (flexbox/grid) -->
<div class="d-flex gap-md">Flexbox com gap médio</div>
```

#### Display & Flexbox
```html
<div class="d-flex justify-center align-center gap-sm">
  Flex centralizado com gap pequeno
</div>

<div class="d-grid gap-lg">
  Grid com gap grande
</div>
```

#### Tipografia
```html
<p class="text-lg font-bold text-primary">
  Texto grande, negrito, cor primária
</p>

<p class="text-sm text-secondary">
  Texto pequeno, cor secundária
</p>
```

#### Responsive
```html
<!-- Esconder em mobile -->
<div class="mobile:d-none desktop:d-block">
  Visível apenas em desktop
</div>

<!-- Mudar direção em mobile -->
<div class="d-flex desktop:flex-row mobile:flex-column">
  Linha no desktop, coluna no mobile
</div>
```

## 🧩 Componentes

### CampoTexto (Input)

#### Padrão Atual (Recomendado)

```tsx
import { CampoTexto } from '@/componentes/ui';

// Campo de email
<CampoTexto
  label="E-mail"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// Campo de senha com ícone automático
<CampoTexto
  label="Senha"
  type="password"
  value={senha}
  onChange={(e) => setSenha(e.target.value)}
  showPasswordToggle  // Ícone de olho automático
  required
/>
```

#### Composition Pattern (Avançado)

Para casos mais complexos, use o composition pattern:

```tsx
import { CampoTexto } from '@/componentes/ui/CampoTexto/CampoTextoComposition';

<CampoTexto>
  <CampoTexto.Label>E-mail</CampoTexto.Label>
  <CampoTexto.Input type="email" />
  <CampoTexto.Helper>Digite seu e-mail principal</CampoTexto.Helper>
  <CampoTexto.Error show={erro}>E-mail inválido</CampoTexto.Error>
</CampoTexto>

// Campo de senha com composition
<CampoTexto>
  <CampoTexto.Label>Senha</CampoTexto.Label>
  <CampoTexto.Password />  {/* Ícone automático */}
  <CampoTexto.Helper>Mínimo 6 caracteres</CampoTexto.Helper>
</CampoTexto>
```

### Ícones

```tsx
import { Eye, EyeOff } from '@/componentes/ui/Icons';

// Usar ícones diretamente
<button>
  <Eye /> Mostrar
</button>

// Customizar tamanho e cor
<Eye width={24} height={24} color="red" />
```

## 📦 Função Utilitária `cn()`

Alternativa leve ao `clsx` para concatenar classes condicionalmente:

```tsx
import { cn } from '@/utilitarios/cn';

// Uso básico
<div className={cn('base', isActive && 'active', 'outro')}>

// Com objetos
<div className={cn('base', { active: isActive, disabled: isDisabled })}>

// Com arrays
<div className={cn(['base', 'shared'], isActive && 'active')}>

// Exemplo real
<button className={cn(
  'btn',
  variant === 'primary' && 'btn-primary',
  variant === 'secondary' && 'btn-secondary',
  isLoading && 'btn-loading',
  disabled && 'btn-disabled'
)}>
```

## 🎯 Boas Práticas

### ✅ Fazer

1. **Use tokens ao invés de valores fixos**
   ```css
   /* ✅ Bom */
   padding: var(--spacing-md);

   /* ❌ Evitar */
   padding: 16px;
   ```

2. **Use utilities para espaçamento comum**
   ```tsx
   /* ✅ Bom */
   <div className="mt-lg mb-md">

   /* ❌ Evitar */
   <div style={{ marginTop: '24px', marginBottom: '16px' }}>
   ```

3. **Use composition para componentes complexos**
   ```tsx
   /* ✅ Bom - Flexível */
   <CampoTexto>
     <CampoTexto.Input />
     <CampoTexto.Helper>Dica</CampoTexto.Helper>
   </CampoTexto>

   /* ❌ Evitar - Props drilling */
   <CampoTexto helper="Dica" icon="email" prefix="$" suffix="USD" ... />
   ```

4. **Use showPasswordToggle para senhas**
   ```tsx
   /* ✅ Bom - Moderno */
   <CampoTexto type="password" showPasswordToggle />

   /* ❌ Deprecated - Texto */
   <CampoTexto type={show ? "text" : "password"} acaoTexto="EXIBIR" />
   ```

### ❌ Evitar

1. **Valores mágicos** - Use tokens nomeados
2. **Estilos inline** - Use classes ou CSS modules
3. **Props drilling excessivo** - Use composition pattern
4. **Repetição de código** - Use utilities CSS

## 🚀 Migrando Código Antigo

### Campo de Senha

**Antes:**
```tsx
const [mostrarSenha, setMostrarSenha] = useState(false);

<CampoTexto
  type={mostrarSenha ? "text" : "password"}
  acaoTexto={mostrarSenha ? "OCULTAR" : "EXIBIR"}
  onAcaoClick={() => setMostrarSenha(!mostrarSenha)}
/>
```

**Depois:**
```tsx
// Remove estado e lógica

<CampoTexto
  type="password"
  showPasswordToggle
/>
```

### Espaçamento Manual

**Antes:**
```tsx
<div style={{ marginTop: '24px', paddingLeft: '16px' }}>
```

**Depois:**
```tsx
<div className="mt-lg pl-md">
```

## 📚 Referências

- Design Tokens: `src/estilos/tokens.ts`
- Utilities CSS: `src/estilos/utilities.css`
- Tema Global: `src/estilos/tema.css`
- Função cn(): `src/utilitarios/cn.ts`
- Ícones: `src/componentes/ui/Icons/`
- CampoTexto: `src/componentes/ui/CampoTexto/`

## 🎨 Inspirações

Este sistema foi inspirado em práticas de grandes empresas:

- **Tailwind CSS**: Sistema de utilities
- **Radix UI**: Composition pattern
- **Material UI**: Design tokens hierárquicos
- **Atlassian Design System**: Tokens primitivos → semânticos
