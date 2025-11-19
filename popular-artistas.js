// Script para popular banco de dados com artistas fictícios
// Execute este código no console do navegador (F12) enquanto estiver na aplicação

const artistas = [
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

// Função para registrar um artista
async function registrarArtista(artista) {
  try {
    const response = await fetch('/api/auth/register/artist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(artista)
    });

    if (response.ok) {
      const resultado = await response.json();
      console.log(`✅ Artista ${artista.name} cadastrado com sucesso!`, resultado);
      return resultado;
    } else {
      const erro = await response.text();
      console.error(`❌ Erro ao cadastrar ${artista.name}:`, erro);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro de rede ao cadastrar ${artista.name}:`, error);
    return null;
  }
}

// Função para cadastrar todos os artistas
async function popularBanco() {
  console.log('🚀 Iniciando cadastro de artistas fictícios...');

  for (let i = 0; i < artistas.length; i++) {
    console.log(`\n📝 Cadastrando artista ${i + 1}/${artistas.length}: ${artistas[i].name}`);
    await registrarArtista(artistas[i]);

    // Pequena pausa entre cadastros para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Processo de cadastro finalizado!');
  console.log('📋 Para verificar os artistas cadastrados, acesse a página de busca.');
}

// Executar o script
console.log('🎨 Script de população de artistas carregado!');
console.log('📞 Execute popularBanco() para cadastrar os 5 artistas fictícios.');
console.log('⚠️  Certifique-se de estar logado na aplicação antes de executar.');

// Executar automaticamente
popularBanco();