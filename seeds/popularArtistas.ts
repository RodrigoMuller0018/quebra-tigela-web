/**
 * SCRIPT DE REFERÊNCIA — NÃO É INTEGRADO AO BUILD
 * ===================================================
 *
 * Este arquivo NÃO é importado pelo app (fica fora de `src/`), portanto não
 * vai pro bundle do Vite nem é compilado pelo `tsc`. É só um seed pronto que
 * usei pra popular o banco com artistas fictícios durante o desenvolvimento.
 *
 * Quem clona o repo pode aproveitar como base pra criar dados de teste — basta
 * copiar pra `src/scripts/popularArtistas.ts`, registrar uma página/rota
 * (ou rodar via console) e ajustar os imports relativos. Por isso os paths
 * abaixo apontam pra `../src/...` — esses imports NÃO funcionam daqui (não há
 * tooling rodando neste arquivo); eles refletem onde os módulos morariam se
 * o script estivesse dentro de `src/scripts/`.
 *
 * Credenciais dos artistas (todos com senha `teste123`):
 *   marina.silva@exemplo.com    — Pintura       (Florianópolis/SC)
 *   carlos.muller@exemplo.com   — Escultura     (Blumenau/SC)
 *   ana.rodrigues@exemplo.com   — Fotografia    (Joinville/SC)
 *   rafael.gomes@exemplo.com    — Música        (Chapecó/SC)
 *   juliana.costa@exemplo.com   — Dança         (Lages/SC)
 *   bruno.almeida@exemplo.com   — DJ            (Itajaí/SC)        [não verificado]
 *   larissa.mendes@exemplo.com  — Tatuagem      (Florianópolis/SC) [não verificado]
 */

import { cadastrarArtista } from "../src/api/artistas.api";
import { autenticar } from "../src/api/autenticacao.api";
import { criarServico } from "../src/api/servicos.api";
import type { NovoArtista } from "../src/tipos/artistas";
import type { NovoServico } from "../src/tipos/servicos";

interface ArtistaSeed extends NovoArtista {
  /** Serviços que esse artista vai oferecer. Criados após login com a conta dele. */
  servicos: NovoServico[];
}

/**
 * 5 verificados + 2 não verificados.
 * Os não verificados existem pra testar como o sistema esconde artistas pendentes
 * (search filtra `verificado: true`) e como aparece a pendência no Dashboard.
 */
const artistasFicticios: ArtistaSeed[] = [
  {
    nome: "Marina Silva Santos",
    email: "marina.silva@exemplo.com",
    senha: "teste123",
    bio: "Artista visual especializada em pintura contemporânea e arte abstrata. Trabalho com técnicas mistas e cores vibrantes.",
    cidade: "Florianópolis",
    estado: "SC",
    tiposArte: ["Pintura", "Arte Abstrata"],
    telefone: "5548999990001",
    handle: "marina_arte",
    verificado: true,
    servicos: [
      {
        titulo: "Pintura em tela personalizada",
        descricao:
          "Quadro em tela 60x80cm pintado à mão a partir de briefing/foto. Entrega em até 30 dias.",
        ativo: true,
      },
      {
        titulo: "Mural em parede",
        descricao:
          "Pintura mural artística pra residências, bares e comércios. Inclui visita técnica.",
        ativo: true,
      },
    ],
  },
  {
    nome: "Carlos Eduardo Müller",
    email: "carlos.muller@exemplo.com",
    senha: "teste123",
    bio: "Escultor e artesão com mais de 15 anos de experiência em madeira e pedra.",
    cidade: "Blumenau",
    estado: "SC",
    tiposArte: ["Escultura", "Artesanato"],
    telefone: "5547999990002",
    handle: "carlos_muller",
    verificado: true,
    servicos: [
      {
        titulo: "Escultura em madeira sob encomenda",
        descricao:
          "Esculturas figurativas e ornamentais em madeira de reflorestamento. Tamanho médio até 1m.",
        ativo: true,
      },
    ],
  },
  {
    nome: "Ana Carolina Rodrigues",
    email: "ana.rodrigues@exemplo.com",
    senha: "teste123",
    bio: "Fotógrafa profissional especializada em retratos, casamentos e eventos corporativos.",
    cidade: "Joinville",
    estado: "SC",
    tiposArte: ["Fotografia", "Retratos"],
    telefone: "5547999990003",
    handle: "ana_lente",
    verificado: true,
    servicos: [
      {
        titulo: "Ensaio fotográfico de retratos",
        descricao:
          "Sessão de 2 horas em locação à escolha. 30 fotos editadas em alta resolução entregues em 7 dias.",
        ativo: true,
      },
      {
        titulo: "Cobertura de casamento",
        descricao:
          "Cobertura completa do casamento (cerimônia + festa). Inclui álbum digital com 300+ fotos.",
        ativo: true,
      },
    ],
  },
  {
    nome: "Rafael Gomes Oliveira",
    email: "rafael.gomes@exemplo.com",
    senha: "teste123",
    bio: "Músico multi-instrumentista e compositor. Violão, piano e bateria.",
    cidade: "Chapecó",
    estado: "SC",
    tiposArte: ["Música", "Composição"],
    telefone: "5549999990004",
    handle: "rafa_violao",
    verificado: true,
    servicos: [
      {
        titulo: "Show acústico para eventos",
        descricao:
          "Apresentação de 1h30 com voz e violão. Repertório MPB, rock acústico e românticas.",
        ativo: true,
      },
      {
        titulo: "Aulas particulares de violão",
        descricao:
          "Aulas presenciais ou online. Iniciantes e intermediários. Pacotes de 4 ou 8 aulas.",
        ativo: true,
      },
    ],
  },
  {
    nome: "Juliana Costa Pereira",
    email: "juliana.costa@exemplo.com",
    senha: "teste123",
    bio: "Bailarina e coreógrafa formada em dança contemporânea e ballet clássico.",
    cidade: "Lages",
    estado: "SC",
    tiposArte: ["Dança", "Coreografia"],
    telefone: "5549999990005",
    handle: "juli_danca",
    verificado: true,
    servicos: [
      {
        titulo: "Coreografia para evento",
        descricao:
          "Coreografia personalizada para casamentos, formaturas e festas temáticas. Inclui 4 ensaios.",
        ativo: true,
      },
    ],
  },
  // --- 2 artistas NÃO verificados ---
  {
    nome: "Bruno Henrique Almeida",
    email: "bruno.almeida@exemplo.com",
    senha: "teste123",
    bio: "DJ e produtor musical em ascensão. Foco em sets de house e tech house.",
    cidade: "Itajaí",
    estado: "SC",
    tiposArte: ["DJ", "Música Eletrônica"],
    telefone: "5547999990006",
    handle: "dj_bruno",
    verificado: false,
    servicos: [
      {
        titulo: "Set DJ para festa privada",
        descricao:
          "Set de 3 horas com equipamento próprio. House, tech house e clássicos.",
        ativo: true,
      },
    ],
  },
  {
    nome: "Larissa Mendes Cardoso",
    email: "larissa.mendes@exemplo.com",
    senha: "teste123",
    bio: "Tatuadora especializada em fineline e blackwork.",
    cidade: "Florianópolis",
    estado: "SC",
    tiposArte: ["Tatuagem", "Ilustração"],
    telefone: "5548999990007",
    handle: "lari_tattoo",
    verificado: false,
    servicos: [
      {
        titulo: "Tatuagem fineline pequena",
        descricao:
          "Tatuagens delicadas até 10cm. Estilo fineline com tinta preta. Orçamento por design.",
        ativo: true,
      },
    ],
  },
];

/**
 * Cadastra cada artista e em seguida loga como ele pra criar seus serviços.
 * Importante: isso sobrescreve o `token` do localStorage do executor.
 * O script salva o token original antes e restaura no final.
 */
export async function popularBancoComArtistas(): Promise<void> {
  const tokenOriginal = localStorage.getItem("token");

  let criados = 0;
  let falhas = 0;
  let totalServicos = 0;

  for (let i = 0; i < artistasFicticios.length; i++) {
    const artista = artistasFicticios[i];
    const tag = `[${i + 1}/${artistasFicticios.length}] ${artista.nome}`;

    try {
      const { servicos, ...dadosArtista } = artista;

      console.log(`${tag} → cadastrando artista (verificado=${artista.verificado})...`);
      await cadastrarArtista(dadosArtista);
      criados++;

      console.log(`${tag} → autenticando pra criar serviços...`);
      await autenticar(artista.email, artista.senha);

      for (const servico of servicos) {
        try {
          await criarServico(servico);
          totalServicos++;
          console.log(`${tag}   • serviço criado: ${servico.titulo}`);
        } catch (e: any) {
          console.error(
            `${tag}   ✗ falha no serviço "${servico.titulo}":`,
            e?.message || e,
          );
        }
      }
    } catch (e: any) {
      falhas++;
      console.error(`${tag} ✗ falha:`, e?.message || e);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  if (tokenOriginal) {
    localStorage.setItem("token", tokenOriginal);
    console.log("\n🔁 Sessão original restaurada.");
  } else {
    localStorage.removeItem("token");
    console.log("\n👋 Sem sessão original — você fica deslogado.");
  }

  console.log(
    `\n✅ Concluído: ${criados} artistas criados, ${falhas} falhas, ${totalServicos} serviços cadastrados.`,
  );
}
