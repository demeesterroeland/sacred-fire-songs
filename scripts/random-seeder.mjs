import crypto from 'crypto';

// Lists of words for generating random spiritual/medicine song titles
const verbs = [
  'Canto al', 'Danza del', 'Rezo al', 'Camino del', 'Luz de la', 
  'Fuerza de la', 'Cura de la', 'Llamado del', 'Voz del', 'Abuelo', 
  'Abuelita', 'Pájaro', 'Viento del', 'Espíritu de la', 'Sinfonía del',
  'Latido de la', 'Ecos del', 'Guardián del'
];

const nouns = [
  'Selva', 'Luna', 'Tierra', 'Agua', 'Fuego', 'Estrella', 'Montaña', 
  'Sol', 'Vida', 'Medicina', 'Lluvia', 'Flor', 'Pachamama', 'Jaguar', 
  'Águila', 'Cóndor', 'Corazón', 'Piedra', 'Colibrí', 'Bosque', 'Cielo'
];

const adjs = [
  'Sagrado', 'Curandero', 'Cielo', 'Amor', 'Gratitud', 'Limpio', 
  'Brillante', 'Eterno', 'Puro', 'Viejo', 'Divino', 'Profundo', 
  'Cósmico', 'Universal', 'Ancestral', 'Verde'
];

const authors = [
  'Nina', 'Alonso del Río', 'Traditional', 'Diego Palma', 'Shimshai', 
  'Cari El', 'Ayla Schafer', 'Herbert Quinteros', 'Traditional (Camino Rojo)',
  'Santo Daime', 'Traditional (Umbanda)', null, null
];

const userIds = [
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // admin
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', // musician
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', // member
  null // anonymous/no owner
];

// Seed templates for generating realistic ChordPro song content
const chordproVerses = [
  [
    '[Am]Luna, luna, [C]luna llena',
    '[G]Brilla en la [Am]noche entera',
    '[C]Cura, cura, [G]cura mi pena',
    '[Em]Trae la luz en [Am]tu hoguera'
  ],
  [
    '[Em]Vuela, vuela, [G]colibrí dorado',
    '[D]Trae el néctar [Em]sagrado',
    '[G]Sana las heridas [D]del pasado',
    '[B7]Deja el corazón [Em]liberado'
  ],
  [
    '[C]Agua de lluvia, [F]agua del río',
    '[G]Limpia mi mente, [C]quita mi frío',
    '[F]Llévate lejos [C]todo el vacío',
    '[G]Sana este alma en [C]que confío'
  ],
  [
    '[Dm]Abuelito Fuego, [C]ven a cantar',
    '[Bb]En este centro [Am]ven a brillar',
    '[Dm]Toda la noche [C]vamos a rezar',
    '[Bb]Hasta que el sol nos [Am]vuelva a despertar'
  ],
  [
    '[G]Tierra mi cuerpo, [D]agua mi sangre',
    '[C]Aire mi aliento, [G]fuego mi espíritu',
    '[Em]Te doy las gracias, [D]madre del mundo',
    '[C]Por este amor tan [D]puro y pro[G]fundo'
  ]
];

const chordproChoruses = [
  [
    'Chorus:',
    '[C]Pachamama, [G]madre tierra',
    '[Am]Te cantamos [Em]con amor',
    '[C]Danza, danza, [G]danza eterna',
    '[Em]Sana todo mi [Am]dolor'
  ],
  [
    'Chorus:',
    '[G]He-ya-he-ya-he-ya-[D]ho',
    '[C]Gran Espíritu [G]llegó',
    '[G]He-ya-he-ya-he-ya-[D]ho',
    '[C]En mi alma [D]se que[G]dó'
  ],
  [
    'Chorus:',
    '[F]Cura santa, [C]cura sana',
    '[G]Medicina de la [Am]selva',
    '[F]Trae la paz por [C]la mañana',
    '[G]Que la claridad [Am]devuelva'
  ]
];

function generateTitle() {
  const v = verbs[Math.floor(Math.random() * verbs.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  const a = Math.random() > 0.4 ? adjs[Math.floor(Math.random() * adjs.length)] : '';
  return `${v} ${n} ${a}`.trim();
}

function generateChordPro(title, artist, key, hasChords) {
  let text = `{title: ${title}}\n`;
  if (artist) text += `{artist: ${artist}}\n`;
  if (key) text += `{key: ${key}}\n`;
  text += `\n`;

  // Select random verses
  const v1 = chordproVerses[Math.floor(Math.random() * chordproVerses.length)];
  const v2 = chordproVerses[(Math.floor(Math.random() * chordproVerses.length) + 1) % chordproVerses.length];
  const ch = chordproChoruses[Math.floor(Math.random() * chordproChoruses.length)];

  const stripChords = (line) => line.replace(/\[[^\]]+\]/g, '');

  // Verse 1
  text += v1.map(l => hasChords ? l : stripChords(l)).join('\n') + '\n\n';
  // Chorus
  text += ch.map(l => hasChords ? l : stripChords(l)).join('\n') + '\n\n';
  // Verse 2
  text += v2.map(l => hasChords ? l : stripChords(l)).join('\n');

  return text;
}

export async function seedRandomData(client, count = 80) {
  console.log(`[random-seeder] Initializing randomized database seeding (target: ${count} songs)...`);

  // 1. Fetch available subcategories from the DB
  const categoriesRes = await client.query(`
    SELECT id, name, slug, parent_id 
    FROM public.categories
  `);
  
  const allCategories = categoriesRes.rows;
  
  // Group categories by parent slug so we can select them logically
  const parentMap = new Map();
  allCategories.forEach(cat => {
    if (cat.parent_id === null) {
      parentMap.set(cat.id, cat.slug);
    }
  });

  const categoriesByParentSlug = {
    languages: [],
    'the-elements': [],
    'medicine-healing': [],
    'lineage-tradition': [],
    nature: [],
    'spiritual-concepts': []
  };

  allCategories.forEach(cat => {
    if (cat.parent_id !== null) {
      const parentSlug = parentMap.get(cat.parent_id);
      if (categoriesByParentSlug[parentSlug]) {
        categoriesByParentSlug[parentSlug].push(cat);
      }
    }
  });

  console.log(`[random-seeder] Loaded taxonomy groups from DB:`);
  Object.keys(categoriesByParentSlug).forEach(slug => {
    console.log(`  - ${slug}: ${categoriesByParentSlug[slug].length} subcategories`);
  });

  // 2. Generate Random Compositions & Song Versions
  console.log(`[random-seeder] Inserting ${count} compositions...`);
  
  const generatedSongs = [];

  for (let i = 0; i < count; i++) {
    const title = generateTitle();
    const artist = authors[Math.floor(Math.random() * authors.length)];
    const ownerId = userIds[Math.floor(Math.random() * userIds.length)];
    const isPublic = Math.random() > 0.15; // 85% public, 15% draft
    
    // Insert composition
    const compRes = await client.query(`
      INSERT INTO public.compositions (title, original_author, is_public, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [title, artist, isPublic, ownerId]);
    
    const compId = compRes.rows[0].id;

    // Generate version details
    const key = ['Am', 'Em', 'C', 'G', 'D', 'Dm', 'F', 'A', 'E', null][Math.floor(Math.random() * 10)];
    const capo = [0, 1, 2, 3, 4][Math.floor(Math.random() * 5)];
    const tuning = ['Standard', 'Half-Step Down', 'Drop D', 'DADGAD', 'Standard'][Math.floor(Math.random() * 5)];
    const hasChords = Math.random() > 0.2; // 80% have chords
    
    const content = generateChordPro(title, artist, key, hasChords);

    // Media Links
    const hasYoutube = Math.random() > 0.6;
    const hasSpotify = Math.random() > 0.8;
    const hasSoundcloud = Math.random() > 0.8;

    const youtubeUrl = hasYoutube ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null;
    const spotifyUrl = hasSpotify ? 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg' : null;
    const soundcloudUrl = hasSoundcloud ? 'https://soundcloud.com/octobersveryown/drake-back-to-back' : null;
    const hasMelody = hasYoutube || hasSpotify || hasSoundcloud || Math.random() > 0.9;

    const versionRes = await client.query(`
      INSERT INTO public.song_versions (
        composition_id, version_name, content_chordpro, key, capo, tuning, 
        contributor_id, youtube_url, spotify_url, soundcloud_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [compId, 'Standard', content, key, capo, tuning, ownerId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', youtubeUrl, spotifyUrl, soundcloudUrl]);

    const versionId = versionRes.rows[0].id;

    // Update metadata flags on the composition
    await client.query(`
      UPDATE public.compositions
      SET has_chords = $1, has_melody = $2
      WHERE id = $3
    `, [hasChords, hasMelody, compId]);

    // Map Categories
    const mappings = [];
    
    // Choose 1 language (required/highly useful)
    if (categoriesByParentSlug.languages.length > 0) {
      const lang = categoriesByParentSlug.languages[Math.floor(Math.random() * categoriesByParentSlug.languages.length)];
      mappings.push(lang.id);
    }
    
    // Elements (0-2 elements)
    if (categoriesByParentSlug['the-elements'].length > 0) {
      const numElements = Math.floor(Math.random() * 3); // 0, 1, 2
      const shuffled = [...categoriesByParentSlug['the-elements']].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numElements; j++) {
        mappings.push(shuffled[j].id);
      }
    }

    // Medicine & Healing (0-2)
    if (categoriesByParentSlug['medicine-healing'].length > 0 && Math.random() > 0.3) {
      const med = categoriesByParentSlug['medicine-healing'][Math.floor(Math.random() * categoriesByParentSlug['medicine-healing'].length)];
      mappings.push(med.id);
    }

    // Lineage & Tradition (0-1)
    if (categoriesByParentSlug['lineage-tradition'].length > 0 && Math.random() > 0.5) {
      const lin = categoriesByParentSlug['lineage-tradition'][Math.floor(Math.random() * categoriesByParentSlug['lineage-tradition'].length)];
      mappings.push(lin.id);
    }

    // Insert Category mappings
    for (const catId of mappings) {
      await client.query(`
        INSERT INTO public.song_category_map (song_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [compId, catId]);
    }

    generatedSongs.push({
      compId,
      versionId,
      title,
      isPublic
    });
  }

  // 3. Generate Random Playlists (Setlists)
  console.log('[random-seeder] Seeding 5 randomized playlists for the Member user...');
  const memberId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
  
  const playlists = [
    { title: 'Forest Sweat Lodge', desc: 'Powerful songs for high heat and deep clearing.', public: true },
    { title: 'Morning Hearth', desc: 'Gentle opening songs for morning meditation.', public: true },
    { title: 'My Private Practice', desc: 'Songs I am practicing and learning right now.', public: false },
    { title: 'Full Moon Setlist', desc: 'Celebratory songs with rich melodies.', public: false },
    { title: 'Guitar Circle Favorites', desc: 'Chords-heavy songs for the circle to jam.', public: false }
  ];

  for (let i = 0; i < playlists.length; i++) {
    const pl = playlists[i];
    const plId = `bbbbbbbb-000${i + 1}-4000-b000-00000000000${i + 1}`;
    
    await client.query(`
      INSERT INTO public.setlists (id, owner_id, title, description, is_public)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
    `, [plId, memberId, pl.title, pl.desc, pl.public]);

    // Select 5-12 random song versions to add to this playlist
    const numSongs = 5 + Math.floor(Math.random() * 8);
    const shuffledSongs = [...generatedSongs].sort(() => 0.5 - Math.random());
    
    for (let order = 1; order <= Math.min(numSongs, shuffledSongs.length); order++) {
      const song = shuffledSongs[order - 1];
      await client.query(`
        INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [plId, song.versionId, order]);
    }
  }

  console.log(`[random-seeder] Programmatic randomized seeding successfully completed! Seeded ${count} songs and 5 playlists.`);
}
