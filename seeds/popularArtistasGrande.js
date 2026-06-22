/**
 * SCRIPT DE SEED - PRA RODAR NO CONSOLE DO BROWSER
 * =================================================
 *
 * Cadastra 20 artistas variados (cidades, tipos de arte, com/sem verificado)
 * e cria ~50 serviços distribuídos entre eles. Pensado pra popular o ambiente
 * de demo antes da apresentação.
 *
 * COMO USAR
 * ---------
 * 1. Abre o site https://quebra-tigela-web.vercel.app no navegador
 * 2. Aperta F12 → aba Console
 * 3. Cola TUDO desse arquivo e dá Enter
 * 4. Aguarda os logs ("✅ Concluído" no final) — leva ~2-3min
 * 5. Pronto: 20 artistas + ~50 serviços no banco
 *
 * IMPORTANTE
 * ----------
 * - Todos os artistas têm a mesma senha: `teste123`
 * - O script sobrescreve o token de sessão durante a execução e restaura
 *   o original no final. Se você estava logado, fica logado de novo.
 * - Pode rodar várias vezes? NÃO. A 2ª execução falha porque os e-mails
 *   e handles são únicos. Pra rodar de novo, apaga os artistas antes.
 * - Depois de usar, REMOVA esse arquivo do repo antes de subir.
 */

(async function popularArtistasGrande() {
  // Detecta automaticamente: se rodando em prod (vercel), aponta pro backend
  // em prod. Se localhost, fala com o localhost:3000.
  const API_BASE = window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "https://quebra-tigela-backend.onrender.com/api";

  console.log(`🌱 Seed contra ${API_BASE}`);

  const artistas = [
    {
      nome: "Marina Silva Santos",
      email: "marina.silva@exemplo.com",
      senha: "teste123",
      bio: "Artista visual especializada em pintura contemporânea e arte abstrata. Trabalho com técnicas mistas e cores vibrantes inspiradas no litoral catarinense.",
      cidade: "Florianópolis",
      estado: "SC",
      tiposArte: ["Pintura", "Pintura acrílica", "Arte abstrata"],
      telefone: "5548999990001",
      handle: "marina_arte",
      verificado: true,
      nomeArtistico: "Marina Arte",
      portfolio: "https://marinaarte.com.br",
      servicos: [
        { titulo: "Pintura em tela personalizada", descricao: "Quadro em tela 60x80cm pintado à mão a partir de briefing/foto. Entrega em até 30 dias.", ativo: true },
        { titulo: "Mural em parede", descricao: "Pintura mural artística pra residências, bares e comércios. Inclui visita técnica.", ativo: true },
        { titulo: "Aula particular de pintura", descricao: "Aulas individuais de pintura acrílica. Material incluso. Aulas de 2h.", ativo: true },
      ],
    },
    {
      nome: "Carlos Eduardo Müller",
      email: "carlos.muller@exemplo.com",
      senha: "teste123",
      bio: "Escultor e artesão com mais de 15 anos de experiência em madeira de reflorestamento e pedra-sabão.",
      cidade: "Blumenau",
      estado: "SC",
      tiposArte: ["Escultura em madeira", "Escultura em pedra"],
      telefone: "5547999990002",
      handle: "carlos_muller",
      verificado: true,
      servicos: [
        { titulo: "Escultura em madeira sob encomenda", descricao: "Esculturas figurativas e ornamentais em madeira de reflorestamento. Tamanho médio até 1m.", ativo: true },
        { titulo: "Restauro de peças de madeira", descricao: "Restauração e conservação de móveis e esculturas antigas. Orçamento sob consulta.", ativo: true },
      ],
    },
    {
      nome: "Ana Carolina Rodrigues",
      email: "ana.rodrigues@exemplo.com",
      senha: "teste123",
      bio: "Fotógrafa profissional especializada em retratos, casamentos e eventos corporativos. Equipamento Canon profissional.",
      cidade: "Joinville",
      estado: "SC",
      tiposArte: ["Fotografia", "Retratos"],
      telefone: "5547999990003",
      handle: "ana_lente",
      verificado: true,
      nomeArtistico: "Ana Lente",
      servicos: [
        { titulo: "Ensaio fotográfico de retratos", descricao: "Sessão de 2 horas em locação à escolha. 30 fotos editadas em alta resolução entregues em 7 dias.", ativo: true },
        { titulo: "Cobertura de casamento", descricao: "Cobertura completa do casamento (cerimônia + festa). Inclui álbum digital com 300+ fotos.", ativo: true },
        { titulo: "Foto corporativa", descricao: "Headshots e fotos institucionais pra LinkedIn, site da empresa, materiais de marketing.", ativo: true },
      ],
    },
    {
      nome: "Rafael Gomes Oliveira",
      email: "rafael.gomes@exemplo.com",
      senha: "teste123",
      bio: "Músico multi-instrumentista e compositor. Violão, piano e bateria. 10 anos tocando profissionalmente.",
      cidade: "Chapecó",
      estado: "SC",
      tiposArte: ["Música instrumental", "Canto / Vocal"],
      telefone: "5549999990004",
      handle: "rafa_violao",
      verificado: true,
      servicos: [
        { titulo: "Show acústico para eventos", descricao: "Apresentação de 1h30 com voz e violão. Repertório MPB, rock acústico e românticas.", ativo: true },
        { titulo: "Aulas particulares de violão", descricao: "Aulas presenciais ou online. Iniciantes e intermediários. Pacotes de 4 ou 8 aulas.", ativo: true },
        { titulo: "Trilha sonora para casamento", descricao: "Música ao vivo pra cerimônia e recepção. Repertório personalizado.", ativo: true },
      ],
    },
    {
      nome: "Juliana Costa Pereira",
      email: "juliana.costa@exemplo.com",
      senha: "teste123",
      bio: "Bailarina e coreógrafa formada em dança contemporânea e ballet clássico pela Escola Bolshoi Brasil.",
      cidade: "Lages",
      estado: "SC",
      tiposArte: ["Dança contemporânea", "Ballet clássico"],
      telefone: "5549999990005",
      handle: "juli_danca",
      verificado: true,
      servicos: [
        { titulo: "Coreografia para evento", descricao: "Coreografia personalizada para casamentos, formaturas e festas temáticas. Inclui 4 ensaios.", ativo: true },
        { titulo: "Aulas de dança contemporânea", descricao: "Aulas em grupo ou particulares. Espaço próprio em Lages.", ativo: true },
      ],
    },
    {
      nome: "Bruno Henrique Almeida",
      email: "bruno.almeida@exemplo.com",
      senha: "teste123",
      bio: "DJ e produtor musical em ascensão. Foco em sets de house e tech house. Equipamento Pioneer profissional.",
      cidade: "Itajaí",
      estado: "SC",
      tiposArte: ["DJ", "Música eletrônica"],
      telefone: "5547999990006",
      handle: "dj_bruno",
      verificado: false,
      servicos: [
        { titulo: "Set DJ para festa privada", descricao: "Set de 3 horas com equipamento próprio. House, tech house e clássicos.", ativo: true },
        { titulo: "DJ para casamento", descricao: "Cobertura completa de cerimônia + festa. Inclui som e iluminação.", ativo: true },
      ],
    },
    {
      nome: "Larissa Mendes Cardoso",
      email: "larissa.mendes@exemplo.com",
      senha: "teste123",
      bio: "Tatuadora especializada em fineline e blackwork. Estúdio próprio com toda biossegurança.",
      cidade: "Florianópolis",
      estado: "SC",
      tiposArte: ["Tatuagem", "Ilustração"],
      telefone: "5548999990007",
      handle: "lari_tattoo",
      verificado: false,
      servicos: [
        { titulo: "Tatuagem fineline pequena", descricao: "Tatuagens delicadas até 10cm. Estilo fineline com tinta preta. Orçamento por design.", ativo: true },
        { titulo: "Tatuagem blackwork", descricao: "Trabalhos em preto sólido. Geométricos, abstratos, orientais.", ativo: true },
      ],
    },
    {
      nome: "Pedro Henrique Lima",
      email: "pedro.lima@exemplo.com",
      senha: "teste123",
      bio: "Cerâmico e oleiro com mais de 10 anos modelando peças utilitárias e decorativas no torno.",
      cidade: "Brusque",
      estado: "SC",
      tiposArte: ["Cerâmica", "Modelagem em argila"],
      telefone: "5547999990008",
      handle: "pedro_ceramica",
      verificado: true,
      servicos: [
        { titulo: "Conjunto de cerâmica utilitária", descricao: "Kit com pratos, tigelas e canecas modelados à mão. Esmalte atóxico, vai à máquina.", ativo: true },
        { titulo: "Vasos decorativos sob encomenda", descricao: "Vasos artesanais em tamanhos e cores variadas. Personalização disponível.", ativo: true },
        { titulo: "Workshop de cerâmica", descricao: "Aula intensiva de 4h pra iniciantes. Inclui materiais e queima das peças.", ativo: true },
      ],
    },
    {
      nome: "Camila Ribeiro Souza",
      email: "camila.ribeiro@exemplo.com",
      senha: "teste123",
      bio: "Designer gráfica e ilustradora freelancer. Identidade visual pra pequenos negócios e ilustração editorial.",
      cidade: "Florianópolis",
      estado: "SC",
      tiposArte: ["Design gráfico", "Ilustração", "Arte digital"],
      telefone: "5548999990009",
      handle: "camila_design",
      verificado: true,
      portfolio: "https://camiladesign.com.br",
      servicos: [
        { titulo: "Identidade visual completa", descricao: "Logo + cartão + papelaria + manual de uso. Entrega em 15 dias.", ativo: true },
        { titulo: "Ilustração digital sob demanda", descricao: "Ilustrações pra livros, blogs, redes sociais. Estilo flat, cartoon ou realista.", ativo: true },
      ],
    },
    {
      nome: "Thiago Santos Vieira",
      email: "thiago.santos@exemplo.com",
      senha: "teste123",
      bio: "Cantor e compositor de MPB. 3 EPs lançados, presença em festivais regionais.",
      cidade: "Criciúma",
      estado: "SC",
      tiposArte: ["Canto / Vocal", "Composição musical"],
      telefone: "5548999990010",
      handle: "thiago_mpb",
      verificado: false,
      servicos: [
        { titulo: "Show solo MPB", descricao: "Apresentação de 1h com voz e violão. Repertório autoral e covers de MPB.", ativo: true },
        { titulo: "Composição de música personalizada", descricao: "Música autoral pra presente, declaração ou trilha. Entrega em 30 dias com áudio profissional.", ativo: true },
      ],
    },
    {
      nome: "Fernanda Lopes Martins",
      email: "fernanda.lopes@exemplo.com",
      senha: "teste123",
      bio: "Bordadeira e artesã. Trabalho com bordado livre, pedraria e customização de roupas.",
      cidade: "Tubarão",
      estado: "SC",
      tiposArte: ["Bordado", "Costura criativa"],
      telefone: "5548999990011",
      handle: "fer_bordados",
      verificado: true,
      servicos: [
        { titulo: "Bordado livre em quadro", descricao: "Quadros bordados temáticos, 20x30cm a 40x60cm. Tema personalizado.", ativo: true },
        { titulo: "Customização de jaqueta jeans", descricao: "Bordado em jaqueta jeans com tema escolhido. Frase, ilustração ou flor.", ativo: true },
        { titulo: "Workshop de bordado", descricao: "Aula iniciante de 3h. Kit incluso. Aprenda 4 pontos básicos.", ativo: true },
      ],
    },
    {
      nome: "Lucas Pereira Costa",
      email: "lucas.pereira@exemplo.com",
      senha: "teste123",
      bio: "Videomaker e editor freelancer. Documentários curtos, vídeos pra redes sociais, casamentos.",
      cidade: "Balneário Camboriú",
      estado: "SC",
      tiposArte: ["Videomaking", "Edição de vídeo"],
      telefone: "5547999990012",
      handle: "lucas_video",
      verificado: false,
      servicos: [
        { titulo: "Vídeo institucional curto", descricao: "Vídeo de 60-90s pra empresa. Inclui roteiro, gravação e edição. Drone disponível.", ativo: true },
        { titulo: "Cobertura de casamento em vídeo", descricao: "Filmagem completa + filme editado de 8min. Entrega em 30 dias.", ativo: true },
      ],
    },
    {
      nome: "Beatriz Alves Nunes",
      email: "beatriz.alves@exemplo.com",
      senha: "teste123",
      bio: "Atriz e diretora teatral. Formada pela UDESC. Espetáculos infantis e dramáticos.",
      cidade: "Florianópolis",
      estado: "SC",
      tiposArte: ["Teatro", "Direção teatral"],
      telefone: "5548999990013",
      handle: "bia_teatro",
      verificado: true,
      servicos: [
        { titulo: "Espetáculo infantil", descricao: "Peça teatral de 40min pra escolas e festas. Cenário e figurino próprios.", ativo: true },
        { titulo: "Workshop de teatro", descricao: "Oficina de 8 encontros pra iniciantes. Improviso, voz e corpo.", ativo: true },
      ],
    },
    {
      nome: "Gustavo Oliveira Ferreira",
      email: "gustavo.oliveira@exemplo.com",
      senha: "teste123",
      bio: "Confeiteiro artístico. Bolos decorados, doces finos e mesas de doces personalizadas.",
      cidade: "Jaraguá do Sul",
      estado: "SC",
      tiposArte: ["Confeitaria artística", "Gastronomia criativa"],
      telefone: "5547999990014",
      handle: "gusta_confeitaria",
      verificado: true,
      servicos: [
        { titulo: "Bolo decorado personalizado", descricao: "Bolos de até 3 andares. Pasta americana ou chantilly. Temas variados.", ativo: true },
        { titulo: "Mesa de doces para festa", descricao: "Mesa montada com 6 tipos de doces finos. Decoração inclusa.", ativo: true },
        { titulo: "Workshop de confeitaria", descricao: "Aula prática de bolos no pote ou cookies decorados. 4h.", ativo: true },
      ],
    },
    {
      nome: "Mariana Castro Dias",
      email: "mariana.castro@exemplo.com",
      senha: "teste123",
      bio: "Joalheira artesã. Peças únicas em prata 950 e pedras semipreciosas.",
      cidade: "Concórdia",
      estado: "SC",
      tiposArte: ["Joalheria artesanal", "Ourivesaria"],
      telefone: "5549999990015",
      handle: "mari_joias",
      verificado: false,
      servicos: [
        { titulo: "Anel personalizado em prata", descricao: "Anel sob medida com pedra à escolha. Entrega em 20 dias.", ativo: true },
        { titulo: "Conserto e restauro de joias", descricao: "Conserto de correntes, alargamento de anel, soldagem.", ativo: true },
      ],
    },
    {
      nome: "Rodrigo Vieira Lima",
      email: "rodrigo.vieira@exemplo.com",
      senha: "teste123",
      bio: "Animador 2D e motion designer. Trabalho com animação pra redes sociais, vinhetas e clips.",
      cidade: "São José",
      estado: "SC",
      tiposArte: ["Animação 2D", "Motion design"],
      telefone: "5548999990016",
      handle: "rod_animacao",
      verificado: true,
      portfolio: "https://rodanima.studio",
      servicos: [
        { titulo: "Animação curta para Instagram", descricao: "Animação de até 30s pra redes sociais. Inclui roteiro e trilha.", ativo: true },
        { titulo: "Vinheta animada", descricao: "Vinheta de abertura de 5-10s pra canal de YouTube ou podcast.", ativo: true },
        { titulo: "Logo animado", descricao: "Animação do seu logo pra usar em redes, sites e vídeos.", ativo: true },
      ],
    },
    {
      nome: "Patrícia Mello Andrade",
      email: "patricia.mello@exemplo.com",
      senha: "teste123",
      bio: "Velista artesanal. Velas de soja decorativas e aromatizadores pra ambientes.",
      cidade: "Palhoça",
      estado: "SC",
      tiposArte: ["Velas artesanais", "Aromaterapia"],
      telefone: "5548999990017",
      handle: "patih_velas",
      verificado: true,
      servicos: [
        { titulo: "Kit de velas aromáticas", descricao: "Trio de velas de soja com aromas exclusivos. Embalagem pra presente.", ativo: true },
        { titulo: "Vela personalizada para evento", descricao: "Velas-lembrança pra casamento, batizado, formatura. Mínimo 30un.", ativo: true },
      ],
    },
    {
      nome: "Henrique Barbosa Reis",
      email: "henrique.barbosa@exemplo.com",
      senha: "teste123",
      bio: "Quadrinhista e ilustrador. Já publicou 2 HQs independentes. Estilo realista-cartoon.",
      cidade: "Caçador",
      estado: "SC",
      tiposArte: ["Quadrinhos / HQ", "Ilustração"],
      telefone: "5549999990018",
      handle: "henrique_quadrinhos",
      verificado: false,
      servicos: [
        { titulo: "Tirinha personalizada", descricao: "Tira de 3-4 quadros com você como protagonista. Presente único.", ativo: true },
        { titulo: "Caricatura colorida", descricao: "Caricatura digital de alta qualidade. Entrega em até 5 dias.", ativo: true },
      ],
    },
    {
      nome: "Isabela Cruz Fernandes",
      email: "isabela.cruz@exemplo.com",
      senha: "teste123",
      bio: "Estilista e modelista. Peças autorais sob medida. Foco em moda lenta e sustentável.",
      cidade: "Brusque",
      estado: "SC",
      tiposArte: ["Moda autoral", "Modelagem de roupas"],
      telefone: "5547999990019",
      handle: "isa_moda",
      verificado: true,
      portfolio: "https://isabelacruz.com.br",
      servicos: [
        { titulo: "Vestido de festa sob medida", descricao: "Vestido autoral feito sob medida. Inclui 3 provas. Entrega em 45 dias.", ativo: true },
        { titulo: "Look completo pra ensaio", descricao: "Conjunto autoral pra ensaio fotográfico, editorial ou desfile.", ativo: true },
        { titulo: "Reforma criativa de roupa", descricao: "Transforma peça antiga em algo novo. Customização total.", ativo: true },
      ],
    },
    {
      nome: "Felipe Moreira Gomes",
      email: "felipe.moreira@exemplo.com",
      senha: "teste123",
      bio: "Performer de circo e mágica. Animação de festas infantis, eventos corporativos e casamentos.",
      cidade: "Rio do Sul",
      estado: "SC",
      tiposArte: ["Circo", "Mágica"],
      telefone: "5547999990020",
      handle: "felipe_circo",
      verificado: false,
      servicos: [
        { titulo: "Show de mágica infantil", descricao: "Apresentação de 45min com mágicas interativas. Pra festas de 4 a 10 anos.", ativo: true },
        { titulo: "Performance de circo em evento", descricao: "Malabares e equilibrismo pra evento corporativo. 20-30min.", ativo: true },
      ],
    },
  ];

  // ----------------------------------------------------------------
  // Helpers HTTP
  // ----------------------------------------------------------------

  async function postJson(rota, corpo, token) {
    const res = await fetch(`${API_BASE}${rota}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(corpo),
    });
    if (!res.ok) {
      const erro = await res.text();
      throw new Error(`${res.status} ${rota}: ${erro}`);
    }
    return res.json();
  }

  async function cadastrarArtista(dados) {
    return postJson("/autenticacao/registrar/artista", dados);
  }

  async function autenticar(email, senha) {
    const resp = await postJson("/autenticacao/login", { email, senha });
    return resp.access_token;
  }

  async function criarServico(servico, token) {
    return postJson("/servicos", servico, token);
  }

  // ----------------------------------------------------------------
  // Execução
  // ----------------------------------------------------------------

  const tokenOriginal = localStorage.getItem("token");

  let criados = 0;
  let falhas = 0;
  let totalServicos = 0;

  for (let i = 0; i < artistas.length; i++) {
    const a = artistas[i];
    const tag = `[${i + 1}/${artistas.length}] ${a.nome}`;
    try {
      const { servicos, ...dadosArtista } = a;
      console.log(`${tag} → cadastrando (verificado=${a.verificado})...`);
      await cadastrarArtista(dadosArtista);
      criados++;

      const tokenArtista = await autenticar(a.email, a.senha);

      for (const s of servicos) {
        try {
          await criarServico(s, tokenArtista);
          totalServicos++;
          console.log(`${tag}   • serviço: ${s.titulo}`);
        } catch (e) {
          console.error(`${tag}   ✗ serviço "${s.titulo}":`, e.message || e);
        }
      }
    } catch (e) {
      falhas++;
      console.error(`${tag} ✗ falha:`, e.message || e);
    }

    // Pequena pausa pra não martelar o backend (Render free tier é magrinho)
    await new Promise((r) => setTimeout(r, 400));
  }

  // Restaura sessão do executor
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
})();
