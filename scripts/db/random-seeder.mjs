/**
 * Sacred Fire Songs – programmatic test-data seeder.
 *
 * Executed by scripts/db/setup-test-db.mjs after the fixed test accounts
 * (supabase/seeds/01_auth_users.sql + 02_profiles.sql) have been loaded.
 * Everything runs database-side in one PL/pgSQL block, so seeding 1000 songs
 * takes well under a second.
 *
 * The generated data deliberately covers every song situation exercised by the
 * unit tests (testing/unit/tests) and the Playwright suite
 * (e2e/tests). The catalogue of those situations lives in
 * docs/testing/song.feature – keep the two in sync.
 *
 * Two layers:
 *   1. ANCHOR_SONGS  – deterministic songs, one per tested shape. Always seeded,
 *                      newest first so "the first card on /songs" is stable.
 *   2. Random songs  – fill up to `count` with randomized titles, authors,
 *                      ChordPro templates, media, tags, versions and recordings.
 */

const USERS = {
  admin: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  expert: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', // "musician" role key in e2e/fixtures/roles.ts
  member: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  gatekeeper: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
};

// Media URLs the media-player / recording specs expect on the anchor song.
const DANZA_MEDIA = {
  youtube: 'https://www.youtube.com/watch?v=dbbZGLR_e20',
  spotify: 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH',
  soundcloud: 'https://soundcloud.com/user-778401370/la-curandera',
};

const ABC_MELODY = `X:1
T:Canto Sem Fim
M:4/4
L:1/8
K:G
G2 B2 d2 B2 | A2 c2 e2 c2 | G4 z4 |]`;

/**
 * Deterministic songs. Field reference:
 *  minutes_ago  – created_at = now() - minutes_ago (0 = newest = first card on /songs)
 *  owner        – key of USERS or null (song without owner)
 *  content      – ChordPro body; null together with no_version=true seeds a
 *                 composition without any song_versions row
 *  has_chords   – explicit flag (chords-over-lyrics is detected by the app's
 *                 heuristic, not by the `[A-G]` regex, so we set it here)
 *  versions     – extra song_versions rows
 *  recordings   – [{ user, name, ext, count }] private rehearsal recordings
 *  tags         – category slugs (ignored when the slug does not exist)
 *  favorites    – users whose "My Favorites" playlist contains the song
 *  views        – users with a "recently viewed" row for the song
 */
const ANCHOR_SONGS = [
  {
    // First card on /songs for everyone: public, chords, all three media,
    // zero recordings → the member recording flow ends with a pill count of 1.
    title: 'Morning Sunrise', author: 'Shimshai', is_public: true, owner: 'expert', minutes_ago: 0,
    key: 'C', capo: 2, tuning: 'Standard',
    youtube: 'https://www.youtube.com/watch?v=dbbZGLR_e20',
    spotify: 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH',
    soundcloud: 'https://soundcloud.com/user-778401370/la-curandera',
    has_chords: true,
    content: `{title: Morning Sunrise}
{artist: Shimshai}
{key: C}
{Capo: 2}
[C]Morning sun [G]rising high
[Am]Over the [F]mountain top
[Em]And there is [G]light

{subtitle: Another song}`,
    tags: ['english', 'sun', 'gratitude'], recordings: [], favorites: ['admin'], views: ['member'],
  },
  {
    // Mocked by media-player.spec.ts and recording.spec.ts; five member takes.
    title: 'Danza del Cielo Curandero', author: 'Herbert Quinteros', is_public: true, owner: 'member', minutes_ago: 1,
    key: 'E', capo: 3, tuning: 'Standard', ...DANZA_MEDIA, has_chords: true,
    content: `{title: Danza del Cielo Curandero}
{artist: Herbert Quinteros}
{key: E}
{c: Canto para abrir el fuego}

[E]Danza del cielo [A]curandero
[B]Baila con el [E]viento entero
[E]Luna, luna, [A]luna llena
[B]Brilla en la [E]noche entera`,
    tags: ['spanish', 'fire', 'healing-limpieza'],
    recordings: [{ user: 'member', name: 'Rehearsal Take', ext: 'webm', count: 5 }],
    favorites: ['member'], views: ['member', 'admin'],
  },
  {
    // Chords-over-lyrics (testing/unit/tests/DownToTheRiver-chordsOverLyrics.txt): page markers, curly apostrophe.
    title: 'Down to the River', author: 'Traditional (Spiritual)', is_public: true, owner: 'admin', minutes_ago: 2,
    key: 'G', capo: 0, tuning: 'Standard', youtube: 'https://www.youtube.com/watch?v=6R7pxNzEAaM', has_chords: true,
    content: `{title: Down to the River}
{artist: Traditional (Spiritual)}

              G
As I went down in the river to pray
D                      G
Studying about that good old way
                     D      G
And who shall wear the starry crown

Page 1/2

   D         G
O sisters, let’s go down
Let’s go down, come on down
       D                G
O sisters, let’s go down, don’t you wait
Down in the river to pray

Page 2/2

And who shall wear the robe and crown`,
    tags: ['english', 'water', 'traditional'],
    recordings: [{ user: 'admin', name: 'First Take', ext: 'webm', count: 1 }], favorites: [], views: ['admin'],
  },
  {
    // Chords-over-lyrics with complex chords and Italian accents (DonneRiccheChordsOverLyrics.txt); two artists joined by "&".
    title: 'Donne Ricche', author: 'Nico Pérez & Fiona Helmer', is_public: true, owner: null, minutes_ago: 3,
    key: 'Gb', capo: 0, tuning: 'Half-Step Down', has_chords: true,
    content: `{title: Donne Ricche}
{artist: Nico Pérez & Fiona Helmer}
{key: Gb}

Gbmaj7
Mia nonna quando è morta
Db                Eb
Non mi ha lasciato niente
Gbmaj7  Dbmaj7  Ebmaj7
Andrè, Raffaè, cantate con me
       Bbm        Fm
Comprami- un vestito nuovo
       Ab
Che del cu-lo non ne ho più

Page 1/2`,
    tags: ['italian', 'love-heart'], recordings: [], favorites: [], views: [],
  },
  {
    // Accented title + accent twin of "Aguita de la Vida"; two versions; .wav recording.
    title: 'Agüita que Vienes', author: 'Traditional', is_public: true, owner: 'expert', minutes_ago: 4,
    key: 'Bm', capo: 0, tuning: 'Standard', has_chords: true,
    content: `{title: Agüita que Vienes}
{artist: Traditional}
{key: Bm}

[Bm]Agüitay, [A]agüita
[G]Agüita que [F#m]vienes
[Bm]Del cielo a la [A]tierra
[G]Lavando mis [Bm]penas`,
    versions: [{
      name: 'Temazcal version', key: 'Am', capo: 2, tuning: 'Standard',
      content: `{title: Agüita que Vienes}
{artist: Traditional}
{key: Am}
{capo: 2}
{ci: Temazcal version – slower, no chorus}

[Am]Agüitay, [G]agüita
[F]Agüita que [Em]vienes`,
    }],
    tags: ['spanish', 'water', 'plantas', 'temazcal'],
    recordings: [{ user: 'member', name: 'Slow practice', ext: 'wav', count: 1 }],
    favorites: ['member'], views: ['member'],
  },
  {
    title: 'Aguita de la Vida', author: 'Danit', is_public: true, owner: 'member', minutes_ago: 5,
    key: 'Em', capo: 0, tuning: 'Standard', spotify: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', has_chords: true,
    content: `{title: Aguita de la Vida}
{artist: Danit}
{key: Em}

[Em]Aguita de la [C]vida
[G]Lava mi co[D]razón
[Em]Aguita de la [C]vida
[G]Dame tu ben[D]dición`,
    tags: ['spanish', 'water'], recordings: [], favorites: ['member'], views: ['member'],
  },
  {
    // Chorus sections, comment directives and a {tag:} directive (docs/design/test-cases.md).
    title: 'Pachamama', author: 'Medicine Family', is_public: true, owner: 'admin', minutes_ago: 6,
    key: 'G', capo: 0, tuning: 'Standard', youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', has_chords: true,
    content: `{title: Pachamama}
{artist: Medicine Family}
{key: G}
{ci: Temazcal version}

{soc}
[G]Pachamama, [C]Pachamama
[D]Madre tierra, [G]te canto
{eoc}

[Em]Agua, [C]fuego, [G]tierra y [D]viento
[Em]Cuatro [C]fuerzas en mi [G]cuerpo

{c: Repetir el coro tres veces}
{tag: Santa Maria}`,
    tags: ['spanish', 'earth', 'santa-maria'],
    recordings: [{ user: 'member', name: 'Full run-through', ext: 'webm', count: 2 }], favorites: ['admin'], views: ['member'],
  },
  {
    // Accent-insensitive search target ("Espiritu" must find it).
    title: 'Espíritu del agua', author: 'Traditional', is_public: true, owner: 'expert', minutes_ago: 7,
    key: 'Am', capo: 0, tuning: 'Standard', has_chords: true,
    content: `{title: Espíritu del agua}
{artist: Traditional}
{key: Am}

[Am]Espíritu del [G]agua
[F]Límpiame el co[E]razón
[Am]Espíritu del [G]agua
[F]Llévate mi do[E]lor`,
    tags: ['spanish', 'water', 'healing-limpieza'], recordings: [], favorites: [], views: [],
  },
  {
    // Lyrics only: no chords, no media → has_chords=false, has_melody=false.
    title: 'Grandmother Earth', author: 'Traditional', is_public: true, owner: 'member', minutes_ago: 8,
    key: 'Am', capo: 0, tuning: 'Standard', has_chords: false,
    content: `{title: Grandmother Earth}
{artist: Traditional}

Grandmother Earth, I feel you under my feet
Grandmother Earth, I hear your heartbeat
Grandmother Earth, carry me home
Grandmother Earth, I am never alone`,
    tags: ['english', 'earth'], recordings: [], favorites: [], views: ['member'],
  },
  {
    // Minimal content (chordUtils.test.ts); title contains the perf-search term "test".
    title: 'Test Song', author: 'Test Author', is_public: true, owner: 'admin', minutes_ago: 9,
    key: 'Am', capo: 0, tuning: 'Standard', has_chords: true,
    content: `{title: Test Song}
[Am]Hello [G]World`,
    tags: ['english'], recordings: [], favorites: [], views: [],
  },
  {
    // Short directive aliases {t:} {a:} {k:} plus {capo:} (chordProParsing.test.ts "Test Key Capo").
    title: 'Test Key Capo', author: 'Tester', is_public: true, owner: null, minutes_ago: 10,
    key: 'Em', capo: 3, tuning: 'Standard', has_chords: true,
    content: `{t: Test Key Capo}
{a: Tester}
{k: Em}
{capo: 3}
[Em]Testing [G]Key and Capo`,
    tags: [], recordings: [], favorites: [], views: [],
  },
  {
    // Portuguese lyrics + ABC melody notation and no media → has_melody=true via notation.
    title: 'Canto Sem Fim', author: 'Santo Daime', is_public: true, owner: 'member', minutes_ago: 11,
    key: 'G', capo: 0, tuning: 'Standard', melody_notation: ABC_MELODY, has_chords: true,
    content: `{title: Canto Sem Fim}
{artist: Santo Daime}
{key: G}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar`,
    tags: ['portuguese', 'santo-daime', 'plegarias'], recordings: [], favorites: ['expert'], views: [],
  },
  {
    // Private draft; author written in lower case (artist normalisation dedupes with "Traditional").
    title: 'Eu sou Santa Maria', author: 'traditional', is_public: false, owner: 'member', minutes_ago: 12,
    key: 'D', capo: 0, tuning: 'Standard', has_chords: true,
    content: `{title: Eu sou Santa Maria}
{author: traditional}
{key: D}

[D]Eu sou Santa [A]Maria
[G]Eu sou a [D]luz do dia`,
    tags: ['portuguese', 'santa-maria'], recordings: [], favorites: [], views: ['member'],
  },
  {
    // Composition without any song_versions row (queries.test.ts: songKey null, content '').
    title: 'Luz Divina', author: '', is_public: true, owner: 'admin', minutes_ago: 13,
    no_version: true, content: null, has_chords: false,
    tags: ['spanish'], recordings: [], favorites: [], views: [],
  },
  {
    // Version with empty content.
    title: 'Silent Prayer', author: 'Traditional', is_public: true, owner: 'expert', minutes_ago: 14,
    key: null, capo: 0, tuning: 'Standard', has_chords: false, content: '',
    tags: ['plegarias'], recordings: [], favorites: [], views: [],
  },
  {
    // Long title with emoji and apostrophe, four artists with every separator, gatekeeper owner, long body.
    title: "Grandmother's Song of the Thousand Rivers That Flow Together Toward the Ocean of Forgiveness 🌊",
    author: 'Ayla Nereo, Danit / Shimshai and Cari El', is_public: true, owner: 'gatekeeper', minutes_ago: 15,
    key: 'D', capo: 1, tuning: 'DADGAD', ...DANZA_MEDIA, has_chords: true,
    content: `{title: Grandmother's Song of the Thousand Rivers That Flow Together Toward the Ocean of Forgiveness 🌊}
{artist: Ayla Nereo, Danit / Shimshai and Cari El}
{key: D}
{capo: 1}

` + Array.from({ length: 30 }, (_, i) => `[D]River number ${i + 1} is [G]flowing to the [A]sea
[Bm]Carry my [G]sorrow, [A]set my spirit [D]free`).join('\n\n'),
    tags: ['english', 'water', 'love-heart', 'women'],
    recordings: [{ user: 'gatekeeper', name: 'Vocal guide', ext: 'webm', count: 1 }], favorites: ['member'], views: [],
  },
  {
    // Slash chords and sharps, Nahuatl language tag, no owner.
    title: 'Inan Tonanzin', author: 'Traditional (Nahuatl)', is_public: true, owner: null, minutes_ago: 16,
    key: 'D', capo: 0, tuning: 'Standard', has_chords: true,
    content: `{title: Inan Tonanzin}
{artist: Traditional (Nahuatl)}
{key: D}

[D]Inan [D/F#]Tonanzin, [G]madre de la [C#m7]tierra
[F#m]Inan [Bm]Tonanzin, [A]tlazohcamati`,
    tags: ['nahuatl', 'earth', 'women'], recordings: [], favorites: [], views: [],
  },
  {
    // Private, no chords but YouTube → has_chords=false, has_melody=true; author with doubled space.
    title: 'Wakan Tanka', author: 'Herbert  Quinteros', is_public: false, owner: 'admin', minutes_ago: 17,
    key: null, capo: 0, tuning: 'Standard', youtube: 'https://www.youtube.com/watch?v=5qap5aO4i9A', has_chords: false,
    content: `{title: Wakan Tanka}
{artist: Herbert  Quinteros}

Wakan Tanka, tunkashila
Wakan Tanka, unshimala ye`,
    tags: ['lakota', 'plegarias'], recordings: [{ user: 'admin', name: 'Late Night run', ext: 'webm', count: 3 }], favorites: [], views: ['admin'],
  },
  {
    // Spotify only (no mini-player source); lower-case author variant; many member takes.
    title: 'Mother I Feel You', author: 'shimshai', is_public: true, owner: 'member', minutes_ago: 18,
    key: 'C', capo: 0, tuning: 'Standard', spotify: 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', has_chords: true,
    content: `{title: Mother I Feel You}
{artist: shimshai}
{key: C}

[C]Mother I feel you [F]under my feet
[G]Mother I hear your [C]heartbeat`,
    tags: ['english', 'earth', 'love-heart'],
    recordings: [{ user: 'member', name: 'Practice Session', ext: 'webm', count: 12 }], favorites: [], views: ['member'],
  },
  {
    // SoundCloud only; recordings from two different users on the same version.
    title: 'Hey Yamayo', author: 'Curawaka', is_public: true, owner: 'expert', minutes_ago: 19,
    key: 'Dm', capo: 0, tuning: 'Drop D', soundcloud: 'https://soundcloud.com/curawaka/hey-yamayo', has_chords: true,
    content: `{title: Hey Yamayo}
{artist: Curawaka}
{key: Dm}

[Dm]Hey yamayo, [C]hey yamayo
[Bb]Hey yama [A]yama yo`,
    tags: ['vocalization', 'water'],
    recordings: [
      { user: 'admin', name: 'Tempo check', ext: 'webm', count: 2 },
      { user: 'member', name: 'Acoustic draft', ext: 'wav', count: 1 },
    ],
    favorites: ['admin'], views: ['admin', 'member'],
  },
];

/**
 * ChordPro templates for random songs. Placeholders: {{title}} {{artist_line}}
 * {{key_line}} {{capo_line}} {{key}}. `weight` is the relative pick probability.
 */
const CONTENT_TEMPLATES = [
  { id: 'inline-spanish', weight: 40, has_chords: true, body: `{title: {{title}}}{{artist_line}}{{key_line}}{{capo_line}}

[Am]Luna, luna, [C]luna llena
[G]Brilla en la [Am]noche entera
[Am]Abuelo fuego, [C]abuela tierra
[G]Canto con el [Am]corazón` },
  { id: 'inline-sections', weight: 12, has_chords: true, body: `{title: {{title}}}{{artist_line}}{{key_line}}{{capo_line}}
{c: Canto para el círculo}

{soc}
[G]Vuela, vuela [C]colibrí
[D]Lleva mi canto [G]hasta ti
{eoc}

[Em]Agua que [C]limpia, [G]fuego que [D]cura
[Em]Viento que [C]lleva la [G]noche os[D]cura

{ci: Repetir dos veces}` },
  { id: 'chords-over-lyrics', weight: 14, has_chords: true, body: `{title: {{title}}}{{artist_line}}

   G                C
I am the river and the river is me
D                  G
Flowing to the sea, flowing to the sea

Page 1/1

   Em        C
O sisters, let’s go down
       D                G
Don’t you wait, down to the river we go` },
  { id: 'complex-chords', weight: 8, has_chords: true, body: `{title: {{title}}}{{artist_line}}{{key_line}}

[Gbmaj7]Noite de [Dbmaj7]lua cheia
[Ebmaj7]Canta o [Bbm]coração
[F#m7]Sobe a [C#m]montanha
[D/F#]Desce ao [Bbm]mar` },
  { id: 'lyrics-only', weight: 14, has_chords: false, body: `{title: {{title}}}{{artist_line}}

Abuela luna, abuelo sol
Cantamos juntos esta canción
Agua que limpia, fuego que cura
Tierra que sostiene, viento que murmura` },
  { id: 'portuguese', weight: 8, has_chords: true, body: `{title: {{title}}}{{artist_line}}{{key_line}}

[G]Eu canto a canção [C]que não tem fim
[D]Coração aberto [G]dentro de mim
[G]Estou firme no [C]meu lugar
[D]Com a força da [G]mãe pra me guiar` },
  { id: 'english-minimal', weight: 4, has_chords: true, body: `{title: {{title}}}{{artist_line}}
[Am]Hello [G]World` },
];

const PLAYLISTS = [
  // ids match e2e/tests/public-playlist-curation.spec.ts and the former 08_playlists.sql seed
  { id: 'aaaaaaaa-0001-4000-a000-000000000001', owner: 'member', title: 'Water Ceremony', description: 'Songs for water blessings and river ceremonies.', is_public: true, tag: 'water', count: 8 },
  { id: 'aaaaaaaa-0002-4000-a000-000000000002', owner: 'admin', title: 'Admin Fire Circle', description: 'Public playlist curated by the admin.', is_public: true, tag: 'fire', count: 6 },
  { id: 'aaaaaaaa-0003-4000-a000-000000000003', owner: 'member', title: 'My Healing Practice', description: 'Private practice list.', is_public: false, tag: null, count: 7 },
  { id: 'aaaaaaaa-0004-4000-a000-000000000004', owner: 'member', title: 'New Moon Ceremony', description: 'Private setlist for the next new moon.', is_public: false, tag: 'moon', count: 5 },
  { id: 'aaaaaaaa-0005-4000-a000-000000000005', owner: 'member', title: 'Work in Progress', description: 'Empty playlist, nothing added yet.', is_public: false, tag: null, count: 0 },
  { id: 'aaaaaaaa-0006-4000-a000-000000000006', owner: 'expert', title: 'Fire Songs', description: 'A collection of songs for the sacred fire circle.', is_public: true, tag: 'fire', count: 10 },
  { id: 'aaaaaaaa-0007-4000-a000-000000000007', owner: 'gatekeeper', title: 'Gatekeeper Circle', description: 'Curated by the gatekeeper.', is_public: true, tag: null, count: 5 },
];

// "My Favorites" playlists (smart playlist title, see lib/playlists/smartPlaylists.ts)
const EXTRA_FAVORITES = { member: 5, admin: 3, expert: 2, gatekeeper: 0 };

export async function seedRandomData(client, count = 80) {
  const anchors = ANCHOR_SONGS.length;
  const randomCount = Math.max(0, count - anchors);
  console.log(`[random-seeder] Seeding ${anchors} anchor songs + ${randomCount} random songs (target: ${count})...`);

  const sql = String.raw`
-- ---------------------------------------------------------------------------
-- Temporary helpers (pg_temp vanishes with the session)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.sfs_slugify(name text) RETURNS text LANGUAGE sql IMMUTABLE AS $f$
  SELECT trim(both '-' FROM regexp_replace(
    translate(lower(name), 'áàâäãåéèêëíìîïóòôöõúùûüñçýÿ', 'aaaaaaeeeeiiiiooooouuuuncyy'),
    '[^a-z0-9]+', '-', 'g'));
$f$;

-- Mirrors lib/songs/artistUtils.ts: parseArtists + ensureArtistCategoryIds
CREATE OR REPLACE FUNCTION pg_temp.sfs_link_artists(p_comp uuid, p_author text) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  parent uuid;
  raw text;
  nm text;
  seen text[] := '{}';
  cat uuid;
BEGIN
  IF p_author IS NULL OR btrim(p_author) = '' THEN RETURN; END IF;
  SELECT id INTO parent FROM public.categories WHERE slug = 'artists';
  IF parent IS NULL THEN
    INSERT INTO public.categories (name, slug, emoji, parent_id) VALUES ('Artists', 'artists', '👤', NULL) RETURNING id INTO parent;
  END IF;
  FOREACH raw IN ARRAY regexp_split_to_array(p_author, '[,/]|(\s+&(?:amp;)?\s+)|(\s+and\s+)', 'i') LOOP
    nm := btrim(raw);
    IF nm = '' OR lower(nm) = ANY(seen) THEN CONTINUE; END IF;
    seen := array_append(seen, lower(nm));
    SELECT id INTO cat FROM public.categories WHERE parent_id = parent AND lower(name) = lower(nm) LIMIT 1;
    IF cat IS NULL THEN
      INSERT INTO public.categories (name, slug, emoji, parent_id)
      VALUES (nm, 'artist-' || coalesce(nullif(pg_temp.sfs_slugify(nm), ''), replace(gen_random_uuid()::text, '-', '')), '👤', parent)
      ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug -- no-op update so RETURNING yields the existing row
      RETURNING id INTO cat;
    END IF;
    INSERT INTO public.song_category_map (song_id, category_id) VALUES (p_comp, cat) ON CONFLICT DO NOTHING;
  END LOOP;
END $f$;

CREATE OR REPLACE FUNCTION pg_temp.sfs_add_recordings(p_version uuid, p_user uuid, p_name text, p_ext text, p_count int, p_numbered boolean) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  idx int;
  rec_uuid uuid;
  nm text;
BEGIN
  IF p_version IS NULL OR p_count IS NULL OR p_count < 1 THEN RETURN; END IF;
  FOR idx IN 1..p_count LOOP
    rec_uuid := gen_random_uuid();
    nm := CASE WHEN p_numbered AND p_count > 1 THEN p_name || ' ' || idx ELSE p_name END;
    INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, position, file_size_bytes, duration_seconds, created_at)
    VALUES (
      rec_uuid, p_user, p_version, nm,
      p_user || '/' || p_version || '/' || rec_uuid || '.' || p_ext,
      idx,
      200000 + floor(random() * 3800000)::bigint,
      25 + floor(random() * 170)::int,
      now() - (random() * interval '7 days') - (idx * interval '1 hour')
    );
  END LOOP;
END $f$;

CREATE OR REPLACE FUNCTION pg_temp.sfs_add_tags(p_comp uuid, p_slugs text[]) RETURNS void LANGUAGE sql AS $f$
  INSERT INTO public.song_category_map (song_id, category_id)
  SELECT p_comp, c.id FROM public.categories c WHERE c.slug = ANY(p_slugs)
  ON CONFLICT DO NOTHING;
$f$;

CREATE OR REPLACE FUNCTION pg_temp.sfs_favorite(p_user uuid, p_comp uuid) RETURNS void LANGUAGE plpgsql AS $f$
DECLARE
  fav uuid;
  ver uuid;
BEGIN
  SELECT id INTO fav FROM public.setlists WHERE owner_id = p_user AND title = 'My Favorites' LIMIT 1;
  IF fav IS NULL THEN
    INSERT INTO public.setlists (owner_id, title, description, is_public) VALUES (p_user, 'My Favorites', 'Songs I love', false) RETURNING id INTO fav;
  END IF;
  SELECT id INTO ver FROM public.song_versions WHERE composition_id = p_comp ORDER BY created_at LIMIT 1;
  IF ver IS NULL THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.setlist_items WHERE setlist_id = fav AND song_version_id = ver) THEN
    INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index)
    SELECT fav, ver, coalesce(max(order_index), 0) + 1 FROM public.setlist_items WHERE setlist_id = fav;
  END IF;
END $f$;

CREATE OR REPLACE FUNCTION pg_temp.sfs_view(p_user uuid, p_comp uuid) RETURNS void LANGUAGE plpgsql AS $f$
BEGIN
  IF to_regclass('public.song_views') IS NULL THEN RETURN; END IF;
  INSERT INTO public.song_views (user_id, song_id, viewed_at)
  VALUES (p_user, p_comp, now() - (random() * interval '10 days'))
  ON CONFLICT (user_id, song_id) DO UPDATE SET viewed_at = EXCLUDED.viewed_at;
END $f$;

-- ---------------------------------------------------------------------------
-- Main seeding block
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    users jsonb := $json$${JSON.stringify(USERS)}$json$::jsonb;
    anchors jsonb := $json$${JSON.stringify(ANCHOR_SONGS)}$json$::jsonb;
    templates jsonb := $json$${JSON.stringify(CONTENT_TEMPLATES)}$json$::jsonb;
    playlists jsonb := $json$${JSON.stringify(PLAYLISTS)}$json$::jsonb;
    extra_favs jsonb := $json$${JSON.stringify(EXTRA_FAVORITES)}$json$::jsonb;
    random_count int := ${randomCount};

    admin_id uuid := (users->>'admin')::uuid;
    expert_id uuid := (users->>'expert')::uuid;
    member_id uuid := (users->>'member')::uuid;
    gatekeeper_id uuid := (users->>'gatekeeper')::uuid;

    -- Word lists for random titles / authors
    verbs text[] := ARRAY['Canto al', 'Danza del', 'Rezo al', 'Camino del', 'Luz de la', 'Fuerza de la', 'Cura de la', 'Llamado del', 'Voz del', 'Abuelo', 'Abuelita', 'Pájaro', 'Viento del', 'Espíritu de la', 'Sinfonía del', 'Latido de la', 'Ecos del', 'Guardián del', 'Song of the', 'Prayer for the', 'Hino da', 'Canção do'];
    nouns text[] := ARRAY['Selva', 'Luna', 'Tierra', 'Agua', 'Fuego', 'Estrella', 'Montaña', 'Sol', 'Vida', 'Medicina', 'Lluvia', 'Flor', 'Pachamama', 'Jaguar', 'Águila', 'Cóndor', 'Corazón', 'Piedra', 'Colibrí', 'Bosque', 'Cielo', 'River', 'Mountain', 'Floresta', 'Mar'];
    adjs text[] := ARRAY['Sagrado', 'Curandero', 'Cielo', 'Amor', 'Gratitud', 'Limpio', 'Brillante', 'Eterno', 'Puro', 'Viejo', 'Divino', 'Profundo', 'Cósmico', 'Universal', 'Ancestral', 'Verde', 'Sagrada', 'Bendita'];
    authors text[] := ARRAY['Nina', 'Alonso del Río', 'Traditional', 'Diego Palma', 'Shimshai', 'Cari El', 'Ayla Schafer', 'Herbert Quinteros', 'Traditional (Camino Rojo)', 'Santo Daime', 'Traditional (Umbanda)', 'Danit', 'Ayla Nereo', 'Peia', 'Curawaka', 'Dario Hampi Pakari', 'Nico Pérez', 'Fiona Helmer', 'Xavier Rudd', 'Alain Merens'];
    separators text[] := ARRAY[', ', ' / ', ' & ', ' and ', ' &amp; '];
    keys text[] := ARRAY['Am', 'Em', 'C', 'G', 'D', 'Dm', 'F', 'A', 'E', 'Bm', 'F#m', 'Gb', 'Bb', 'C#m', NULL];
    tunings text[] := ARRAY['Standard', 'Standard', 'Standard', 'Standard', 'Half-Step Down', 'Drop D', 'DADGAD'];
    youtube_urls text[] := ARRAY['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dbbZGLR_e20', 'https://youtu.be/6R7pxNzEAaM', 'https://www.youtube.com/watch?v=5qap5aO4i9A', 'https://www.youtube.com/watch?v=kXYiU_JCYtU'];
    spotify_urls text[] := ARRAY['https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg', 'https://open.spotify.com/track/2HZQQ8PriDD1z7tcvAU9KH', 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'];
    soundcloud_urls text[] := ARRAY['https://soundcloud.com/octobersveryown/drake-back-to-back', 'https://soundcloud.com/user-778401370/la-curandera', 'https://soundcloud.com/curawaka/hey-yamayo'];
    rec_names text[] := ARRAY['First Take', 'Practice Session', 'Late Night run', 'Slow practice', 'Full run-through', 'Tempo check', 'Acoustic draft', 'Vocal guide'];
    abc_melody text := $abc$X:1
T:Random Melody
M:3/4
L:1/8
K:D
A2 d2 f2 | e2 d2 B2 | A4 z2 |]$abc$;

    a record;
    t record;
    v record;
    r record;
    p record;
    fav_user text;
    total_weight int;
    pick int;
    acc int;
    tpl jsonb;
    comp_id uuid;
    version_id uuid;
    tag_ids uuid[];
    selected_tags uuid[];
    forced_tag uuid;
    num_tags int;
    rand_val float;
    title text;
    artist text;
    pl_owner uuid;
    is_public boolean;
    song_key text;
    capo int;
    tuning text;
    content text;
    artist_line text;
    key_line text;
    capo_line text;
    var_has_chords boolean;
    var_has_melody boolean;
    youtube_url text;
    spotify_url text;
    soundcloud_url text;
    melody text;
    created timestamptz;
    rec_count int;
    rec_user uuid;
    rec_ext text;
    num_pl_songs int;
    n_views int;
    u1 float;
    u2 float;
    rand_std_normal float;
    norm_val int;
    i int;
    j int;
    anchor_count int := 0;
BEGIN
    -- -----------------------------------------------------------------------
    -- Taxonomy fallback (only when the categories table is empty; normally the
    -- migrations have already created it and setup-test-db.mjs preserves it)
    -- -----------------------------------------------------------------------
    IF (SELECT count(*) FROM public.categories) = 0 THEN
        INSERT INTO public.categories (name, slug, emoji, icon_name) VALUES
            ('The Elements', 'the-elements', '🌀', 'Waves'),
            ('Nature', 'nature', '🌿', 'Leaf'),
            ('Languages', 'languages', '🗣️', 'MessageCircle'),
            ('Lineage & Tradition', 'lineage-tradition', '🌳', 'TreePine'),
            ('Medicine & Healing', 'medicine-healing', '🦅', 'FlaskConical'),
            ('Spiritual Concepts', 'spiritual-concepts', '✨', 'Sparkles'),
            ('Artists', 'artists', '👤', NULL);
        INSERT INTO public.categories (name, slug, emoji, parent_id)
        SELECT x.name, x.slug, x.emoji, par.id
        FROM (VALUES
            ('Water', 'water', '💧', 'the-elements'), ('Air', 'air', '🌬️', 'the-elements'), ('Fire', 'fire', '🔥', 'the-elements'), ('Earth', 'earth', '🌎', 'the-elements'),
            ('Animales', 'animales', '🐾', 'nature'), ('Bird', 'bird', '🦅', 'nature'), ('Plantas', 'plantas', '🍃', 'nature'), ('Moon', 'moon', '🌙', 'nature'), ('Sun', 'sun', '☀️', 'nature'), ('Mountain', 'mountain', '🏔️', 'nature'), ('Selva', 'selva', '🌳', 'nature'),
            ('Spanish', 'spanish', '🇪🇸', 'languages'), ('English', 'english', '🇬🇧', 'languages'), ('Quechua / Kichwa', 'quechua-kichwa', '🏔️', 'languages'), ('Portuguese', 'portuguese', '🇧🇷', 'languages'), ('Nahuatl', 'nahuatl', '🏹', 'languages'), ('Huni Kuin', 'huni-kuin', '🐍', 'languages'), ('Italian', 'italian', '🇮🇹', 'languages'), ('German', 'german', '🇩🇪', 'languages'),
            ('Lakota', 'lakota', '🪶', 'lineage-tradition'), ('Sacred Pipe', 'sacred-pipe', '💨', 'lineage-tradition'), ('Santo Daime', 'santo-daime', '🌟', 'lineage-tradition'), ('Temazcal', 'temazcal', '⛺', 'lineage-tradition'), ('Traditional', 'traditional', '📜', 'lineage-tradition'), ('Umbanda', 'umbanda', '🌊', 'lineage-tradition'),
            ('Ayahuasca', 'ayahuasca', '🍵', 'medicine-healing'), ('Healing / Limpieza', 'healing-limpieza', '🌿', 'medicine-healing'), ('Icaros', 'icaros', '🎶', 'medicine-healing'), ('Opening / Closing', 'opening-closing', '🔑', 'medicine-healing'), ('Peyote', 'peyote', '🌵', 'medicine-healing'), ('Protection', 'protection', '🛡️', 'medicine-healing'), ('Rapé', 'rape', '🌬️', 'medicine-healing'), ('San Pedro', 'san-pedro', '🌵', 'medicine-healing'), ('Santa Maria', 'santa-maria', '🌿', 'medicine-healing'), ('Tobacco', 'tobacco', '🍂', 'medicine-healing'),
            ('Gratitude', 'gratitude', '🙏', 'spiritual-concepts'), ('Love / Heart', 'love-heart', '💖', 'spiritual-concepts'), ('Plegarias', 'plegarias', '🕯️', 'spiritual-concepts'), ('Vocalization', 'vocalization', '🗣️', 'spiritual-concepts'), ('Women', 'women', '♀️', 'spiritual-concepts')
        ) AS x(name, slug, emoji, parent_slug)
        JOIN public.categories par ON par.slug = x.parent_slug
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    -- Non-artist subcategories used for random tagging
    SELECT array_agg(c.id) INTO tag_ids
    FROM public.categories c JOIN public.categories par ON c.parent_id = par.id
    WHERE par.slug <> 'artists';

    -- -----------------------------------------------------------------------
    -- 1. Anchor songs (deterministic)
    -- -----------------------------------------------------------------------
    FOR a IN SELECT value AS s FROM jsonb_array_elements(anchors) LOOP
        anchor_count := anchor_count + 1;
        pl_owner := CASE a.s->>'owner'
            WHEN 'admin' THEN admin_id WHEN 'expert' THEN expert_id
            WHEN 'member' THEN member_id WHEN 'gatekeeper' THEN gatekeeper_id ELSE NULL END;
        created := now() - ((a.s->>'minutes_ago')::int * interval '1 minute');
        youtube_url := a.s->>'youtube';
        spotify_url := a.s->>'spotify';
        soundcloud_url := a.s->>'soundcloud';
        melody := a.s->>'melody_notation';
        var_has_chords := coalesce((a.s->>'has_chords')::boolean, false);
        var_has_melody := youtube_url IS NOT NULL OR spotify_url IS NOT NULL OR soundcloud_url IS NOT NULL OR melody IS NOT NULL;

        INSERT INTO public.compositions (title, original_author, is_public, owner_id, has_chords, has_melody, created_at)
        VALUES (a.s->>'title', a.s->>'author', (a.s->>'is_public')::boolean, pl_owner, var_has_chords, var_has_melody, created)
        RETURNING id INTO comp_id;

        version_id := NULL;
        IF NOT coalesce((a.s->>'no_version')::boolean, false) THEN
            INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at)
            VALUES (comp_id, 'Standard', coalesce(a.s->>'content', ''), melody, a.s->>'key', coalesce((a.s->>'capo')::int, 0), coalesce(a.s->>'tuning', 'Standard'),
                    coalesce(pl_owner, member_id), youtube_url, spotify_url, soundcloud_url, created)
            RETURNING id INTO version_id;

            FOR v IN SELECT value AS s FROM jsonb_array_elements(coalesce(a.s->'versions', '[]'::jsonb)) LOOP
                INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, key, capo, tuning, contributor_id, created_at)
                VALUES (comp_id, v.s->>'name', coalesce(v.s->>'content', ''), v.s->>'key', coalesce((v.s->>'capo')::int, 0), coalesce(v.s->>'tuning', 'Standard'),
                        coalesce(pl_owner, member_id), created + interval '1 minute');
            END LOOP;
        END IF;

        PERFORM pg_temp.sfs_add_tags(comp_id, ARRAY(SELECT jsonb_array_elements_text(coalesce(a.s->'tags', '[]'::jsonb))));
        PERFORM pg_temp.sfs_link_artists(comp_id, a.s->>'author');

        FOR r IN SELECT value AS s FROM jsonb_array_elements(coalesce(a.s->'recordings', '[]'::jsonb)) LOOP
            rec_user := CASE r.s->>'user' WHEN 'admin' THEN admin_id WHEN 'expert' THEN expert_id WHEN 'gatekeeper' THEN gatekeeper_id ELSE member_id END;
            PERFORM pg_temp.sfs_add_recordings(version_id, rec_user, r.s->>'name', coalesce(r.s->>'ext', 'webm'), (r.s->>'count')::int, true);
        END LOOP;

        FOR fav_user IN SELECT jsonb_array_elements_text(coalesce(a.s->'favorites', '[]'::jsonb)) LOOP
            PERFORM pg_temp.sfs_favorite((users->>fav_user)::uuid, comp_id);
        END LOOP;
        FOR fav_user IN SELECT jsonb_array_elements_text(coalesce(a.s->'views', '[]'::jsonb)) LOOP
            PERFORM pg_temp.sfs_view((users->>fav_user)::uuid, comp_id);
        END LOOP;
    END LOOP;

    -- -----------------------------------------------------------------------
    -- 2. Random songs
    -- -----------------------------------------------------------------------
    SELECT sum((value->>'weight')::int) INTO total_weight FROM jsonb_array_elements(templates);

    FOR i IN 1..random_count LOOP
        -- title
        title := verbs[1 + floor(random() * array_length(verbs, 1))] || ' ' || nouns[1 + floor(random() * array_length(nouns, 1))];
        IF random() > 0.4 THEN
            title := title || ' ' || adjs[1 + floor(random() * array_length(adjs, 1))];
        END IF;
        rand_val := random();
        IF rand_val < 0.03 THEN
            title := title || ' 🔥';
        ELSIF rand_val < 0.05 THEN
            title := 'Grandmother''s ' || title;
        ELSIF rand_val < 0.07 THEN
            title := title || ' (' || verbs[1 + floor(random() * array_length(verbs, 1))] || ' ' || nouns[1 + floor(random() * array_length(nouns, 1))] || ' version, as sung at the long night ceremony)';
        END IF;

        -- author: single / multi-artist / messy variant / empty / null
        rand_val := random();
        IF rand_val < 0.68 THEN
            artist := authors[1 + floor(random() * array_length(authors, 1))];
        ELSIF rand_val < 0.80 THEN
            artist := authors[1 + floor(random() * array_length(authors, 1))]
                   || separators[1 + floor(random() * array_length(separators, 1))]
                   || authors[1 + floor(random() * array_length(authors, 1))];
            IF random() < 0.3 THEN
                artist := artist || separators[1 + floor(random() * array_length(separators, 1))] || authors[1 + floor(random() * array_length(authors, 1))];
            END IF;
        ELSIF rand_val < 0.86 THEN
            artist := authors[1 + floor(random() * array_length(authors, 1))];
            CASE floor(random() * 3)::int
                WHEN 0 THEN artist := lower(artist);
                WHEN 1 THEN artist := replace(artist, ' ', '  ');
                ELSE artist := '  ' || artist || ' ';
            END CASE;
        ELSIF rand_val < 0.91 THEN
            artist := '';
        ELSE
            artist := NULL;
        END IF;

        -- owner
        rand_val := random();
        IF rand_val < 0.22 THEN pl_owner := admin_id;
        ELSIF rand_val < 0.45 THEN pl_owner := expert_id;
        ELSIF rand_val < 0.70 THEN pl_owner := member_id;
        ELSIF rand_val < 0.80 THEN pl_owner := gatekeeper_id;
        ELSE pl_owner := NULL;
        END IF;

        is_public := random() > 0.15;

        -- template (weighted)
        pick := 1 + floor(random() * total_weight)::int;
        acc := 0;
        tpl := NULL;
        FOR t IN SELECT value AS s FROM jsonb_array_elements(templates) LOOP
            acc := acc + (t.s->>'weight')::int;
            IF tpl IS NULL AND pick <= acc THEN tpl := t.s; END IF;
        END LOOP;

        -- metadata
        song_key := keys[1 + floor(random() * array_length(keys, 1))];
        capo := CASE WHEN random() < 0.6 THEN 0 ELSE 1 + floor(random() * 5)::int END;
        tuning := tunings[1 + floor(random() * array_length(tunings, 1))];
        youtube_url := CASE WHEN random() < 0.40 THEN youtube_urls[1 + floor(random() * array_length(youtube_urls, 1))] END;
        spotify_url := CASE WHEN random() < 0.20 THEN spotify_urls[1 + floor(random() * array_length(spotify_urls, 1))] END;
        soundcloud_url := CASE WHEN random() < 0.20 THEN soundcloud_urls[1 + floor(random() * array_length(soundcloud_urls, 1))] END;
        melody := CASE WHEN random() < 0.10 THEN abc_melody END;
        var_has_chords := (tpl->>'has_chords')::boolean;
        var_has_melody := youtube_url IS NOT NULL OR spotify_url IS NOT NULL OR soundcloud_url IS NOT NULL OR melody IS NOT NULL;
        created := now() - interval '2 hours' - (random() * interval '400 days');

        -- content
        artist_line := CASE WHEN artist IS NULL OR btrim(artist) = '' THEN '' ELSE chr(10) || '{artist: ' || artist || '}' END;
        key_line := CASE WHEN song_key IS NULL THEN '' ELSE chr(10) || '{key: ' || song_key || '}' END;
        capo_line := CASE WHEN capo > 0 AND random() < 0.5 THEN chr(10) || '{capo: ' || capo || '}' ELSE '' END;
        content := replace(replace(replace(replace(replace(tpl->>'body', '{{title}}', title), '{{artist_line}}', artist_line), '{{key_line}}', key_line), '{{capo_line}}', capo_line), '{{key}}', coalesce(song_key, 'Am'));

        INSERT INTO public.compositions (title, original_author, is_public, owner_id, has_chords, has_melody, created_at)
        VALUES (title, artist, is_public, pl_owner, var_has_chords, var_has_melody, created)
        RETURNING id INTO comp_id;

        INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, melody_notation, key, capo, tuning, contributor_id, youtube_url, spotify_url, soundcloud_url, created_at)
        VALUES (comp_id, 'Standard', content, melody, song_key, capo, tuning, coalesce(pl_owner, member_id), youtube_url, spotify_url, soundcloud_url, created)
        RETURNING id INTO version_id;

        -- second version for ~8% of songs
        IF random() < 0.08 THEN
            INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, key, capo, tuning, contributor_id, created_at)
            VALUES (comp_id, CASE WHEN random() < 0.5 THEN 'Live version' ELSE 'Capo version' END,
                    replace(content, '{title: ' || title || '}', '{title: ' || title || '}' || chr(10) || '{ci: alternative version}'),
                    keys[1 + floor(random() * (array_length(keys, 1) - 1))], 2, 'Standard', coalesce(pl_owner, member_id), created + interval '1 day');
        END IF;

        -- private recordings: 20% none, 30% one, 50% two to five; mostly member
        rand_val := random();
        IF rand_val < 0.50 THEN rec_count := 2 + floor(random() * 4);
        ELSIF rand_val < 0.80 THEN rec_count := 1;
        ELSE rec_count := 0;
        END IF;
        IF rec_count > 0 THEN
            rand_val := random();
            rec_user := CASE WHEN rand_val < 0.60 THEN member_id WHEN rand_val < 0.80 THEN admin_id WHEN rand_val < 0.92 THEN expert_id ELSE gatekeeper_id END;
            rec_ext := CASE WHEN random() < 0.85 THEN 'webm' ELSE 'wav' END;
            PERFORM pg_temp.sfs_add_recordings(version_id, rec_user,
                rec_names[1 + floor(random() * array_length(rec_names, 1))] || CASE WHEN rec_count > 1 THEN ' (Take' ELSE '' END,
                rec_ext, rec_count, false);
            IF rec_count > 1 THEN
                -- give the takes distinct names "(Take n)"
                UPDATE public.user_recordings SET recording_name = recording_name || ' ' || position || ')' WHERE song_version_id = version_id;
            END IF;
        END IF;

        -- tags: normal distribution around 3 (1..5), 5% without tags, every tag used at least once
        u1 := random(); IF u1 = 0 THEN u1 := 0.0001; END IF;
        u2 := random();
        rand_std_normal := sqrt(-2.0 * log(u1)) * sin(2.0 * pi() * u2);
        norm_val := round(3.0 + 1.0 * rand_std_normal);
        num_tags := greatest(1, least(5, norm_val));
        IF tag_ids IS NOT NULL AND i <= array_length(tag_ids, 1) THEN
            forced_tag := tag_ids[i];
            SELECT array_agg(id) INTO selected_tags FROM (
                SELECT id FROM unnest(tag_ids) AS id WHERE id <> forced_tag ORDER BY random() LIMIT (num_tags - 1)
            ) x;
            selected_tags := array_append(coalesce(selected_tags, '{}'), forced_tag);
        ELSIF random() < 0.05 THEN
            selected_tags := NULL;
        ELSE
            SELECT array_agg(id) INTO selected_tags FROM (
                SELECT id FROM unnest(tag_ids) AS id ORDER BY random() LIMIT num_tags
            ) x;
        END IF;
        IF selected_tags IS NOT NULL THEN
            FOR j IN 1..array_length(selected_tags, 1) LOOP
                INSERT INTO public.song_category_map (song_id, category_id) VALUES (comp_id, selected_tags[j]) ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
        PERFORM pg_temp.sfs_link_artists(comp_id, artist);
    END LOOP;

    -- -----------------------------------------------------------------------
    -- 3. Playlists (fixed ids used by the e2e specs)
    -- -----------------------------------------------------------------------
    FOR p IN SELECT value AS s FROM jsonb_array_elements(playlists) LOOP
        pl_owner := (users->>(p.s->>'owner'))::uuid;
        INSERT INTO public.setlists (id, owner_id, title, description, is_public, created_at)
        VALUES ((p.s->>'id')::uuid, pl_owner, p.s->>'title', p.s->>'description', (p.s->>'is_public')::boolean, now() - (random() * interval '30 days'))
        ON CONFLICT (id) DO NOTHING;
        num_pl_songs := (p.s->>'count')::int;
        IF num_pl_songs > 0 THEN
            INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index)
            SELECT (p.s->>'id')::uuid, z.id, row_number() OVER ()
            FROM (
                SELECT sv.id
                FROM (
                    SELECT DISTINCT ON (sv.composition_id) sv.id, sv.composition_id,
                           CASE WHEN p.s->>'tag' IS NOT NULL AND EXISTS (
                               SELECT 1 FROM public.song_category_map m JOIN public.categories cat ON cat.id = m.category_id
                               WHERE m.song_id = sv.composition_id AND cat.slug = p.s->>'tag') THEN 0 ELSE 1 END AS prio,
                           random() AS rnd
                    FROM public.song_versions sv
                    JOIN public.compositions c ON c.id = sv.composition_id
                    WHERE c.is_public OR c.owner_id = pl_owner
                    ORDER BY sv.composition_id, sv.created_at
                ) sv
                ORDER BY sv.prio, sv.rnd
                LIMIT num_pl_songs
            ) z;
        END IF;
    END LOOP;

    -- -----------------------------------------------------------------------
    -- 4. Extra favorites and recently viewed rows
    -- -----------------------------------------------------------------------
    FOR fav_user IN SELECT key FROM jsonb_each(extra_favs) LOOP
        FOR comp_id IN SELECT cc.id FROM public.compositions cc WHERE cc.is_public ORDER BY random() LIMIT (extra_favs->>fav_user)::int LOOP
            PERFORM pg_temp.sfs_favorite((users->>fav_user)::uuid, comp_id);
        END LOOP;
    END LOOP;
    FOR comp_id IN SELECT cc.id FROM public.compositions cc WHERE cc.is_public ORDER BY random() LIMIT 8 LOOP
        PERFORM pg_temp.sfs_view(member_id, comp_id);
    END LOOP;
    FOR comp_id IN SELECT cc.id FROM public.compositions cc ORDER BY random() LIMIT 3 LOOP
        PERFORM pg_temp.sfs_view(admin_id, comp_id);
    END LOOP;

    RAISE NOTICE '[random-seeder] % anchor songs, % random songs seeded', anchor_count, random_count;
END $$;

DROP FUNCTION IF EXISTS pg_temp.sfs_slugify(text);
DROP FUNCTION IF EXISTS pg_temp.sfs_link_artists(uuid, text);
DROP FUNCTION IF EXISTS pg_temp.sfs_add_recordings(uuid, uuid, text, text, int, boolean);
DROP FUNCTION IF EXISTS pg_temp.sfs_add_tags(uuid, text[]);
DROP FUNCTION IF EXISTS pg_temp.sfs_favorite(uuid, uuid);
DROP FUNCTION IF EXISTS pg_temp.sfs_view(uuid, uuid);
  `;

  await client.query(sql);
  console.log('[random-seeder] Database-side randomized seeding completed successfully!');
}

// Exported for documentation / tests that want to know the deterministic songs.
export { ANCHOR_SONGS, CONTENT_TEMPLATES, PLAYLISTS, USERS };
