# Mapa Completo de IDs de Formulários

## Registro.pagina.tsx

### Formulário Cliente:
- `id="nome-completo-cliente"` `name="nomeCompleto"`
- `id="email-cliente"` `name="email"`
- `id="senha-cliente"` `name="senha"`
- `id="estado-cliente"` `name="estado"` (via SeletorEstadoCidade)
- `id="cidade-cliente"` `name="cidade"` (via SeletorEstadoCidade)

### Formulário Artista:
- `id="nome-completo-artista"` `name="nomeCompleto"`
- `id="email-artista"` `name="email"`
- `id="senha-artista"` `name="senha"`
- `id="tipos-arte-artista"` `name="tiposArte"`
- `id="bio-artista"` `name="bio"`
- `id="estado-artista"` `name="estado"` (via SeletorEstadoCidade)
- `id="cidade-artista"` `name="cidade"` (via SeletorEstadoCidade)

## Login.pagina.tsx
- `id="email-login"` `name="email"`
- `id="senha-login"` `name="senha"`
- `id="lembrar-email-login"` `name="lembrar"`

## EsqueciSenha.pagina.tsx
- `id="email-esqueci-senha"` `name="email"`

## RedefinirSenha.pagina.tsx
- `id="email-redefinir"` `name="email"`
- `id="codigo-redefinir"` `name="codigo"`
- `id="senha-redefinir"` `name="senha"`

## DetalheArtista.pagina.tsx
- `id="nome-detalhe"` `name="nome"`
- `id="cidade-detalhe"` `name="cidade"`
- `id="estado-detalhe"` `name="estado"`
- `id="bio-detalhe"` `name="bio"`
- `id="verificado-detalhe"` `name="verificado"`
- `id="tipos-arte-detalhe"` `name="tiposArte"`

## HomeCliente.pagina.tsx (Filtros Modal)
- `id="estado-filtro"` `name="estado"`
- `id="cidade-filtro"` `name="cidade"`
- `id="tipo-{nome}-filtro"` `name="tiposArte"` (checkboxes dinâmicos)

## ✅ VERIFICAÇÃO: Todos os IDs são únicos
Nenhum ID se repete em toda a aplicação.
