# 🎨 Instruções para Popular Banco de Dados com Artistas

## Método 1: Página de Desenvolvimento (Recomendado)

1. **Acesse a aplicação**: http://localhost:5173
2. **Vá para a página**: http://localhost:5173/dev/popular-artistas
3. **Clique no botão**: "🚀 Popular Banco de Dados"
4. **Aguarde**: O processo cadastrará os 5 artistas automaticamente
5. **Verifique**: Vá para a página de busca para ver os artistas

## Método 2: Script JavaScript no Console

1. **Abra o navegador** na aplicação (http://localhost:5173)
2. **Abra o console** (F12 → Console)
3. **Cole e execute** o script do arquivo `popular-artistas.js`

## Método 3: cURL (Para desenvolvedores)

Execute os comandos abaixo no terminal:

```bash
# Marina Silva Santos
curl -X POST http://localhost:3000/api/auth/register/artist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marina Silva Santos",
    "email": "marina.silva@exemplo.com",
    "password": "teste123",
    "bio": "Artista visual especializada em pintura contemporânea e arte abstrata.",
    "city": "Florianópolis",
    "state": "SC",
    "artTypes": ["Pintura", "Arte Abstrata"]
  }'

# Carlos Eduardo Müller
curl -X POST http://localhost:3000/api/auth/register/artist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Eduardo Müller",
    "email": "carlos.muller@exemplo.com",
    "password": "teste123",
    "bio": "Escultor e artesão com mais de 15 anos de experiência.",
    "city": "Blumenau",
    "state": "SC",
    "artTypes": ["Escultura", "Artesanato"]
  }'

# Ana Carolina Rodrigues
curl -X POST http://localhost:3000/api/auth/register/artist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Carolina Rodrigues",
    "email": "ana.rodrigues@exemplo.com",
    "password": "teste123",
    "bio": "Fotógrafa profissional especializada em retratos e eventos.",
    "city": "Joinville",
    "state": "SC",
    "artTypes": ["Fotografia", "Retratos"]
  }'

# Rafael Gomes Oliveira
curl -X POST http://localhost:3000/api/auth/register/artist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rafael Gomes Oliveira",
    "email": "rafael.gomes@exemplo.com",
    "password": "teste123",
    "bio": "Músico multi-instrumentista e compositor.",
    "city": "Chapecó",
    "state": "SC",
    "artTypes": ["Música", "Composição"]
  }'

# Juliana Costa Pereira
curl -X POST http://localhost:3000/api/auth/register/artist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juliana Costa Pereira",
    "email": "juliana.costa@exemplo.com",
    "password": "teste123",
    "bio": "Bailarina e coreógrafa formada em dança contemporânea.",
    "city": "Lages",
    "state": "SC",
    "artTypes": ["Dança", "Coreografia"]
  }'
```

## 📋 Artistas que serão cadastrados:

1. **Marina Silva Santos** (Florianópolis)
   - Especialidades: Pintura, Arte Abstrata
   - Bio: Artista visual contemporânea

2. **Carlos Eduardo Müller** (Blumenau)
   - Especialidades: Escultura, Artesanato
   - Bio: Escultor com 15+ anos de experiência

3. **Ana Carolina Rodrigues** (Joinville)
   - Especialidades: Fotografia, Retratos
   - Bio: Fotógrafa profissional

4. **Rafael Gomes Oliveira** (Chapecó)
   - Especialidades: Música, Composição
   - Bio: Músico multi-instrumentista

5. **Juliana Costa Pereira** (Lages)
   - Especialidades: Dança, Coreografia
   - Bio: Bailarina e coreógrafa

## ✅ Após o cadastro:

- **Senha para todos**: `teste123`
- **Teste a busca**: Vá para a página de clientes ou artistas
- **Filtros**: Teste buscar por tipo de arte, cidade, nome
- **Login**: Experimente fazer login como qualquer artista

## ⚠️ Lembrete:

- Remova a rota `/dev/popular-artistas` antes de ir para produção
- Os artistas são fictícios, criados apenas para teste
- Certifique-se de que o backend está rodando na porta 3000