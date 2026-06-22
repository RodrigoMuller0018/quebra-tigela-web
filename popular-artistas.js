/**
 * Script para popular o banco com artistas fictícios.
 *
 * Uso: node popular-artistas.js
 * Pré-requisitos: backend rodando em http://localhost:3000 e MongoDB conectado.
 *
 * Os artistas já entram com `verified: true` pra aparecerem direto na busca
 * (skip do fluxo de verificação facial pra teste rápido).
 */

const API_BASE = process.env.API_BASE ?? "http://localhost:3000/api";

const artistas = [
  {
    name: "Marina Silva Santos",
    email: "marina.silva@exemplo.com",
    password: "teste123",
    bio: "Artista visual especializada em pintura contemporânea e arte abstrata. Formada pela UDESC, trabalho com técnicas mistas explorando as cores vibrantes de Santa Catarina. Minhas obras refletem a natureza exuberante da nossa região, criando conexões emocionais através da arte.",
    city: "Florianópolis",
    state: "SC",
    artTypes: ["Pintura", "Arte Abstrata"],
    verified: true,
  },
  {
    name: "Carlos Eduardo Müller",
    email: "carlos.muller@exemplo.com",
    password: "teste123",
    bio: "Escultor e artesão com mais de 15 anos de experiência em madeira e pedra. Especializado em esculturas figurativas e ornamentais que contam histórias da cultura catarinense. Cada peça é única, criada com materiais locais e técnicas tradicionais preservadas por gerações.",
    city: "Blumenau",
    state: "SC",
    artTypes: ["Escultura", "Artesanato"],
    verified: true,
  },
  {
    name: "Ana Carolina Rodrigues",
    email: "ana.rodrigues@exemplo.com",
    password: "teste123",
    bio: "Fotógrafa profissional especializada em retratos, casamentos e eventos corporativos. Capturo momentos únicos com sensibilidade artística, utilizando luz natural e composições criativas. Trabalho com edição avançada para entregar imagens que contam histórias inesquecíveis.",
    city: "Joinville",
    state: "SC",
    artTypes: ["Fotografia", "Retratos"],
    verified: true,
  },
  {
    name: "Rafael Gomes Oliveira",
    email: "rafael.gomes@exemplo.com",
    password: "teste123",
    bio: "Músico multi-instrumentista e compositor. Toco violão, piano e bateria, criando arranjos únicos que misturam MPB, rock e música eletrônica. Ofereço aulas particulares e apresentações para eventos de todos os tipos, sempre adaptando o repertório ao público.",
    city: "Chapecó",
    state: "SC",
    artTypes: ["Música", "Composição"],
    verified: true,
  },
  {
    name: "Juliana Costa Pereira",
    email: "juliana.costa@exemplo.com",
    password: "teste123",
    bio: "Bailarina e coreógrafa formada em dança contemporânea e ballet clássico. Ensino técnicas de dança para iniciantes e avançados, além de criar coreografias personalizadas para eventos especiais. A dança é minha forma de expressar emoções e conectar pessoas através do movimento.",
    city: "Lages",
    state: "SC",
    artTypes: ["Dança", "Coreografia"],
    verified: true,
  },
];

async function registrarArtista(artista) {
  try {
    const res = await fetch(`${API_BASE}/auth/register/artist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(artista),
    });

    if (res.ok) {
      console.log(`  ✅ ${artista.name}`);
      return { ok: true };
    }

    const body = await res.text();
    if (res.status === 409) {
      console.log(`  ⚠️  ${artista.name} — já existe (${res.status})`);
      return { ok: false, conflict: true };
    }
    console.log(`  ❌ ${artista.name} — ${res.status}: ${body.slice(0, 120)}`);
    return { ok: false };
  } catch (err) {
    console.log(`  ❌ ${artista.name} — erro de rede: ${err.message}`);
    return { ok: false };
  }
}

async function checarBackend() {
  try {
    const res = await fetch(`${API_BASE}/artists/search`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`🎨 Populando artistas em ${API_BASE}`);
  console.log("");

  const up = await checarBackend();
  if (!up) {
    console.error("❌ Backend não responde. Confirma que está rodando em http://localhost:3000");
    process.exit(1);
  }

  let okCount = 0;
  let conflictCount = 0;
  let errCount = 0;

  for (const a of artistas) {
    const r = await registrarArtista(a);
    if (r.ok) okCount++;
    else if (r.conflict) conflictCount++;
    else errCount++;
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("");
  console.log(`📊 ${okCount} criados · ${conflictCount} já existiam · ${errCount} falharam`);
  console.log(`🔍 Confere em ${API_BASE}/artists/search`);
}

main();
