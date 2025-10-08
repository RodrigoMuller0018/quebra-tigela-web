import { cadastrarArtista } from "../api/artistas.api";
import type { NovoArtista } from "../tipos/artistas";

const artistasFicticios: NovoArtista[] = [
  {
    name: "Marina Silva Santos",
    email: "marina.silva@exemplo.com",
    password: "teste123",
    bio: "Artista visual especializada em pintura contemporânea e arte abstrata. Formada pela UDESC, trabalho com técnicas mistas explorando as cores vibrantes de Santa Catarina. Minhas obras refletem a natureza exuberante da nossa região, criando conexões emocionais através da arte.",
    city: "Florianópolis",
    state: "SC",
    artTypes: ["Pintura", "Arte Abstrata"]
  },
  {
    name: "Carlos Eduardo Müller",
    email: "carlos.muller@exemplo.com",
    password: "teste123",
    bio: "Escultor e artesão com mais de 15 anos de experiência em madeira e pedra. Especializado em esculturas figurativas e ornamentais que contam histórias da cultura catarinense. Cada peça é única, criada com materiais locais e técnicas tradicionais preservadas por gerações.",
    city: "Blumenau",
    state: "SC",
    artTypes: ["Escultura", "Artesanato"]
  },
  {
    name: "Ana Carolina Rodrigues",
    email: "ana.rodrigues@exemplo.com",
    password: "teste123",
    bio: "Fotógrafa profissional especializada em retratos, casamentos e eventos corporativos. Capturo momentos únicos com sensibilidade artística, utilizando luz natural e composições criativas. Trabalho com edição avançada para entregar imagens que contam histórias inesquecíveis.",
    city: "Joinville",
    state: "SC",
    artTypes: ["Fotografia", "Retratos"]
  },
  {
    name: "Rafael Gomes Oliveira",
    email: "rafael.gomes@exemplo.com",
    password: "teste123",
    bio: "Músico multi-instrumentista e compositor. Toco violão, piano e bateria, criando arranjos únicos que misturam MPB, rock e música eletrônica. Ofereço aulas particulares e apresentações para eventos de todos os tipos, sempre adaptando o repertório ao público.",
    city: "Chapecó",
    state: "SC",
    artTypes: ["Música", "Composição"]
  },
  {
    name: "Juliana Costa Pereira",
    email: "juliana.costa@exemplo.com",
    password: "teste123",
    bio: "Bailarina e coreógrafa formada em dança contemporânea e ballet clássico. Ensino técnicas de dança para iniciantes e avançados, além de criar coreografias personalizadas para eventos especiais. A dança é minha forma de expressar emoções e conectar pessoas através do movimento.",
    city: "Lages",
    state: "SC",
    artTypes: ["Dança", "Coreografia"]
  }
];

export async function popularBancoComArtistas(): Promise<void> {
  console.log('🚀 Iniciando cadastro de artistas fictícios...');

  for (let i = 0; i < artistasFicticios.length; i++) {
    const artista = artistasFicticios[i];
    console.log(`\n📝 Cadastrando artista ${i + 1}/${artistasFicticios.length}: ${artista.name}`);

    try {
      const resultado = await cadastrarArtista(artista);
      console.log(`✅ Artista ${artista.name} cadastrado com sucesso!`, resultado);
    } catch (error: any) {
      console.error(`❌ Erro ao cadastrar ${artista.name}:`, error?.message || error);
    }

    // Pequena pausa entre cadastros para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Processo de cadastro finalizado!');
  console.log('📋 Para verificar os artistas cadastrados, acesse a página de busca.');
}

// Para usar no console do navegador ou em desenvolvimento
(window as any).popularArtistas = popularBancoComArtistas;