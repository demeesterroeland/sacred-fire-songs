-- 3. Import Songs-- Batch Import of ChordPro Songs with Researched Authors
-- Song: Abuelitas piedras
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Abuelitas piedras',
        'Traditional (Maria Valdivia)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
    )
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Abuelitas piedras}
{ci: Temazcal version}
Abuelitas piedras las gracias te damos, las gracias te damos
Por abrir el corazón a la sanaçion, abrirlo al amor
{ci: Full version}
[Am]Abuelito Fuego las [G]gracias te damos, las [Em]gracias te damos
[Am]Por abrir el corazón a la [G]sanación, abrirlo al [Em]amor
[Am]Madrecita Tierra, las [G]gracias te damos, las [Em]gracias te damos
[Am]Por abrir el corazón a la [G]sanación, abrirlo al [Em]amor
...Madrecita Tierra
...Hermanito Viento
...Padresito Cielo
...Madrecita Agua
...A las Medicinas
...A los abuelitos
...A Ometeotl'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Abuelito Fuego
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Abuelito Fuego', 'Traditional (Camino Rojo)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Abuelito Fuego}
{subtitle: Santiago song}
[C]Abuelito Fuego tu [E7]pluma es bri[Am]llante 
Abuelito Fuego de mi cora[C]zón 
Abuelito Fuego tu [E7]pluma es bri[Am]llante 
Abuelito Fuego de mi cora[C]zón 

[F]Abuelito Fuego tu pluma es brillante 
[C]En el centro y''adentro de mi corazón 
[G]Abuelito Fuego tu pluma es brillante 
[C]Abuelito Fuego de mi corazón 

[G]Awakolla Karaway karaway karaway 
[C]Peyotito Karaway karaway karaway 
Ayawaska Karaway karaway karaway 
Tabaquito Karaway karaway karaway'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Agradecer, agradecer
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agradecer, agradecer', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agradecer, agradecer}
{artist: Unknown}
{tag: Spanish}
{tag: Earth}

Agradecer, agradecer 
Esta tierra tan bonita 
Pachamamita Pachamamita (x2)

Reconocer, reconocer 
En este altar el poder 
este poder este poder (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
END $$;
-- Song: Agua cambia
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agua cambia', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agua cambia}
El agua cambia todo lo que toca, 
todo lo que toca cambia (2x) 
Toca, Cambia, todo lo que toca cambia. (2x) 

El Fuego cambia todo lo que toca, 
todo lo que toca cambia (2x) 
Toca, Cambia, todo lo que toca cambia. (2x) 

El viento cambia todo lo que toca, 
todo lo que toca cambia (2x) 
Toca, Cambia, todo lo que toca cambia. (2x) 

La Tierra cambia todo lo que toca, 
todo lo que toca cambia (2x)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Aho Gran Espíritu
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aho Gran Espíritu', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aho Gran Espíritu}
{artist: Unknown}
{tag: Spanish}
{tag: Earth}

Ahó, Ahó, Ahó Gran Espíritu (2x) 
Del corazón de la montaña 
Hacia el espacio infinito (2x) 

Ahá, Ahá, Ahá Mi madre Tierra (2x) 
Madre de todas las criaturas 
que habitan sobre ella (2x) 

Rayo, Rayo, Rayo del nuevo/medio día (2x)
Suena el tambor, danza del Sol 
Mi corazón siente alegría (2x)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
END $$;
-- Song: Aho Pacha Mama
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aho Pacha Mama', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aho Pacha Mama}
{artist: Unknown}
{tag: Spanish}
{tag: Nahuatl}
{tag: English}
{tag: Earth}
{tag: Fire}
{tag: Water}

Aho Pacha Mama, 
Madre Tierra, 
Sacred Goddess,
Tonantzin

Aho Pacha Mama, 
Madre Tierra, 
Sacred Gaia,
Tonantzin

Aho Pacha Mama, 
Madre Tierra, 
Sacred Goddess,
Tonantzin

Aho Pacha Mama, 
Madre Tierra, 
Sacred Gaia,
Tonantzin, Tonantzin, Tonantzin

Tezcatlipoca y Quetzalcoatl
creation of the universe
in darkness and light

Tezcatlipoca y Quetzalcoatl
creation of the universe
in darkness and light
in darkness and light
in darkness and light

Aho Pacha Mama, 
Madre Tierra, 
Sacred Water,
Tonantzin

Aho Pacha Mama, 
Madre Tierra, 
Sacred Fire,
Tonatiuh

Aho Pacha Mama, 
Madre Tierra, 
Sacred Water,
Tonantzin

Aho Pacha Mama, 
Madre Tierra, 
Sacred Fire,
Tonatiuh, tonatiuh, tonatiuh

Tezcatlipoca y Quetzalcoatl
creation of the universe
in darkness and light
in darkness and light
in darkness and light'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Nahuatl
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'nahuatl';
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
END $$;
-- Song: Bendice la Tierra
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Bendice la Tierra', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Bendice la Tierra}
{artist: Unknown}
{tag: Spanish}
{tag: Air}
{tag: Earth}
{tag: Fire}
{tag: Water}

[Am]Bendice la tierra con [Am]agua. 
[G]Bendice la tierra con tu cora[Am]zón 
[Am]Bendice la tierra con [Am]aire 
[G]Y vuela siempre en liber[Am]tad (2x) 

[G]Y ábrete (3x)[Am] 
A la [E7]vida y al a[Am]mor (2x) 

Bendice la tierra con fuego 
Que brille la llama dentro de ti 
Bendice la tierra a su gente 
Trayendo pura sanación (2x) 

Y ábrete (3x) 
A la vida y al amor (2x)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Air
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'air';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
END $$;
-- Song: Blessed we are
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Blessed we are', 'Peia',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Blessed we are}
[Verse 1]
[Am]Blessed we are to [Dm]dance on [G]this ground, 
The [G]rhythm of saints to [C]carry the sound. 
[Dm]We hold a prayer for the [Am]earth, for the ones yet to come, 
[G]''May you walk in beauty and [C]remember your song.'' 

[Verse 2]
[Am]Blessed we are to [Dm]dance on this ground, 
The [G]rhythm of saints to [C]carry the sound. 
[Dm]We hold a prayer for all [Am]life, for the days yet to come, 
[G]''May you walk in beauty and [C]remember your song.'' 

[Bridge]
[Dm]Remember why you came [C]here, 
re[Am]member your life is [G]sacred 
[Dm]Remember why you came [C]here, 
re[Am]member your life is [G]sacred 
Hayahey yahey yahey yoh 

[Chorus] (2x)
[Dm]Hayahey yahey yahey [Am]yoh 
[C]Hayahey yahey yahey [G]yoh'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Brilla Diamante
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Brilla Diamante', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Brilla Diamante}
{artist: Unknown}
{tag: Spanish}

Dio mio me presento con los manos vacíos x2
En mi corazon zon, diamante, en tu(su) gracia, brilla diamante x2

Brilla brilla diamante, brilla brilla diamante x2
Brilla brilla diamante, brilla brilla diamante x2

Brilla brilla hasta luz luz brillan los colores, fluye fluye el amor, fluye fluye el amor x2

Damderore damderore damderore damderore x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Caboclo
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Caboclo', 'Umbanda',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Caboclo}
{artist: Unknown}
{tag: Portuguese}
{tag: Umbanda}


[Am]Caboclo nas matas Nas cachoeiras 
Nas pedras e nas pedreiras E nas ondas do mar 

[Am]Cobocla guerreira mensageira 
Da paz e da harmonia soldado de oxalá

[Dm]Vem de aruanda vem vem vem 
[Am]Trazendo forca vem vem vem 
[E]Quebrando mironga vem vem vem 
[Am, A7]Na umbanda sarava 

{c: English Translation:}
Caboclo of the forest, of the waterfalls 
Of the stone and stony places, and the waves of the sea,
Cabocla (female) warrior, messenger of peace & harmony,
soldier of Oxala,
From Aruanda, come, come, come bringing strength,
to break the illusion, so Umbanda can be healed

https://www.song-circle.com/world-songs/bejja-flor/caboclo
'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Umbanda
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'umbanda';
END $$;
-- Song: Calling
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Calling', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Calling}
Calling calling calling us home 
Calling calling calling us home 
Wherever we may roam 

Grandfather Sky 
Grandmother Earth 
Sacred Water 
Our heart 
Grandfather fire 
is calling us home'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Canto enamorado del pájaro
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Canto enamorado del pájaro', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Canto enamorado del pájaro}
Desde lejos... 
desde lejos oigo el canto enamorado 
de un pájaro... 
Y ese pájaro... 
Es mi abuelo 
Es mi abuelo que canta, 
Que canta enamorado. (2x) 

Canta, canta, canta 
Canta, canta, canta 
Canta, canta, canta 
canta, canta, canta 

Ágida a a a a 
Ágida, Ágida, 
Ágida da 
Ágida, Agidaaaa (2x) 

Ágida Ágidada 
Ágidagidaaa (2x) 
Ágida Aj Ágida 
Ágida Aj Ágide'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Colhendo lírio lirulê
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Colhendo lírio lirulê', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Colhendo lírio lirulê}
Eu vi mamãe oxum na cachoeira 
Sentada na beira do rio 

Colhendo lírio lirulê 
Colhendo lírio lirulá 
Colhendo lírio 
Pra enfeitar o seu gongá 
Colhendo lírio lirulê 
Colhendo lírio lirulá 
Colhendo lírio 
Pra enfeitar o seu gongá 

Mamãe Oxum tem proteção de Zambi 
Olhai seus filhos com olhar sereno 
Ela é beleza 
Ela é pureza 
Ela nos traz a paz 
Do Santo Nazareno'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Core core
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Core core', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Core core}
Core core core core
core core yanamayey (x2) 
Yana yana yana yanamayey (x4)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Cuatro Vientos
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Cuatro Vientos', 'Danit',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Cuatro Vientos}
	{tag: Spanish}
Viento que viene de la montaña 
Viento, tráenos la claridad (2x)

Viento que viene del mar 
[Am]Viento, tráenos la [Em]liber[G]tad (2x)

Vuela, vuela, vuela, vuela 
Vuela, vuela, vuela, volá con nosotros (2x) 

Viento que viene del desierto 
Viento, tráenos el silencio  (2x)

Vuela, vuela, vuela, vuela 
Vuela, vuela, vuela, volá con nosotros 

Viento que viene de la selva 
Viento, tráenos la memoria (2x)

Vuela, vuela, vuela, vuela 
Vuela, vuela, vuela, volá con nosotros'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Down to the river
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Down to the river', 'Traditional (Spiritual)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Down to the river}
[G]As I went down to the river to pray 
[D]Studying about that good old [G]way 
And who shall *wear the starry crown 
[D]Good Lord [C]show me the [G]way 

Oh [D]*Sisters, let''s go [G]down 
[C]Let''s go down, come on [G]down 
Oh sisters, let''s go [D]down 
[C]Down in the river to [G]pray 

{c: (*) Variations for ''wear the starry crown'': wear the robe and crown }
{c: (*) Variations for ''Sisters'': Oh Brothers }'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Earth Water Blood
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Earth Water Blood', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Earth Water Blood}
Earth my body water my blood 
Air my breath and fire my spirit 

Tierra mi cuerpo agua mi sangre 
Aire mi aliento y fuego mi espíritu'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Espíritu del agua
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Espíritu del agua', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Espíritu del agua}
Hermoso espíritu del agua, 
llega ya 
Curando purificando, llega ya 

El gran cóndor de los andes, 
vuela ya 

En el corazón de mis hermanos, 
llega ya 
Curando iluminando, llega ya 
Curando purificando, llega ya 

Cuatro vientos en el centro, 
soplan ya 

Siete flechas en el centro, 
brillan ya 

Hermoso espíritu del cielo, 
llega ya 
Curando illuminando, llega ya 

En el corazón de este fuego, 
vuela ya 

La gran águila del norte, 
vuela ya 

Hermoso espíritu de ayahuasca, 
llega ya'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Eu sou Santa Maria
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Eu sou Santa Maria',
        'Traditional (Santo Daime)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
    )
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Eu sou Santa Maria}
Eu sou Santa Maria 
Trago aqui Amor e Alegria (2x) 

E aqui dentro deste salão 
A alegria é a nossa única razão 
Santa Maria Nina Urku'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Florecerá
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Florecerá', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Florecerá}
{artist: Unknown}
{tag: Spanish}



Voy sembrando una semilla de paz 
en la tierra y en el corazón (paz, luz, amor)  (2x)

Llamo al agua 
canto al agua 
para que venga a darle vida (2x)

Padre Sol le dará la fuerza 
y el silencio será su melodía (2x)

Brotara crecerá celebrará 
La magia de la vida (2x)

Florecerá, florecerá
florecerá, florecerá (2x)

Floreciendo la conciencia
florece mi corazón (2x)

Somos flores somos flores 
En este jardín de paz.(2x)

https://www.facebook.com/watch/?v=2328854114060949
'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Fly - little bird
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Fly - little bird', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Fly - little bird}
[d]I just need your little [a]smile 
[a]I just need your [d]smile 
[d]Sing for me, my little [a]bird 
[a]Sing your song for [d]me 

To [C]fly, To [G]fly 
To fly behind the sky (4x) 

[d]Sing for me, my little [a]bird 
[a]In your arms I feel [d]divine 
Take me to your world 
[a]To your sun, To your [d]moon 

[C]And/Your stars behind the [G]sky (2x) [d] 

[a]In your eyes I see the [d]light 
[a]In your eyes I see (the [d]light)
[a]Of the sun, of the [d]moon 
[C]The stars behind the [G]sky (2x) 

[d]Love leads to eter[a]nity 
[a]Your heart will show the [d]way 
[d]Love leads to eter[a]nity 
[a]Your heart will show the [d]way 
[a]To your sun, To your [d]moon 
[C]Your stars behind the [G]sky (2x)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Gitsi Manitou
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Gitsi Manitou', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Gitsi Manitou}
Gitsi, gitsi, gitsi Manitou (x2) 
Gitsi Manitou, gitsi Manitou (x2) 

Yoha, yoha, yoha wanna-yo (x2) 
Yoha wanna-yo, yoha wanna-yo (x2) 

Gitsi, gitsi, gitsi Manitou (x2) 
Gitsi Manitou, gitsi Manitou (x2) 

Yoha, yoha, yoha wanna-yo (x2) 
Yoha wanna-yo, yoha wanna-yo
hey yana, hey ney yo wei

Quetzalcoatl, take us by the hand 
we will follow the morning star 
Yoha wanna-yo, yoha wanna-yo (x2) 

With this star we shall rise 
with happiness and beauty in our lives 
Yoha wanna-yo, yoha wanna-yo
hey yana, hey ney yo wei
Gitsi, gitsi, gitsi Manitou (x2) 
Gitsi Manitou, gitsi Manitou (x2) 

Yoha, yoha, yoha wanna-yo (x2) 
Yoha wanna-yo, yoha wanna-yo (x2) 

Gitsi, gitsi, gitsi Manitou (x2) 
Gitsi Manitou, gitsi Manitou (x2) 

Yoha, yoha, yoha wanna-yo (x2) 
Yoha wanna-yo, yoha wanna-yo
hey yana, hey ney yo wei'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: He Yama yo
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('He Yama yo', 'Curawaka',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: He Yama yo}
{artist: Curawaka} 
{tag: Vocalization}
He yama yo 
Wana hene yo 
He yama yo 
Wana hene yo (2x)
Wahee 
Yayana 
Hey hey hey ho 
Waahee 
Hey hey hey hey hey ho 
Wahee'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
END $$;
-- Song: Ide were were
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ide were were', 'Traditional (Yoruba)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ide were were}
[e]Ide were were nita [D]Oxun. 
[E]Ide were were. 
[e]Ide were were nita [D]Oxun. 
[e]Ide were were nita ya. 

[e]Ocha kiniba nita [C]Oxun [D] 
Cheke cheke cheke. [G]nita [C]ya. [D] 
Ide were were. [b] [B7]'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Inan Tonanzin
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Inan Tonanzin', 'Traditional (Nahuatl)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Inan Tonanzin}
{artist: Unknown}
{tag: Earth}
{tag: Medicine Plants}
{tag: Nahuatl}
{tag: Temazcal}
{tag: Women}

Inan tonanzin tlan inan tonanzin tlali 
Inan tonanzin inan tonanzin tlan (x2) 

Welo we ya ya yo welo we ya yo (x2) 
Heya Heya Heya Heya Heya 
Heya Heya Heya welo we ya yo (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
-- Tag: Nahuatl
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'nahuatl';
-- Tag: Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'temazcal';
-- Tag: Women
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'women';
END $$;
-- Song: L'albero
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('L''albero', 'Dario Hampi Pakari',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: L''albero}
{capo: 5} 
La radice è forte l''albero cresce il ramo si allungherà (a Cea) 
E da quel ramo la foglia che cresce nel sole risplenderà (a Cea) 
Quando è il momento danzando nel vento la terra bacerà (FCEa) 
Ed al mattino là sulla cima si sentirà il cantare (a Ce a) 
Di chi al risveglio ringrazia il vento che gli insegnò a volare (FCEa) 
Di chi al risveglio canta contento ed inizia a volare (FCEa) 

La radice è forte l''albero cresce il ramo si allungherà 
E da quel ramo la foglia che cresce nel sole risplenderà 
Dalla radice la forza creatrice nel Tronco si innalzerà 
Chiamata dal sole e dal suo calore nell''acqua inizia a viaggiare 
Portando il messaggio pieno di coraggio che l''amore sboccerà 
E con il valore che dà l''amore il seme germoglierà 
{c: Dario}'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Luz divina
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Luz divina', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Luz divina}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Santa Maria}
Luz divina Santa María 
Santa María divino amor (2x) 
Agua limpia y milagrosa 
Que da todo su esplendor (2x) 

Luz divina Santa María 
Santa María divino amor (2x) 
Virgen madre que me guía 
En esta planta que es todo amor (2x)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
END $$;
-- Song: Medicina Lapitoj
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Medicina Lapitoj', 'Coral Herencia',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Medicina Lapitoj}
{artist: Coral Herencia}
{tag: Spanish}
{tag: Medicine Plants}

Te lleva adentro 
al centro de tu centro 
medicina lapitoj 
toco tu corazón (2x) 

Tiene colmillos de Jaguar 
mirada profunda como la serpiente 
alas de cóndor para volar 
espirales salen desde su frente 

Cura, sana, siente, ama (2x) 
Cura por dentro 
sonrie contento 
Espiritu Antiguo 
puente vivo cosmico (2x) 

Tiene colmillos de Jaguar'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: Mother I Feel You
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mother I Feel You', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mother I Feel You}
Mother I feel you under my feet. 
Mother I can feel your heart beat (2x) 
Hey ya (7x) ho [G] 

Sister I can hear you in the river''s song. 
Eternal waters flowing on and on (2x) 
Hey ya (7x) ho 

Father I can see you in the eagles flight. 
Light of the Spirit''s gonna take us higher (2x) 
Hey ya (7x) ho 

Brother I can see you in the fire flame 
Dancing and drumming''s gonna make us stronger (2x) 
Hey ya (7x) ho'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Mother I Honor You
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mother I Honor You', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mother I Honor You}
Grand Mother I honor you 
[a]Your water is my [G]blood 
Every day and every night 
I give thanks for your love 

Grandfather I honor you 
You spirit is my guide 
Every day and every night 
I give thanks for your love

Awe awe awe awa...'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Pachamama Madre Tierra
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pachamama Madre Tierra', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pachamama Madre Tierra}
{artist: Unknown}
{tag: Spanish}
{tag: Earth}

Pachamama madre tierra (x2) 
Taita inti taita inti 
taita inti  Gran Espiritu 

Pachamama madre tierra (x2) 
Wirikuta wirikuta
wirikuta Gran Espiritu 

Pachamama madre tierra (x2) 
Nina Urku Nina Urku
Nina Urku Gran Espiritu'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
END $$;
-- Song: Queen of the Web
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Queen of the Web', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Queen of the Web}
{artist: Unknown}
{tag: English}

Momma iktomi (hitomi) Queen of the web 
weaving us all with her sacred thread (x2) 

wiki tiki tiki tiki 
wiki tiki tiki tiki 
Queen of the Web (x2) 

weaving the heavens into the earth, 
weaving our dying into our birth (x2) 

wiki tiki tiki tiki 
wiki tiki tiki tiki
Queen of the Web (x2) 

nothing escapes her tender embrace, 
dark, light, wrong, right Queen of the Web (x2) 

wiki tiki tiki tiki 
wiki tiki tiki tiki
Queen of the Web (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
END $$;
-- Song: Salve salve mamae Oxum
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Salve salve mamae Oxum',
        'Traditional (Umbanda)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
    )
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Salve salve mamae Oxum}
{artist: Unknown}
{tag: Portuguese}
{tag: Water}
{tag: Umbanda}
Salve salve mamae Oxum 
Com sua luz vem-nos iluminar (x2) 
Salve salve mamae (x2) 
Salve salve mamae Oxum (x2) 

Com suas aguas vem-nos curar (x2) 
Salve salve mamae (X2) 
Salve salve mamae Oxum (x2) 

Com sue sorriso vem-nos alegrar (x2) 
Salve salve mamae (x2) 
Salve salve mamae Oxum (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Umbanda
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'umbanda';
END $$;
-- Song: Salve Rainha do Mar
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Salve Rainha do Mar', 'João de Angola',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Salve Rainha do Mar}
{artist: João de Angola}
{tag: Portuguese}
{tag: Water}
{tag: Umbanda}

[C]Sal ve Ra hi [G]na Do [C]Mar 
[G]Salve Rahina do Mar 
[Dm]Salve minha mae [G]Iemanja 
[C]Ella é [Dm]criadora 
Du [G]fundu du [C]mar (x2) 

[C]Ella é pro[Dm]tectora 
Du [G]fundu du [C]mar (x2) 

[C]Ella é minha [Dm]Mae 
[G]Ella é Ie[C]manja (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Umbanda
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'umbanda';
END $$;
-- Song: Siento la medica
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Siento la medica', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Siento la medica}
{capo: 2} 
{c: TRAI NAI NAI NAI NAI NAI NAI NAI NAI NAI NAI NAI }

[Verse 1] 
[Am]Siento la medi[G]cina 
[Am]Viene Cu[G]rando 
[Am]Viene Sa[G]bando 
[Am]Viene Ali[G]viando 

[Verse 2] 
[Am]Siento el calor del [G]sol 
[Am]Fluyendo en mi cora[G]zón 
[Am]Viajando en el uni[G]verso 
[Am]Libre volando hacia la [G]Luz que da la [Am]vida 
[G]En este para[Am]iso 
[G]De color y ale[Am]gria 
[G]Canta melodia / [Am]medicina 
{c: inai nai nai nai... }

[Refrain] 
[Dm]Madre Ayahuasca / Abuelo San [Am]Pedro calma mi [C]mente [G] 
[Dm]Luz divina guia mi cora[Am]zon [C] [G] 
[Dm]Madre Ayahuasca / Abuelo San [Am]Pedro danos cons[C]ciencia [G] 
[Dm]Luz divina guia mi cora[Am]zon [C] [G]'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Sou Filho de Deus
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sou Filho de Deus', 'Traditional (Santo Daime)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sou Filho de Deus}
Sou filho de Deus, sou filho da Rainha 
São Pedro è o Mestre quem me ensina nesta linha (x2) 
{c: I am a child of God, I am a child of the Queen }
{c: Saint Peter is the Master who teaches me this line (x2) }

Santa Maria vem-nos ajudar 
Todos seus filhos quem confiam procurar (x2) 
{c: Saint Mary comes to help us }
{c: All her children whom you trust to seek (x2) }

Procura procura, quem procura acha 
Santa Maria com amor de Deus despacha (x2) 
{c: Seeker seeks, does who seek will find }
{c: Saint Mary, with God''s love, get rid of (x2) }

Despacha tudo quanto for ruim 
deixando tudo com perfume de Jasmim (x2) 
{c: Get rid of all that is bad, leaving everything with the scent of Jasmine (x2) }

Sou filha de Deus, sou filho da Rainha 
Awakallero è o Mestre quem me ensina nesta linha (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Tamborcito
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tamborcito', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tamborcito}
{artist: Unknown}
{tag: Spanish}

Tamborcito tamborcito 
ayúdame a cantar (x2) 

{subtitle: Alternative version} 
Tabachito tabachito 
Ayudame a rezar (X2) 

Para que salga la voz 
Para que salga la voz 
Para que salga la voz 
Y (que) llegue a donde tenga que llegar 

Al corazón de mi hermano 
Al corazón de mi hermana 
Al corazón de la tierra 
de este fuego, 
de este agua, 
del viente 

Al corazón al corazón 

{c: English Translation:} 
Tamborcito tamborcito 
help me to sing (x2) 
For the voice to come out 
To bring out the voice 
So that the voice comes out
And let it go where it needs to go 
To my brother''s heart 
To my sister''s heart 
To the heart of the earth 
 of this fire, 
 of this water, 
 of the wind 

To the heart of the heart

https://www.song-circle.com/world-songs/condor/tamborcito
'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Tonantzin tzin tzin
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tonantzin tzin tzin', 'Traditional (Nahuatl)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tonantzin tzin tzin}
Tonantzin tzin tzin tonantzin (x2) 
Tona tona tona tonantzin $(\times2)$ 
Tonatiuh tiuh tiuh tonatiuh $(\times2)$ 
Tona tona tona tonatiuh $(\times2)$'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Ven, ven
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ven, ven', 'Fiona Helmer',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ven, ven}
{artist: Fiona Helmer}
{tag: Spanish}
{tag: Water}


Ven, ven... ven, ven... ven, ven... ven, ven... ven, ven... (x2)


Agua de la vida, 
agua pura, cura agua, ven, ven (x2) 

Ven ven, agua cura 
Ven, ven, agua pura, 
Ven ven, agua cura 
Ven, ven(x2) 

Sangre de mi Madre, 
sudor de mi Padre (x2) 

Ven ven, agua cura (x2) 

Barcos hechos de lágrimas, 
Tenemos un barco para ti (x2) 
Ven ven, agua cura... (x2) 

Remos hechos de cantos 
Deliciosos y antiguos para ti (x2) 
Ven ven, agua cura... (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
END $$;
-- Song: Weyo wey yanna
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Weyo wey yanna', 'Traditional',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Weyo wey yanna}
Weyo wey yanna weyo wey yanna (x4) 

En el desierto weyo wey yana Huicholes danzan weyo wey yana 
Con abuelito weyo wey yanaEl peyotito weyo wey yana 

Y en la selva weyo wey yana Jaguares saltan weyo wey yana 
La boa boila weyo wey yana Con ayahuasca weyo wey yana 

Y en los Andes weyo wey yana Alli florece weyo wey yana 
La Huachuma weyo wey yana El Awacolla weyo wey yana 

Y en el cero weyo wey yana Canta la tierra weyo wey yana 
Con los honguitos weyo wey yana Los Ninos Santos weyo wey yana 

Weyo wey yanna weyo wey yanna (x3) 
Weyo wey yana Hey ney oh wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Wichita tuya
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Wichita tuya', 'Traditional (Lakota)',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Wichita tuya}
danklied en waterlied 
Wishi Ta Duja Duja Duja 
Washan Te Neya Heya Heya'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Song: Agüita
DO $$
DECLARE comp_id uuid;
BEGIN
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agüita', 'Irina Flórez',
        false,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
RETURNING id INTO comp_id;
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agüita}
{artist: Irina Flórez}
{subtitle: Camino Rojo version}

[Intro]
[Bm]Agüitay, [A]agüita
[G]Agüitay, [A]agüita
[G]Que canta, [A]calma, sana, [Bm]cura el caminito nay-na-ray
[G]El cuerpe[A]cito nay-na-[Bm]ray

[Bm]Fluyes en el [A]río, agüita
[G]Cantas en el [A]ancho mar
[Bm]Tu brillo en la mon[A]taña
[G]Misterio en la la[A]guna
[G]Agüita, [A]déjame en[Bm]trar
[G]Agüita, [A]déjame en[Bm]trar

[Verse 1]
[Bm]Agua que corres por mis [A]venas
[G]Camino [A]rojo de mi cora[Bm]zón
[Bm]Agua, que fluyes por la [A]tierray
[G]Camino [A]rojo del cora[Bm]zón

[G]Agua en el [A]cielo
[G]Agua en la [A]tierray
[G]Camino [A]rojo del cora[Bm]zón

[Bm]Agua, mi padre
[A]Agua, mi madre
[G]Agua [A]viva
[Bm]Agua, hijos
[A]Agua de vida
[G]Agua de [A]amor
[G]Mi camino [A]rojo del cora[Bm]zón
[G]Camino [A]rojo del mi cora[Bm]zón

[Outro]
[Bm]Agüitay, [A]agüita
[G]Agüitay, [A]agüita
[G]Canta, calma, [A]cura el cami[Bm]nito
[G]El cuerpe[A]cito [Bm]'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13');
END $$;
-- Script to populate YouTube URLs for the top 10 songs
-- Run this via Supabase SQL Editor or `supabase db reset` seed (if adapted)
-- 1. Abuelitas piedras
UPDATE public.song_versions
SET youtube_url = '2pzlBCq6k64'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Abuelitas piedras'
    );
-- 2. Abuelito Fuego
UPDATE public.song_versions
SET youtube_url = 'yVAi5K84jFk'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Abuelito Fuego'
    );
-- 3. Agradecer
UPDATE public.song_versions
SET youtube_url = 'dTXwgJp-iPw'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Agradecer'
    );
-- 4. Agua cambia
UPDATE public.song_versions
SET youtube_url = 'H3DIEf7bNzs'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Agua cambia'
    );
-- 5. Agüita
UPDATE public.song_versions
SET youtube_url = 'YZHdypgxy14'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Agüita'
    );
-- 6. Aho Gran Espíritu
UPDATE public.song_versions
SET youtube_url = 'NKMV_zVUOyE'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Aho Gran Espíritu'
    );
-- 7. Aho Pacha Mama
UPDATE public.song_versions
SET youtube_url = 'ZE9KR7avpuw'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Aho Pacha Mama'
    );
-- 8. Aquí en la montaña (No URL found - Placeholder)
-- UPDATE public.song_versions
-- SET youtube_url = 'YOUR_YOUTUBE_ID_HERE'
-- WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Aquí en la montaña');
-- 9. Bendice la Tierra
UPDATE public.song_versions
SET youtube_url = 'QXzmdy9myqo'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Bendice la Tierra'
    );
-- 10. Blessed we are
UPDATE public.song_versions
SET youtube_url = 'YiDpIaXQDrI'
WHERE composition_id IN (
        SELECT id
        FROM public.compositions
        WHERE title = 'Blessed we are'
    );