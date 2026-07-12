-- 5. Nina Urku Song Collection (197 songs)
-- ============================================================================
-- Batch Import of Nina Urku Songs with Category Mapping
-- Song: A Firmeza
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('A Firmeza', 'Traditional', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: A Firmeza}
{artist: Unknown}
{tag: Santa Daime}

 Ai que eu já estava caindo
Aqui no meio do salão
Foi chegando uma firmeza
Acalmando a confusão

Uma luz veio clareando
Enchendo meu ser de paz
Encontro meu equilíbrio
Acalma me satisfaz

Sigo alegre e satisfeito
Louvando o meu Senhor
Minha Mãezinha querida
E meu Mestre Ensinador

Acabando o trabalho
Vou pra casa descansar
Mas logo no dia seguinte
Tudo volta a piorar

Meu Mestre me ajude
Vós queirais me esclarecer
Como ter o equilíbrio
Para não esmorecer

Ele disse para mim
Filho, presta atenção
Não se desligue um só minuto
Neste mundo de ilusão

A firmeza é uma semente
Que brota no teu coração
Ela cresce e se alimenta
Com o Poder da Oração

Ao amanhecer do dia
Tu te lembres de rezar
Agradecendo ao sol e à Lua
E à Rainha do mar


Oh, I was already falling
Here in the middle of the hall
A firmness arrived
Calming the confusion

A light came shining
Filling my being with peace
I find my balance
Calm down, satisfy me

I remain happy and satisfied
Praising my Lord
My dear Mother
And my Master Teacher

Finishing the work
I''m going home to rest
But the very next day
Everything gets worse again

My Master help me
Would you like to enlighten me
How to have balance
So as not to fade

He said to me
Son, pay attention
Don''t switch off for a single minute
In this world of illusion

Firmness is a seed
That springs from your heart
It grows and feeds
With the Power of Prayer

At the dawn of the day
You remember to pray
Thanking the sun and the moon
And to the Queen of the sea'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Santa Daime
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santo-daime';
END $$;
-- Song: A fresh new breath is growing
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('A fresh new breath is growing', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: A fresh new breath is growing}
{artist: Unknown}
{tag: English}
{tag: Air}
{tag: Earth}

A fresh new breeze is growing
The winds of change are blowing
Every moment is a miracle of life

The ancient wisdom has returned
And walking on this land we’ve learned
We are the ones we’ve been waiting for

We are the elders we are the children
We carry inside all that has ever been
We are the vision circling once again

And it is timeless it is blossoming
In the lives we live and the songs we sing
We are reconnected to the spirit of the earth (x3)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
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
END $$;
-- Song: A la Señora del Carmen
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('A la Señora del Carmen', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: A la Señora del Carmen}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

Estamos en el mar 
Estamos en la tierra 
Cantándole a la vida 
Agradeciendo a Iemanjá 
Agradeciendo a Iemanjá 
x2

Madre todopoderosa Señora del Carmen sagrada protectora 
En el fondo del pecho tu llevas la estrella 
en el fondo del pecho guardas la estrella 
De mi corazón, de mi corazón 
De tu corazón, de tu corazón 

Estamos en el mar 
Estamos en la tierra 
Cantándole a la vida 
Agradeciendo a Iemanjá 
Agradeciendo a Iemanjá 

Madre todopoderosa Señora de los mares rumbo seguro 
Tu eres la estrella que me guía hacia el centro 
Tu eres la estrella que me guía hacia adentro 
De mi corazón, de mi corazón 
De tu corazón, de tu corazón

Estamos en el mar 
Estamos en la tierra 
Cantándole a la vida 
Agradeciendo a Iemanjá 
Agradeciendo a Iemanjá 

Madre todopoderosa Reina de delfines, ballenas corales 
Ay cuando tu me abrazas siento el corazón 
Ay cuando tu me acaricias siento el corazón
De mi mamamamamma Iemanjá
De mi mamamamamma Iemanjá'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Abuelito Abuelita
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Abuelito Abuelita', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Abuelito Abuelita}
{artist: Unknown}
{tag: Spanish}

yana wena hoy yana, yana wena hoy yana
hey yana, yana wena hoy yana
yana wena hey yana, hey ney yo wei
(x2)
Abuelito, Abuelita
Escucha mi palabra
Mi cariño, mi amor
Oh yana, yana wei na hoy yana
yana wena hey yana, hey ney yo wei
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Abuelito Tatewari
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Abuelito Tatewari', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Abuelito Tatewari}
{artist: Unknown}
{tag: Spanish}
{tag: Fire}

 Abuelito Tatewari Abuelito Tatewari [Grandfather Fire]
Abuelito Tatewari Abuelito Tatewari
yana he a nah hey ney yo wey

Cura cura esta familia [Cure this family]
sana sana corazones [Heal heal this family]
cura cura sentimento [Cure cure the feeling]
sana sana pensamiento [heal heal thoughts]
yana he a nah hey ney yo wey

Abuelito Tatewari Abuelito Tatewari
Abuelito Tatewari Abuelito Tatewari
yana he a nah hey ney yo wey

Cura cura cuerpocito [Cure cure body]
sana sana espiritu [heal heal spirit]
Abuelito Tatewari Abuelito Tatewari
yana he a nah hey ney yo wey

Gracias te doy por el dia de hoy [i give you thanks for the day of today]
hoy hoy [now now]
yana ho wey yana he a nah hey ney yo wey

tloque tloque nahuaque impanemohuani [creator, giver of life]
toyolotatzin (motherly heart) tlazokamatli [thank you for heart of creator the giver of life]
yana he a nah hey ney yo wey

a hayo yana a hayo yane
a hayo
yana he a na hey ney yo wey

Abuelito Tatewari Abuelito Tatewari
Abuelito Tatewari Abuelito Tatewari
yana he a nah hey ney yo wey

a su lado lleva kayumari [at his side he carries kayumari (blue deer)]
a su lado lleva marakame (curandero/shaman)
yana he a nah hey ney yo wey

Abuelito Tatewari Abuelito Tatewari
Abuelito Tatewari Abuelito Tatewari
yana he a nah hey ney yo wey

Cura cura esto ninotos
sana sana esto ninotos
cuida cuida los ninots [take care of the kids]
Abuelito Tatewari
yana he a nah hey ney yo wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
END $$;
-- Song: Abuelo (adida, adide)
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Abuelo (adida, adide)', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Abuelo (adida, adide)}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Desde lejos desde lejos oigo
El canto enamorado de un pájaro

Ese pájaro es mi abuela
Es mi abuela que canta
canta enamorada

Ese pájaro es mi abuelo
Es mi abuelo que canta 
canta enamorado

Canta canta canta 
canta canta canta
canta canta canta 
canta canta canta

adida, adida
adida, adida adide
adida, adida adide


abuelo lyrics
 
 '
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Agua De Estrellas
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agua De Estrellas', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agua De Estrellas}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

Provided ID could not be validated.
https://www.song-circle.com/world-songs/condor/agua-de-estrellas


En tus ojos de agua infinita
Se bañan las estrellitas mama

Agua de luz agua de estrellas
Pachamama vienes del cielo

Limpia limpia
Limpia coraźon agua brillante
Sana sana
Sana coraźon agua bendita
Calma calma
Calma coraźon agua del cielo mama'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Agua Vital
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agua Vital', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agua Vital}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Temazcal}

 Agua vital, purifícame
Fuego del amor, quema mi temor
Viento del alba, llévame al altar
Madre Tierra, vuelvo a tu hogar
En el temazcal
En el temazcal'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'temazcal';
END $$;
-- Song: Agua de la montaña
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agua de la montaña', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agua de la montaña}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

Viento de la montaña (x2)
Agua de la cascada,
agüita de la quebrada
fuego que calienta
viento que alimenta
Hay yay, late el corazón, hay yay, late el corazón
hay yay, sueña este tambor

Agüita que cae del cielo
agüita infinita
corriendo por mis venas
tu que das la vida
agüita infinita
agüita da nos alegria
danza mi corazón, hay yay canta mi corazón
hay yay, sueña este tambor

Porque te quiero quiero (x2)
Porque te amo amo (x2)
Sol, luna y estrellas
En el cielo y en la tierra
Canta mi corazón, hay yay danza mi corazón
hay yay, sueña este tambor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Agua de vida lluvia
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agua de vida lluvia', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agua de vida lluvia}
{artist: Unknown}
{tag: Spanish}
{tag: Temazcal}
{tag: Water}

Agua de vida lluvia
Agua mar, agua rio
Espiritu serpiente
Agua lago, agua yo

Corre que corre agüita
Regalanos tu canción
Libre por esta piedras
Eres pura bendicion

Agua que corres
Agua que cantas
Agua que calma la sed
Agua que ries
Agua que lloras
Agua es tu vientre mujer
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'temazcal';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
END $$;
-- Song: Agua transparente
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agua transparente', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agua transparente}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

Agua que corre por la tierra, soñando
y danzando su camino hacia el mar
Agua que cae del cielo, soñando
y danzando su camino hacia los ríos

Corre, corre, corre
Corre, corre, corre
Corre, corre, corre
Agua corre por la tierra

Corre, corre, corre
Corre, corre, corre
Corre, corre, corre
Agua corre por mi ser

Y en el bosque a un‘
agua transparente
agua transparente
yo soy transparente

Y en el bosque a un‘
agua transparente
agua transparente
yo soy transparente

Agua que cura
Agua que sana
alimenta la tierra
Agua que cura
Agua que sana
fortalece las plantas

Agua que cura
Agua-aaa
Agua sana el miedo

Agua que cura
Agua que sana
fortalece las plantas
Agua que cura
Agua que sana
alimenta la tierra

Agua que cura
Agua-aaa
Agua purifica el veneno
Agua purifica el veneno'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Aguacollita profunda
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aguacollita profunda', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aguacollita profunda}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Ayahuasca}
{tag: Tobacco}

Ve veve ve veve ve veve veve veve veve ve veve ve veve ve
Va va va vaaa
Vava va va vaaa
Va va va vaaaa
Vava va va va
Veve ve ve ve
Vava va va va
Veve ve ve ve
(x2)

Aguacollita profunda, veve veve veve ve veve ve veve ve
Cantando vaaa, silvando vaaa, curando vaaa, brillando va, 
por mi cuerpo va, por el cielo va, por la tierra va, veve ve ve veee

Ve veve … 

Aguacollita profunda, veve veve veve ve veve ve veve ve
Cantando vaaa, silvando vaaa, brillando vaaa, va diciendo va
el fuego yo soy,  el agua yo soy, la tierra yo soy
el viento yo soooy y curando voooy 
Veve ve ve ve
Vava va va va
Veve ve ve ve

Ve veve ...

Ay tabaquito profundo, veve veve veve ve veve ve veve ve
……….

Ayahuasquita profunda, veve veve veve ve veve ve veve ve
……….

Ve veve …'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Tobacco
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'tobacco';
END $$;
-- Song: Aguila Moteada
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aguila Moteada', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aguila Moteada}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Aguila moteada escucha mi canto
Lleva este canto al universo
Condor de los Andes escucha mi canto
Lleva este canto al universo

Hey ya, hey ya, hey ya, hey ya
Hey ya, hey ya, ha
Hey ya, hey ya, hey ya, hey ya
Hey ya, ha
(x2)

Aguila moteada escucha mi rezo
Lleva mi rezo al universo
Condor de los Andes escucha mi rezo
Lleva mi rezo al universo

Hey ya, hey ya, hey ya, hey ya
Hey ya, hey ya, ha
Hey ya, hey ya, hey ya, hey ya
Hey ya, ha
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Agüita, lluviecita
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agüita, lluviecita', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agüita, lluviecita}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: San Pedro}

Agüita, lluviecita
Aguacollita, curanderita
Del cielo vienes trayendo
Bendiciones del misterio
Profunda llegas al centro
Del corazón de mi pueblo'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
END $$;
-- Song: Agüita que Vienes
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agüita que Vienes', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agüita que Vienes}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

 Hey yana Hey yana 
oiyana hene 
oini oini oiyana yo

Hey yana Hey yana 
oiyana hene 
oini oini yo 
heyana hey ney yowey

Ay Aguita que vienes 
del cerro bajando
curando, limpiando, sanando

Aguita de lluvia que caes del cielo, 
si vienes pintando, brillando
si vienes amando, curando

Hey yana...

Agua-a-a-a
que cantas, que calma si alegra el camino, 
si vienes fluyendo en mi cascadita

Agua de mi padre, agua de mi abuelo, 
si vienes amando, sembrando
si vienes amando, curando

Hey yana...

Ay Agüita bendita que cura el camino, 
levanta mi pueblo, guialo
Agua de mi sangre, recorres la tierra, 
si guías mi gente, cuídala

Hey yana...'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Agüitay, agüita
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Agüitay, agüita', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Agüitay, agüita}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

 Agüitay, agüita
Agüitay, agüita
Que canta, cura, limpia, sana
Trai, nai-nai, nai-nai, nai-na (x2)
(x2)

Corres por el río, agüita
Cantas en el ancho mar
Tu brilla en la montaña
Misterio en la laguna
Agüita, déjame entrar
(x2)
Agüita, déjame entrar

[Verso 1]
Agua que corres por mis venas
Camino rojo de mi corazón
Agua, que fluyes por la tierray
Camino rojo de mi corazón

Agua en el cielo
Agua en la tierray
Camino rojo de mi corazón
Agua que curas todas mis venas 
Camino rojo de mi corazón (x2)

Agua, mi padre
Agua, mi madre
Agua mis hijos
Agua familia y
Agua del luz y
Agua de amor
Camino rojo de mi corazón
Camino rojo de mi corazón
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Aliança
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)

VALUES ('Aliança', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aliança}
{artist: Unknown}
{tag: Spanish}
{tag: Portuguese}

 Португальский:

Esta aliança veio do astral
Vem do astral do astral superior
Ela e divina e consagra as medicinas
Ela é flores tão finas do nosso pai creador

Evoluindo as quatro portas do mundo
Na expansão das doutrinas nativas
A profecia da aguia e do condor
Vem do norte para o sul zelando com todo amor

Sagrado Tabaco, Peyote, Santo Daime
Santa maria, São Pedro clareio
Estes são os sacramentos divinos
da nossa mãe terra, Cristo vivo redentor

O gran espíritu me entrego com amor
E com amor Aliança Superior
Clareia as trevas deste povo sofredor
Iluminando o caminho do fiel seguidor

Испанский:

Esta alianza viene del astral
O del astral, astral superior (x2)

Ella es divina
Ella nos cuida
Ella nos guía hacia alianza superior
Ella es divina y nos dio las medicinas
las flores tan finas que nos dió el creador

Evolucionó las cuatros direcciones
Y expandiendo las profecías nativas
Evolucionó las cuatro direcciones
Y expandiendo las doctrinas nativas

Las profecías del águila y del cóndor
El norte para sur todo sembrando con amor (x2)

Sagrado Tabaco, Peyote, Santo Daime
Santa Maria, San Pedro clareo
Sagrado Tabaco, Peyote, Santo Daime
Santa Maria, San Pedro clareo 

Estos son los sacramentos sagrados
Que nos dió la Madre Tierra y Cristo vivo redentor 

Estos son las medicinas sagradas
Que nos dió la Madre Tierra y Cristo vivo redentor

O grande espíritu me entrego con amor
O con amor, alianza superior (x2)

Ella es divina
Ella nos cuida
Ella nos guía hacia alianza superior

Ella es divina y nos dió las medicinas
las flores tan finas que nos dió el creador'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Amo Amo Amo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Amo Amo Amo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Amo Amo Amo}
{artist: Unknown}
{tag: Spanish}

Amo, amo, amo amo mi cuerpo, 
cada paso que doy, es un paso que amo, 
cada paso que doy, es un paso sagrado. 

Amo, amo, amo amo mi mente
cada paso que doy, es un paso que amo, 
cada paso que doy, es un paso sagrado. 

Amo, amo, amo amo mi espíritu.
cada paso que doy, es un paso que amo, 
cada paso que doy, es un paso sagrado.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Anaboa
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Anaboa', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Anaboa}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

 Cielo, montana, selva y mar 
Rios, crystales, agua vital 
Pinta mi gente, Curandera 
Vienes danzando, cantando ya 
x2

Yagé ayahuasca es la (A)naboa 
Trae la medecina milenaria 
x2

Nai nai nai nai, nai nai nai nai 
Nai nai nai nai nai, nai nai nai nai nai 
x2

Llega el jaguar, piel de guardian 
Que cuida medecina, que largo le contra 
Se leventa medecina caminitos s(e) abren ya 
Es el grito de mi pueblo, (e)s la voz celestial 
x2

Yagé ayahuasca es l(a) Anaboa 
Trae la medecina milenaria 
x2

Nai nai nai nai, nai nai nai nai 
Nai nai nai nai nai, nai nai nai nai nai 
x2

En lo alto de los cerros, veo (e)l aguila volar 
Estrella radiante que me (i)llumina 
Voy guiando, leventando, pasadito (a)ligerar 
Voy llamando Curanderas, vengan ya 
x2

Yagé ayahuasca es l(a) Anaboa 
Trae la medecina milenaria 
x2

Nai nai nai nai, nai nai nai nai 
Nai nai nai nai nai, nai nai nai nai nai
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Apenas Sale La Aurora
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Apenas Sale La Aurora', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Apenas Sale La Aurora}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

(Clarita)

Nay-nay-nay-nay 
nay-nay-nay-nay-nay 
nay-nay-nay-nay nay-nay-nay-nay-nay
(x2)

Nay-nay-nay-nay na-na-na-nay na-na
Nay-nay-nay-nay na-na-na
Nay-nay-nay nay-nay-nay-nay
(x3)

Apenas sale la Aurora 
en las montañas 
se oye un cantar,
(x2)


Ayahuasca Supa Kunai riri
Mantai Kunai Yarirí,
Shamoo rirí ri ri ri


Chacrunita Supa Kunai riri
Mantai Kunai Yarirí,
Shamoo rirí ri ri ri


Curandero / Taita Sayri

Nay-nay-nay-nay 
nay-nay-nay-nay-nay 
nay-nay-nay-nay nay-nay-nay-nay-nay
(x2)

Nay-nay-nay-nay na-na-na-nay na-na
Nay-nay-nay-nay na-na-na
Nay-nay-nay nay-nay-nay-nay
(x3)


*
Pachamama / Padre Cielo
Estrellitas / Flores flores
припев'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Aprovechó el vuelo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aprovechó el vuelo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aprovechó el vuelo}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

https://yadi.sk/d/Agl4yG2aAuuMvw/Cancionero_II/Aprovecho%20el%20vuelo.mp3


Aprovechó el vuelo
Y elevo este canto
Rogando se lleguen
Aquí los abuelos.

Yagé medicina
Yagé Madre Selva
Yagé pinta gente
Gente montaña
Gente presente
Azulejero.

Azul cielo Celeste
Coronita protege
Muchos Taitas llegando
Respondiendo a la gente.

Ancestros Medicina
Espíritu-Mente
Caminante libre
Alas Sagradas
Pájaro gente
Medicinal.

Weiha weiheihoo, weiha y heiheiho
Weihaiheheiho, weihaiheiho
Weihaiheihe weihaiheho'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Aqui Na Terra
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aqui Na Terra', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aqui Na Terra}
{artist: Unknown}
{tag: Portuguese}
{tag: Earth}

 Aqui na terra vejo tanta beleza... 
Minha Mãe, Ela mostra para mim... 

Para sempre eu quero... 
Para sempre estar... 
Com minha Mãe juntinho mim...... 

Este poder esta força, fluir como um rio... 
Se entrega a fluir para o mar... 

Para sempre eu quero... 
Para sempre estar... 
Com minha Mãe juntinho a mim...... 

Rei Jagube, Mamãe Rainha... 
Da Floresta do outro lado do Mar... 

Para sempre estou... 
Para sempre esta... 
Com minha Mãe juntinho a mim




Here on the Earth I see so much beauty... 
My Mother she shows it to me... 

Forever I want, forever to be... 
With my Mother next to me...... 

This power, this force it flows like a river... 
Surrender and flow to the sea... 

Forever I want, forever to be... 
With my Mother next to me...... 

Rei Jagube e Mamãe Rainha... 
From the forest across the sea... 

Forever I am and forever shall be... 
With my Mother next to me'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
END $$;
-- Song: Aquí en la montaña
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Aquí en la montaña', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Aquí en la montaña}
{artist: Unknown}
{tag: Air}
{tag: Earth}
{tag: Fire}
{tag: Mountain}
{tag: Spanish}
{tag: Water}

Aquí en la montaña
se abre una puerta 
Aquí en la montaña
Ya llega la visión 
2x

Deja que l''aire / el agua / el fuego / la tierra
Eleve tu sentido
Deja ya tranquilo
Tu limpio corazón 
2x

Siento vibrar
Toda la tierra
Siento el amor
Que llega desde ella 
2x

4 vezes para todos los elementos'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
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
-- Song: Ayahuasca Cura
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ayahuasca Cura', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ayahuasca Cura}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

https://ninaurku.com/wiki/File:Ayahuascacuramusicamedicina-navegantedepachamama-ivoox2875892.mp3

yarindirindin yarindirindin
yarindirindin yarindirindirindin
yarindirindin yarindirindin
yarindirindin dirindirindirindin

Ayahuasca poderosa
medicina luminosa
shamuycuna kayari
medicina poderosa
mamaicuna y kayari
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

O ku mamaicuna shamuycuna kayari
va curando va limpiando
mamaicuna kayari
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

De la selva, de los cielos
vas pintando van guiando mi familia kayari
De la selva, de la tierra,
va curando, va sanando a mi pueblo kayari
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

yarindirindin yarindirindin
yarindirindin yarindirindirindin
yarindirindin yarindirindin
yarindirindin dirindirindirindin

Ayahuasca poderosa
luminosa milagrosa
reina selva kayari
medicina curandera mamaicuna kayari
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

Yagé ocu, mamaicuna, shamuycuna kayari
mis abuelos voy llamando
taitacuna kayari
curan, curan ya, limpian, limpian ya
curan, curan ya, ya, que limpian, limpian ya

Viene cantando, viene curando
iluminando si viene pintando

Yagé ocu, mamaicuna, shamuycuna kayari
medicina poderosa milenaria kayari
raíz sera milagrosa, profundiza, ciencia antigua puri

Yagé ocu, mamaicuna, shamuycuna kayari
madre selva profundiza mamaicuna kayari
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

aguacito poderoso, vas limpiando
vas cazando shamuycuna kayari
vas guiando ya mi pueblo
taita cuna kayari
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

Yana ho-ha madre selva
curi con tu agua candela medicina shamui
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

Medicina pinta abuelo cielo trueno kayari
Pacamayo turquecero yageoco kayari
Orima poiero vienes pintando
pinta en los cielos curi concu oru manja
cura, cura ya, limpia, limpia ya
cura, cura ya, ya, que limpia, limpia ya

yarindirindin yarindirindin
yarindirindin yarindirindirindin
yarindirindin yarindirindin
yarindirindin dirindirindirindin'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Ayahuasca Urcumanta
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ayahuasca Urcumanta', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ayahuasca Urcumanta}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

 Ayahuasca mama
Taki taki muyki
(X2)

Chullay-Chullay hampikuyni
Miski nunu cuerpo chaita 
(x3)

Ayahuasca lucerito manta....
Ayahuasca Chacrunera....
Ayahuasca pinturera....
Ayahuasca curandera....'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Ayaruna
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ayaruna', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ayaruna}
{artist: Unknown}
{tag: Spanish}
{tag: Medicine Plants}

Ayaruna         [tabaquito, awakolla, ayahuasca]
Yusha y regu 
Naka kumanta 
Shamu ri ri ri ri ri ri ri ri ri ri ri

Ensenañdo Caminito 
De la sinchi 
Medicina nai nai nai nai nai'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Belleza Pura
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Belleza Pura', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Belleza Pura}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Bird}
{tag: Mountain}

Yana heywei ney ney, 
yana heywei ney ney,
yana heywei ney ney,
yana heywei hey wana heyana, 
hey ney yo wey
(2 times)
Aguile del Cielo, Belleza Pura
Belleza Pura, Belleza Pura
Hey wana heyana, hey ney yo wey
(2 times)
Fleur de awacolla, Belleza Pura
Belleza Pura, Belleza Pura
Hey wana heyana, hey ney yo wey
(2 times)
Montaña sagrada, Belleza Pura
Belleza Pura, Belleza Pura
Hey wana heyana, hey ney yo wey
(2 times)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
END $$;
-- Song: Bendice
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Bendice', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Bendice}
{artist: Unknown}
{tag: Water}
{tag: Fire}
{tag: Air}
{tag: Earth}

Bendice la tierra con agua
Bendice la tierra con tu corazón
Bendice la tierra con aire
Y vuela siempre en libertad

Y ábrete y ábrete y ábrete
A la vida y al amor
A la vida y al amor

Bendice la tierra con fuego
Que brille la llama dentro de ti
Bendice la tierra a su gente
Trayendo pura sanación

Y ábrete y ábrete y ábrete
A la vida y al amor
A la vida y al amor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
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
END $$;
-- Song: Brilla un Colibrí
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Brilla un Colibrí', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Brilla un Colibrí}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Bribri bribri bribri bribri, brilla un colibrí (x2) 
En el centro de este fuego, brilla un colibrí (x2) 

Bribri bribri bribri bribri, brilla un colibrí (x2)
Un ave me llevará, un ave nos llevará (x2) (hacia luz) 

Bribri bribri bribri bribri, brilla un colibrí (x2)
En el centro de esta tierra, brilla un colibrí (x2)

Bribri bribri bribri bribri, brilla un colibrí (x2)
Un ave me llevará, un ave nos llevará (x2) (hacia luz) 

Bribri bribri bribri bribri, brilla un colibrí (x2) 
En el centro de tu pecho, brilla un colibrí (x2) 

Bribri bribri bribri bribri, brilla un colibrí (x2)
Un ave me llevará, un ave nos llevará (x2) (hacia luz) 

Bribri bribri brilla brilla, brilla un colibrí (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Caboclo Curador
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Caboclo Curador', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Caboclo Curador}
{artist: Unknown}
{tag: Portuguese}
{tag: Umbanda}

https://www.song-circle.com/world-songs/bejja-flor/caboclo-curador


Chegou chegou o caboclo curador
Ele roda mundo inteiro pra aliviar a nossa dor

Estes caboclo é caboclo verdadeiro
Ele atira sua flecha muito mas alem do mar
Este caboclo é caboclo da jurema
Com seu cocar de pena faz a povo balançar Chegou…

Ele nos tras as curas da floresta
O seu canto e de amor e vem do coração
Nukum mana ibubu ibubu buta
Scauata caiaue caiaue ke ke

Chegou…'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Canta Pajarito
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Canta Pajarito', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Canta Pajarito}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Canta Pajarito, canta pajarito (x2)
Aunque no estes, aunque no estes, aunque no estes a mi lado (x2)

Somos niños medicina, cantandole a la vida (x2)
La musica es nuestra voz y es lo que necesitamos para el amor (x2)

Somos seres de esperanza en tiempos de allianzas (x2)
La musica es nuestra voz y es lo que necesitamos para la paz (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;

-- Song: Canção da Jibóia
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Canção da Jibóia', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Canção da Jibóia}
{artist: Unknown}
{tag: Santa Daime}

 A hey a ho'' pajé assopra
Que me trouxe esta canção foi a jiboia
[2X]

Foi a jiboia que me trouxe esta canção
Para eu cantar e encantar os meus irmãos
[2X]

A hey a ha'' Clan da Jurema
Chega na dança da pisada da onça
A hey a ha'' mata encantada
Eu teu olhar é o da onça pintada

A hey a ha'' mata encantada
Mamãe Jurema, cobras e onças pintadas

A hey a ha'' águia dourada
Chega e balança as penas das suas asas
Das suas asas vem surgindo a mirração
É o instrumento para a transformação 
[2X]

A hey a ha'' me vem ruã
A tuas penas nas asas do meu cocar
A hey a ha'' eu vou voar
No mundo inteiro com a sua forca eu vou curar

[все 2 раза]

A hey a ho'' pajé assopra
Que me trouxe esta canção foi a jiboia

Foi a jiboia que me trouxe esta canção
Para eu cantar e encantar os meus irmãos
[2X]

A hey a ha'' me vem ruã
A tuas penas nas asas do meu cocar
A hey a ha'' eu vou voar
No mundo inteiro com a sua forca eu vou curar'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Santa Daime
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santo-daime';
END $$;
-- Song: Churubia
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Churubia', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Churubia}
{artist: Unknown}
{tag: Bird}
{tag: Spanish}

Deu deu deu, dao dao dao (x2)
Deu deu deu deu, dao dao dao (x2)
Deu deu deu, dao dao dao (x2)
Deu deu deu deu, dao dao dao (x2)

Churubia, churubia
Makinkuna churubia (x4)
Aguila, aguila
Poderosa aguila (x4)

Alconcito cazador
Vives em mi corazón (x2)
Curanderito yari
Poderoso kayari
Luminoso yariri
Mi alconcito ayarindende

Deu deu deu, dao dao dao
...

Churubia, churubia
...

Awacolla bella flor
Vives em mi corazón (x2)
Curanderito yari
Poderoso kayari
Mi San Pedro yaririri
Mi alconcito ayarindende

Deu deu deu, dao dao dao
...'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Colibri
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Colibri', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Colibri}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Yo soy un colibrí, nacido de los rezos del tambor, 
Los colores de mis plumas brillan bañados de luna danzando mi flor (x2) 
Colibrí bri bri, Coli coli colibrí (x4) 

Yo soy un colibrí, mis cantos son mis alas en el viento 
Para adorar a mi reina plateada que los oye desde el firmamento. (x2)
Colibrí bri bri, Coli coli colibrí (x4).'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Colibrí Dorado
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Colibrí Dorado', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Colibrí Dorado}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

 

A nuestro hogar llegó volando
Un Colibrí dorado
Que trajo a nuestro altar
Un nuevo amanecer
x2

La luz se acerca reflejando la alegría
El viento sopla despertando un nuevo día
Y la frescura en la montaña va llevando
La esencia de un Picaflor
Que asciende enamorado'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Como no voy a cantar
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Como no voy a cantar', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Como no voy a cantar}
{artist: Unknown}
{tag: Spanish}

Como no voy a cantar si tengo todo para cantar 
Si tengo luna, si tengo sol, si tengo estrellas, si tengo calor 
Como no voy a danzar si tengo todo para danzar 
Si tengo luna, si tengo sol, si tengo estrellas, si tengo amor 

Como no voy a reír si tengo todo para ser feliz 
Si tengo luna, si tengo sol, si tengo amor en mi corazón 
Túna rarará rairái Tuna raráira nará rairái 
lará naráirai lará nararái rará rairárai rará rairai'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Como te quiero yo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Como te quiero yo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Como te quiero yo}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Fire}
{tag: Air}
{tag: Earth}
{tag: Bird}

Yana heyana yoy, yana heyana yo ianá (x2)
yana heyana yo ianá (x2)

Como te quiero yo, Como te quiero yo-o-o-o (x2) 
Como el agua que fluye libre, agua clarita del manantial. 
Como el viento que canta y sopla en lo profundo del corazón. 
Como te quiero yo, Como te quiero yo-o-o-o (x2) 
Como el fuego que brilla claro, la llama antigua de la creación.
Como la tierra que nace en flores, que llama canta del colibrí. 

Como te quiero yo, Como te quiero yo-o-o-o
Como te quiero yo, así te quiero yo 
Como ese pajarito le canta al cielo cuando nace el sol. (x2) 

Yana heyana yoy, yana heyana yo ianá (x2).
yana heyana yo ianá (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
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
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Corazón de Oro
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Corazón de Oro', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Corazón de Oro}
{artist: Unknown}
{tag: Bird}
{tag: Spanish}

'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Corazón que es lo único que tengo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Corazón que es lo único que tengo',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Corazón que es lo único que tengo}
{artist: Unknown}
{tag: Spanish}

Gran espíritu, gran abuela gran abuelo 
como soy me presento ante ti 
como soy te pido bendiciones 
y agradezco el corazón que has puesto en mi
(bis) 

Cuando vengo nomas vengo, nomas vengo
gran espíritu sabrás a lo que vengo 
a entregar mi corazón, mi corazón 
corazón que es lo único que tengo
(bis)
Corazón que es lo único que tengo (x4)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Corre corriendo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Corre corriendo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Corre corriendo}
{artist: Unknown}
{tag: Spanish}

Corre corriendo, vuela vuelando
Al cerro más elevado yo le vengo a pedir
Una bendición para mi pueblo
De corazón elevado yo le vengo a pedir,
Heya heya hey heya heya ho
Heya heya heya heya heya heya heya ho'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Cura Do Beija-Flor
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Cura Do Beija-Flor', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Cura Do Beija-Flor}
{artist: Unknown}
{tag: Portuguese}

https://www.song-circle.com/world-songs/bejja-flor/cura-do-beija-flor


Coração que vai se abrindo em mil pétalas de flor
Eu te sinto eu te recebo Beija-flor

Nas asas desta pureza tem um brilho encantador
Pode ver aquele que já se entregou

Vem surgindo um amigo no momento escolhido
Pelo mestre que retira o temor

Um presente tão divino fruto de puro carinho
Que revela os tesouros do amor Beija-flor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Cura Sana
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Cura Sana', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Cura Sana}
{artist: Unknown}
{tag: Portuguese}

Oh core ma hai ohore asparuñay 
puremai gente pinta tierra urumanjay 
Y quise manjay o amor azul cielo 
celeste azulejero que viene y pinta (bis) 

Cura cura, sana sana taita celoc be licencial 
Cura cura, sana sana taita celoc ashlepay 

quise manjay urumanjay y gente
cordillera montaña que viene y llega 
Yage yage pinta pinta azulejero
chuma rasca borrachera que viene y pinta (bis)
Cura cura, sana sana…

Oh corre ma hai ohore tra tra y otro 
manjero pinta selva tierra urumanjay
quise manjay o amor azul cielo 
Celeste azulejero que viene y pinta (bis) 
Cura cura, sana sana… 

Oh corre ma hai ohore asparuñay 
purai la gente pintamos cielo, tierra, vida 
Astrocentro mundo, cosmos seres 
interplanetario que llega cura y sana (bis) 
Cura cura, sana sana…'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Cura Santa Cura
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Cura Santa Cura', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Cura Santa Cura}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

Cura cura cura Santa cura (x2)
Cura que aquí llegando
Limpia y va todo aclarando
Lleve cura a mis hermanos
Y también a mis hermanas
Llegue esta fuerza de cura

Cura este es mi cuerpo
Libera todo mi astral
Aclara también mi mente
Poderosa curandera
Fuerza que todo lo crea
Regenera, regenera.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Cuñaq
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Cuñaq', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Cuñaq}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

  y en remolinos 
Hacia nuestras vidas  
x2

De cantar gualinas 
Y a la vez llorando 
Toditas mis penas 
se acabaron 
Pachamama está de fiesta  

Una estrellita 
Que alegre me decía 
Canta cantorcito 
al agüita 
Al agüita madre Cuñaq  
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Danza del sol
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Danza del sol', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Danza del sol}
{artist: Unknown}
{tag: Lakota}
{tag: Sun Dance}

Weya heya he yo weyo heyaha x3 
Weya heyayo weya heyayo 
weyaheyahayo 
Wakantanka onshimalayo 
Wani wachi chale 
Chamu welo omakiayo 
Makakielo he
Weya heya he yo weyo heyaha x3'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Sun Dance
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'danza-del-sol';
END $$;
-- Song: Defuma Com As Ervas Da Jurema
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Defuma Com As Ervas Da Jurema', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Defuma Com As Ervas Da Jurema}
{artist: Unknown}
{tag: Portuguese}

Defuma com as ervas da Jurema
Defuma com arruda e guiné

Benjoim, Alecrim, e alfazema
Ora vamos defumar filhos de fé'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Defuma, defumador
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Defuma, defumador', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Defuma, defumador}
{artist: Unknown}
{tag: Portuguese}
{tag: Umbanda}

Defuma, defumador 
Esta casa de Nosso Senhor 
(x2)
Leva pras ondas do mar 
O mal que aquí possa estar
(x2)



Smudge, smudger 
This house of Our Lord 

Take to the waves 
The darkness that there may be here'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Defuma esta casa
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Defuma esta casa', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Defuma esta casa}
{artist: Unknown}
{tag: Portuguese}
{tag: Umbanda}

Defuma esta casa
Bem defumada
Com a cruz de Deus
Ela vai ser rezada

Eu sou rezador
Sou filho de Umbanda
Com a cruz de Deus
Todo mal se abranda'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Desde los Andes
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Desde los Andes', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Desde los Andes}
{artist: Unknown}
{tag: Mountain}
{tag: Spanish}

Desde los Andes
Bajan los hombres / Vienen mujeres
Traen tu musica, luz y verdad
x2

Huaiaiai huaiaiai huaira, huairitas 
Oye las vozes de lejos venir
x2

Bajan huaipales
Suenan bututus
Oye las vozes de lejos venir
x2

Huaiaiai huaiaiai huaira, huairitas 
Oye las vozes de lejos venir
x2

Desde la montaña
Bajan los hombres/ Veienen mujeres 
Traen tu musica, luz y verdad 
x2

Huaiaiai huaiaiai huaira, huairitas
Oye las vozes de lejos venir
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Deusa (Curawaka)
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Deusa (Curawaka)', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Deusa (Curawaka)}
{artist: Unknown}
{tag: Spanish}

 

[Verso 1]
Eu conheço uma trilha nas montanhas
Que vai até o mar
Entre ondas encantadas
Seguimos no final

Lá na fonte das águas
Mora ela que reza
Do fundo do mar
Que o tempo da claridade vai chegar

[Coro]
A deusa que canta com a sereia
Dança com a baleia
Brilha na Lua cheia

A deusa, alma dela sonha
De a vida colorida
Um novo lindo dia

[Verso 2]
Eu conheço uma trilha na floresta
Que pode nos levar
Atrás do amor e confusão
Aonde existe um lugar


Lá no centro das matas
Mora ela que guarda
O que é verdade
A sabedoria da professora está ali

[Coro]
A jiboia que vem nos ensinar
A criar a própria vida
De amor e alegria

A jiboia que guarda sabedoria
Ela abençoa a minha
O seio da magia

[Ponte]
[cantando sem palavras]

[Verso 3]
Eu conheço um rio antigo
Que sempre cantará
A voz das sagradas frequências
Dentro de você

Lá no fundo das almas
Mora ela que chama
A madrugada
Melodia para o silencioso se escutar


[Coro]
A rainha que mora na água viva
Abre nossa memória
Acorda a fonte divina

A rainha, a alma dela canta
Da vida colorida
Uma nova profecia

[Conclusão]
[cantando sem palavras]

[Verse 1]
I know a trail in the mountains
That goes to the sea
Among enchanted waves
We go on to the end

There, at the source of the waters
Lives she who prays
From the bottom of the sea
That the age of clarity will arrive

[Chorus]
The goddess who sings with the mermaid
Who dances with the whale
Who shines on the full moon

The goddess, her soul dreams
Of a colourful life
Of a gorgeous new day

[Verse 2]
I know a trail in the forest
That can lеad us
To a place behind the lovе and confusion

There, in the centre of the woods
Lives she who keeps
What is true
The teacher''s wisdom is there


[Chorus]
The boa who comes to teach us
To create our own life
Of love and joy

The boa who preserves wisdom
Blesses my breast of magic

[Bridge]
[non-lexical singing]

[Verse 3]
I know an ancient river
That will always sing
The voice of the sacred frequencies
Within you

Deep in our souls
Lives she who summons
The dawn melody
For the silent to hear

[Chorus]
The queen who lives in the living water
Who opens our memory
Who stirs up the divine wellspring'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Eagle Song
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Eagle Song', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Eagle Song}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

 Heya na yo wene yana Heya na yo wene yana Heya na yo wene yana
Heya na hey ney yo wey
L’agila ya va volando L’agila ya va volando L’agila ya va volando (the eagle is already flying)
Heya na yo wey ne yana Heya na yo wey ne yana Heya na yo wey ne yayna
Heya na hey ney yo wey
L’agila ya va cercando L’agila ya va cercando L’agila ya va cercando (the eagle is getting closer))
Heya na yo wey ne yana Heya na yo wey ne yana Heya na yo wey ne yayna
Heya na hey ney yo wey
l’agila ya esta en el fuego l’agila ya esta en el fuego l’agila ya esta en el fuego
saluando los abuelos (the eagle is in the fire greeting the grandfathers)
Heya na yo wey ne yana Heya na yo wey ne yana Heya na yo wey ne yayna
Heya na hey ney yo wey
l’agila ya alsa el vuelo l’agila ya alsa el vuelo l’agila ya alsa el vuelo (the eagle takes flight)
Heya na yo wey ne yana Heya na yo wey ne yayna
Heya na hey ney yo way
L’agila esta volando L’agila esta volando L’agila esta volando (the eagle is flying)
con sus plumas va curando (with his feathers he is curing)
la familia de guerreros (the family of warriors)
wey ne yana wey ney yana wey ne yana wey ney yana
hey ney yo wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Eh Madre, Madrecita
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Eh Madre, Madrecita', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Eh Madre, Madrecita}
{artist: Unknown}
{tag: Spanish}

Oh ney yo
heyo wana heyana ney yo
heyo wana heyana ney yo
heyo wana heyanana
heyo wana heyanana
heyo wana heyanana
X2

Eh Madre, Madrecita
pon tus manos
pon tus manos sobre el agua
El agua yana heyana hey ney yo wey

Oh ney yo
...

Estrellita de la mañana
esperanza del sol
Ipalnemohuani, quida mucho esta familia
quida mucho esta familia
Esta familia de la montaña, de Nina Urku, de Mama Etna, (del Encantada, del Tatewari), de Aya Puma, del Imbabura
heyo wana heyana hey ney yo wey

Oh ney yo'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: El Agua Cambia
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('El Agua Cambia', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: El Agua Cambia}
{artist: Unknown}
{tag: Spanish}
{tag: Air}
{tag: Earth}
{tag: Fire}
{tag: Water}

El agua cambia todo lo que toca, todo lo que toca cambia (2)
Toca, Cambia, todo lo que toca cambia. (2)

El fuego cambia todo lo que toca, todo lo que toca cambia (2),
Toca, Cambia, todo lo que toca cambia. (2)

El viento cambia todo lo que toca, todo lo que toca cambia (2)
Toca, Cambia, todo lo que toca cambia. (2)

La tierra cambia todo lo que toca, todo lo que toca cambia (2)
Toca, Cambia, todo lo que toca cambia. (2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: El Gran Espíritu nos da la Vida
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('El Gran Espíritu nos da la Vida', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: El Gran Espíritu nos da la Vida}
{artist: Unknown}
{tag: Spanish}
{tag: Temazcal}
{tag: Mountain}
{tag: Peyote}

 

El gran espíritu nos da la vida
wo wo wo wo wooo
el gran espíritu nos cuida

He yanaya yana yo we no wo wo
He yanaya yana yo we no wo wo
Gran espíritu de mi corazón
He yana he ne yowe

Y el temazcal es el vientre de mi madre
wo wo wo wo wooo
Temazcalito es el primer aliento

He yanaya yana yo we no wo wo
He yanaya yana yo we no wo wo
Temazcalli de mi corazón
He yana he ne yowe

Y la danza nos fortalece
wo wo wo wo wooo
Y la danza nos da fuerzas

He yanaya yana yo we no wo wo
He yanaya yana yo we no wo wo
Hay la danza de mi corazón
He yana he ne yowe

Montañita danos una visión
wo wo wo wo wooo
una visión pa(ra) nuestra gente

He yanaya yana yo we no wo wo
He yanaya yana yo we no wo wo
Montañita de mi corazón
He yana he ne yowe.

Cura cura peyotito
wo wo wo wo wooo
Eres el rey del desierto 

He yanaya yana yo we no wo wo
He yanaya yana yo we no wo wo
Medicina de mi corazón
He yana he ne yowe.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'temazcal';
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
END $$;
-- Song: Elevo mi canto
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Elevo mi canto', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Elevo mi canto}
{artist: Unknown}
{tag: Spanish}
{tag: Earth}

Elevo mi canto, al cielo yo elevo, elevo mi voz
Busco con fe y con gracias
A la connection
Ay yo busco, a la liberacion

Elevo mi canto, al cielo yo elevo, elevo mi voz
Busco con fe y con gracias
A la connection
Ay yo busco, a la curacion

Ay pachamama, ay madrecita
Mil besos te doy
Porque eres musica, curandera
Mil besos te doy, sanadora
Mil besos te doy

Ay pachamama, ay madrecita
Mil besos te doy
Porque eres musica, curandera
Mil besos te doy, amorosa
Mil besos te doy

Elevo mi canto, al cielo yo elevo, elevo mi voz
Busco con fe y con gracias
A la connection
Ay yo busco, a la liberacion

Elevo mi canto, al cielo yo elevo, elevo mi voz
Busco con fe y con gracias
A la connection
Ay yo busco, a la curacion

Ay pachamama, ay madrecita
Mil besos te doy
Porque eres musica, sanadora
Mil besos te doy, amorosa
Mil besos te doy

Ay pachamama, ay madrecita
Mil besos te doy
Porque eres musica, amorosa
Mil besos te doy, curandera 
Mil besos te doy, sanadora
Mil besos te doy, curandera 
Mil besos te doy'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: En el camino
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('En el camino', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: En el camino}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Ayahuasca}
{tag: Santa Maria}
{tag: Peyote}
{tag: Medicine Plants}

En el camino de mi abuelito tamborsito me encontre (x2)
Y no regresare y no regresare (x3)
Hey yana hey ney yo wey

En el camino de mi abuelito Tabakito me encontre (x2)
En el camino del abuelito San pedriño me encontre (x2)
En el camino del abuelito Peyotito me encontre (x2)
En el camino de la abuelita Santa Maria me encontre (x2)
En el camino de la abuelita Chacrunita? me encontre (x2)
En el camino del abuelito Rapesito me encontre (x2)
En el camino de la abuelita Ayahuasca me encontre (x2)
En el camino de los Niñitos santitos  me encontre (x2)
Y no regresare y no regresare (x3)
Hey yana hey ney yo wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: En el cielo y en la tierra
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('En el cielo y en la tierra', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: En el cielo y en la tierra}
{artist: Unknown}
{tag: Spanish}
{tag: Fire}
{tag: Earth}
{tag: Bird}

En el cielo y en la tierra con el sol y las estrellas
En el cielo y en la tierra, la lunita y las estrellas
Siento el fuego dentro dentro, siento el fuego aquí te encuentro (x2)
Pachamama en este fuego, Pachamama aquí te encuentro (x2)

Vuela vuela aguilita, vuela vuela condorcito 
Vuelan libres por nosotros, miren, cuiden todo todo 
Siento el fuego dentro dentro, siento el fuego aquí te encuentro (x2) 
Pachamama en este fuego, Pachamama aquí te encuentro (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: En la montaña de visión
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('En la montaña de visión', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: En la montaña de visión}
{artist: Unknown}
{tag: Spanish}
{tag: Mountain}

Bre bre bre bre….
Bra bra bra bra…
(x2)

En la montaña de visión rerere
Somos un solo corazón rerere
Latiendo, sintiendo 
(x2)

Bre bre bre bre…
Bra bra bra bra…
(x2)

En la montaña el buscador rerere
Eleva el rezo del amooor
Silencio, interno
(x2)

Bre bre bre bre…
Bra bra bra bra…
(x2)

La medicina del tambor rerere
Suena resuena en mi interior
Vibrando, danzando
(x2)

Bre bre bre bre…
Bra bra bra bra…
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
END $$;
-- Song: En lo profundo de tu corazón
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('En lo profundo de tu corazón', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: En lo profundo de tu corazón}
{artist: Unknown}
{tag: Spanish}

by Juani Aiaruna'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Este fuego
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Este fuego', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Este fuego}
{artist: Unknown}
{tag: Fire}
{tag: Spanish}

Load audioSoundCloudSoundCloud might collect personal data. Privacy PolicyContinueDismiss'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Estrella del Oriente
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Estrella del Oriente', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Estrella del Oriente}
{artist: Unknown}
{tag: Spanish}

Estrella del Oriente
Que nos das su Blanca Luz
Ya es hora que sigamos 
el camino de la Luz

Montaña de Qualtepec
No te podré olvidar
Por que allí fueron lanzadas
Cuatro flechas a luchar'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Eu vou chamar
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Eu vou chamar', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Eu vou chamar}
{artist: Unknown}
{tag: Portuguese}
{tag: Water}

Iemanjá, é a Rainha do mar (x2)
Eu vou chamar, eu vou chamar 
Eu vou chamar a rainha do mar
Eu vou chamar, eu vou chamar 
Eu vou chamar a rainha do mar

Iemanjá, é a Rainha do mar (x2)
Eu vou louvar, eu vou louvar
Eu vou louvar a rainha do mar

Ieeeeeemanjá…. ieeeemanjá
Do fundo das águas das ondas, do mar
La vem minha rainha Mamae Iemanjá

Ieeeeeemanjá…. ieeeemanjá
La vem minha rainha Mamae Iemanjá
Levar o mal corrente
Pro fundo do mar...'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
END $$;
-- Song: Fenix
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Fenix', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Fenix}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Campanas angelicales que ahora vienen subiendo
Mensajes dimensionales que ahora vengo comprendiendo
Campanas angelicales que ahora vienen subiendo
Espacios dimensionales que ahora vengo recorriendo

Pinta dragón, pinta guacamayo, pinta fenix, pinta yage
Pinta ayahuasca, pinta chacrunita, pinta san pedrito
Lleno de poder

Ese fénix viene volando, por los cielos con sus alas
Va despegando levantando vuelo
Iluminando nuestro camino

Sagrada abuela crece
Linda ayahuasca medicina
Linda planta milagrosa
Lleno de luz estrellita de poder

Ilumina nuestro cuerpo
Fenix dorado luminoso
Llévanos en el camino
Donde nadie este perdido

Va fluyendo como el fuego,
Como el aire
Como el agua
Purificando nuestro corazones
Hay mi tierrita viene sonriendo

Chasca nawi awishu
Cura taita killa inti
Huma sacha sairi protector
Hay tabaquito librano del mal

K''anchan naninchis waka hampi
Sai ri ri ri ri ri ri ri,
sai ri ri tra na nay say ri ri
Hay maru hay maru

Hay marulla
Hay marulla'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Flor Das Águas
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Flor Das Águas', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Flor Das Águas}
{artist: Unknown}
{tag: Portuguese}

 Flor das águas
da onde vens, para onde vais
Vou fazer minha limpeza
No coração está meu Pai
x2

A morada do meu Pai
É no coração do mundo
Aonde existe todo amor
E tem um segredo profundo
x2

Este segredo profundo
Está em toda humanidade
Se todos se conhecerem
Aqui dentro da verdade
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Flores en mi camino
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Flores en mi camino', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Flores en mi camino}
{artist: Unknown}
{tag: Spanish}
{tag: Medicine Plants}

 Rererere
Rererere
X2
Arararara
Rerererere
X2
Rerererere
Rerererere
X2
Arararara
Rerererere
X2
Flores, flores, flores en mi camino
X2
Ayauhasca, flores en mi camino
X2
Amor es, amor es, amor es en mi camino
X2
Ayauhasca, amores en mi camino
X2
Rererere
Rererere
X2
Arararara
Rerererere
X2
Ayauhasca-awacolla-wachumita-peyotito-hikurito-san pedrito'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Floresta
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Floresta', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Floresta}
{artist: Unknown}
{tag: Portuguese}

 Floresta calma o meu pensamento
Floresta calma o meu pensamento
A sua paz é a minha ajuda
A sua paz é a minha ajuda

Floresta toque o meu coração
Floresta toque o meu coração
Com o manto verde lindo e tanta proteção
Com o manto verde lindo e tanta proteção

Floresta pura joia da minha alma
Floresta pura joia da minha alma
Eu agradeço para sempre eu sou sua filha
Eu agradeço para sempre eu sou sua filha'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Fluyendo al mar
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Fluyendo al mar', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Fluyendo al mar}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Air}
{tag: Earth}
{tag: Bird}

https://soundcloud.com/sacredvalleytribe/fluyendo-al-mar-cura


La tierra es mi cuerpo, el agua es mi sangre
El aire mi aliento, y el fuego mi espíritu
(x2)
Oooh madre lleva me, tu hijo siempre seré
Oooh madre lleva me, fluyendo al mar
(x2)

La tierra es mi cuerpo, el agua es mi sangre
El aire mi aliento, y el fuego mi espíritu
(x2)
Oooh madre lleva me, tu hijo siempre seré
Oooh madre lleva me, fluyendo al mar
(x2)

El búfalo corriendo, corriendo y fluyendo
el búfalo corriendo hacia al mar
(x2)
Oooh madre lleva me, tu hijo siempre seré
Oooh madre lleva me, fluyendo al mar
(x2)

El aguila volando, volando y fluyendo
el aguila volando hacia al mar
(x2)
Oooh madre lleva me, tu hijo siempre seré
Oooh madre lleva me, fluyendo al mar
(x2)

Оригинал: 

Tierra es mi cuerpo, 
agua es mi sangre, 
aire es mi aliento, 
fuego es mi espíritu'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Força do Rapé
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Força do Rapé', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Força do Rapé}
{artist: Unknown}
{tag: Portuguese}
{tag: Rapé}

 É a força do Rapé
Quero ver quem vai ficar de pé
(x2)

Senta para levantar
O espirito do alto olhar
(x2)

Quem é o eu da questão
É o eu da imensidão
(x2)

Quem desperta faz brilhar
O espirito do alto olhar

Quem desperta faz brilhar
O espirito do alto olhar (x3)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Rapé
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'rape';
END $$;
-- Song: Fuerza Del Copal
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Fuerza Del Copal', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Fuerza Del Copal}
{artist: Unknown}
{tag: Spanish}
{tag: Temazcal}

 Soy de barro y de maíz
soy de Piedra y dentro de mí
fluye lava en mi corazón
que arde con la fuerza del Amor.

Fuerza, fuerza, fuerza,
recibo del copal,
fuerza, fuerza, fuerza,
la fuerza del Jaguar

Salvia, savia planta
dulce aroma vegetal,
limpia mis sentidos,
en el Temazcal

Siendo tierra puedo volar
fusionado con mi ser espiritual
soy de agua multicolor
y fluyo con la fuerza del amor

Fuerza, fuerza, fuerza,
recibo del copal,
fuerza, fuerza, fuerza,
la fuerza del Jaguar

Salvia, savia planta
dulce aroma vegetal,
limpia mis sentidos,
en el Temazcal

Abuelitas piedras ayúdenme a sanar
Abran los caminos de este Temazcal'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'temazcal';
END $$;
-- Song: Gran Espíritu ayuda nuestra gente
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Gran Espíritu ayuda nuestra gente',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Gran Espíritu ayuda nuestra gente}
{artist: Unknown}
{tag: Mountain}
{tag: Spanish}

Gran Espíritu ayuda nuestra gente
Ayúdales en la Montana de Visión
Dales tu calor Dales tu amor
Dales instrucción oh-oh dales purificación'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Grandmother I honor you
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Grandmother I honor you', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Grandmother I honor you}
{artist: Unknown}
{tag: English}
{tag: Water}

Grandmother I honor you, you water is my blood
Every day and every night I give thanks for your love

Grandfather I honor you, you spirit is my guide
Every day and every night I give thanks for my life

Oh wey, oh wey, oh weya ha
Oh wey, oh wey, oh wey
Oh wey, oh wey, oh wey ha
Oh wey, oh wey, oh wey ha'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
END $$;
-- Song: Guerreiro da paz
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Guerreiro da paz', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Guerreiro da paz}
{artist: Unknown}
{tag: Portuguese}

 Eu chamo a força, eu chamo a força eu chamo a força força das pedras para me firmar
Eu chamo a terra, eu chamo a terra eu chamo a terra eu chamo a terra para me enraizar

Eu chamo o vento, eu chamo o vento eu chamo o vento eu chamo o vento vem me elevar
Eu chamo o fogo, eu chamo o fogo eu chamo o fogo eu chamo o fogo para me purificar

Eu chamo a Lua, chamo o Sol chamo as estrelas Chamo o universo para me iluminar
Eu chamo a água, chamo a chuva e chamo o rio Eu chamo todos para me lavar

Eu chamo o raio, o relâmpago e o trovão Eu chamo todo o poder da criação
Eu chamo o mar, chamo o céu e o infinito Eu chamo todos para nos libertar

Eu chamo Cristo, eu chamo Budha Eu chamo Krishna Eu chamo a força de todos orixás
Eu chamo todos com suas forças divinas Eu quero ver o universo iluminar

Eu agradeço pela vida e a coragem Ao universo pela oportunidade 
E a minha vida eu dedico com amor Ao sonho vivo da nossa humanidade

Sou mensageiro, sou cometa, eu sou indígena Eu sou filho da nação do Arco Íris
Com meus irmãos eu vou ser mais um guerreiro Na nobre causa do Inka Redentor

Eu sou guerreiro, eu sou guerreiro e vou lutando A minha espada é a palavra do amor
O meu escudo é a bondade no meu peito E o meu elmo são os dons do meu senhor

Eu agradeço a nossa Mãe e ao nosso Pai E aos meus irmãos por todos me ajudar
A minha glória para todos eu entrego Porque nós todos somos um nesta união

Ñdarei a sã ñdarei a sã ñdarei a sã
Desde o principio todos nós somos irmãos!
Orei ouá Orei ouá Orei ouá
Viva o Poder de todo o universo!'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: He venido aqui
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('He venido aqui', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: He venido aqui}
{artist: Unknown}
{tag: Spanish}

 Yana ha wey nei nei awey yo yana (2)
Yana ha wey nei nei awey yo yana (2)
Hey ana hey ana hei hey yo wey.

He venido aquí buscando flores,
he venido aquí buscando cantos,
busco quetzales de mil colores,
busco alegría y menos llanto.
Hey ana hey ana hey hey yo wei
(x2)

Yana ha wey nei nei awey yo yana (2)
Yana ha wey nei nei awey yo yana (2)
Hey ana hey ana hei hey yo wey.

Como un collar de bellas flores,
como el plumaje de los quetzales,
como una fruta de mil sabores,
como el humo de los copales.
hey ana hey ana hey hey yo wei
(x2)

Yana ha wey nei nei awey yo yana (2)
Yana ha wey nei nei awey yo yana (2)
Hey ana hey ana hei hey yo wey.

Toda mi vida yo me había juzgado
Y en este canto yo me he encontrado
Toda mi vida yo me había juzgado
Y en este canto yo me he encontrado
hey ana hey ana hey hey yo wei
(x2)

Yana ha wey nei nei awey yo yana (2)
Yana ha wey nei nei awey yo yana (2)
Hey ana hey ana hei hey yo wey.

He venido aquí buscando flores
He venido aquí buscando cantos
Busco Quetzales de mil colores
Busco alegrías y menos llantos.
hey ana hey ana hey hey yo wei.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Hermoso espiritu del agua
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Hermoso espiritu del agua', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Hermoso espiritu del agua}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Fire}
{tag: Air}
{tag: Bird}

Mana mai manta tiu chu 
Peguche manta tiumi 
Mana mai manta tiu chu 
Peguche manta tiumi 

Sumak yaku jatari jatari 
Sumak yaku jatari jatari 

Hermoso espiritu del agua, llega ya 
Hermoso espiritu del agua, llega ya 
Curando purificando, llega ya 
Curando purificando, llega ya 

Hermoso pájaro del agua, llega ya 
Hermoso pájaro del agua, llega ya 
Curando purificando, llega ya
Curando purificando, llega ya

Hermoso espíritu del cielo, llega ya 
Hermoso espíritu del cielo, llega ya 
Curando iluminando, llega ya 
Curando iluminando, llega ya 

En el corazón de este fuego soplan ya 
En el corazón de este fuego soplan ya 
Cuatro vientos en el centro soplan ya 
Cuatro vientos en el centro soplan ya 

En el corazón de este fuego brillan ya
En el corazón de este fuego brillan ya 
Siete flechas en el centro brillan ya 
Siete flechas en el centro brillan ya 

En el corazón de este fuego vuelan ya 
En el corazón de este fuego vuelan ya 
La gran águila del cielo vuela ya 
El gran cóndor de los andes vuela ya'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Air
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'air';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Hey ya, hey ya, hey ya ho
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Hey ya, hey ya, hey ya ho', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Hey ya, hey ya, hey ya ho}
{artist: Unknown}
{tag: Vocalization}

Hey ya, hey ya, hey ya ho
Ya hey, ya hey, ya ho
(x2)

Ya hey hey, Ya hey hey ya
Ya hey, ya hey, ya ho
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
END $$;
-- Song: Huey Tonantzin, Tonantzin
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Huey Tonantzin, Tonantzin', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Huey Tonantzin, Tonantzin}
{artist: Unknown}
{tag: Earth}
{tag: Nahuatl}
{tag: Spanish}

Huey Tonantzin, Tonantzin 
Huey Tonantzin
(x2)

Ipalnemohuani, Tonantzin 
Tlatzocamatli, Tonantzin 
(x2)

Huey Tonantzin, Tonantzin 
Huey Tonantzin
(x2)
Eres bien sagrada, Madre Tierra 
Muchas gracias, Madre Tierra
(x2)

(translation)
Huey: Grand 
Tonantzin: Mother Earth 
Ipalnemohuani: The one for whom you live, God 
Tlatzocamatli: Thank you'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
-- Tag: Nahuatl
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'nahuatl';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Icaro Sagrado
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Icaro Sagrado', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Icaro Sagrado}
{artist: Unknown}
{tag: Medicine Plants}

 [Introducción]
Lay
Nay-ni nay-ni
Nay-ni nay-ni nay
Ra-ri na-ri ra-ri nay
Ra-ri nay

Ay
Nay-ni nay-ni
Nay-ni na-ni na-ni
Ra-ri na-ni na-ni nay
Na-ni nay


Ni
Nay-ni nay-ni nay-ni
Na-ri na-ri ra-ri nay
Na-ni sa-ri na-ri nay
Na-ni nay

Ni
Nay-ni nay-ni nay-ni
Nay-ni nay-ni
Nay-ni ni ni ni
Ni-ni

[Verso 1]
Ó poderoso apu, medikuyni
Medikayni marirí, marirí
Ó poderoso apu, Señor, Papa Viento
Brujuruna marirí, marirí

Soplarengue, soplarengue
Coronita tukuy tuku
Marirí, marirí
Limpiarengue cuerpetuyni
Wakisitoyni marirí, marirí, marirí

Yuray, yuray, yuraysito
Sikarunchikuna qallariy marirí
Yuray, yuray, yuraysito
Sikarunchikuna qallariy marirí

[Estribillo]
Ni
Nay-ni nay-ni nay-ni
Na-ri ra-ri na-ri ray
Na-ri ra-ri na-ri ray
Na-ra ni

Ay
Nay-ni nay-ni nay-ni
Nay-ni ra-ri ra-ri
Nay nay nay
Nay nay

[Verso 2]
Ó poderoso apu, medikuyni
Medikayni marirí, marirí
Ó poderoso Señor, Papa Viento
Brujuruna marirí, marirí

Limpiarengue, limpiarengue cuerpetuyni
Wakisitoyni marirí, marirí
Soplarengue, soplarengue
Coronita tukuy tuku
Mankuynanta marirí, marirí

Yuray, yuray, yuraysito
Sikarunchikuna
Qallariy marirí
Yuray, yuray, yuraysito
Sikarunchikuna
Qallariy marirí

Limpiarengüe, limpiarengüe
Cuerpuytuyni [?]
Marirí, marirí

Soplarengue coronita
Tukuy tuku mankuynanta
Marirí, marirí-ri-ri
-i-i-i-i-i-i marirí

Marirí'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: Inti Raymi
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Inti Raymi', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Inti Raymi}
{artist: Unknown}
{tag: Spanish}

 

Rama que cayó 
este fuego la quemó 
Mariposa de ceniza 
por el aire se voló

Palabras llevó 
la luna las escuchó
Ya su corazón de plata 
la sirena le cantó

Búho cuéntalos
la historia del sembrador
que en el vientre de la noche
cuatro rumbos cosechó

Solo ya llegó 
Sinchi Runa  que bailó
Con el agua d''Inti Raymi
y la flor del tiempo abrió

Abuelito que 
caminó el sendero a pie
recogió del inframundo
piedras del amanecer

Viene dal clavel
los encantos del lugar 
Alma vientre noche oscura 
le enseñaron a cantar

Waira, Chamuré
Condor, aguila, yage
lucero de la mañana 
mira lo que me encontré

Cráneos sin clavel
ya na tabaco y yagé
Y una noche de camino
mira conqo Chamure

Rama que cayó 
Este fuego la quemó 
Mariposa de ceniza 
por el aire se voló

Palabras llevó 
La luna las escuchó
Ya su corazón de plata 
la sirena le cantó

Búho cuéntalos 
la historia del sembrador
que del vientre de la noche
cuatro rumbos cosechó

Solo ya llegó 
Sinchi Runa que bailó
Con el agua d''Inti Raymi
y la flor del tiempo abrió'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Inti Taitiku
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Inti Taitiku', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Inti Taitiku}
{artist: Unknown}
{tag: Quechua}
{tag: Earth}
{tag: Sun}
{tag: Moon}

https://ninaurku.com/wiki/File:Inti_Taitiku.mp3

Inti Taitiku Quilla Mamita
Alpa Mamita Jachiguay

Hauan hua ya 
Hauan hua ya 
Hauan hau ya 
Jachiguay'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Quechua
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'quechua-kichwa';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
-- Tag: Sun
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sun';
-- Tag: Moon
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'moon';
END $$;
-- Song: Invisible
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Invisible', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Invisible}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Ayahuasca}
{tag: Medicine Plants}

Invisible es mi camino y en él soy muy sagrado E-, ∆, G, ∆, E-, ∆, G ∆ = D6/F#
 y en él tengo el poder de sanar nuestra gente ∆, E-, ∆, G, ∆, E-, ∆, G

 Invisible es mi destino y en el soy muy sagrado ∆, E-, ∆, G, ∆, E-, ∆, G
 y en él tengo el poder de cambiar nuestra mente ∆, E-, ∆, G, ∆, E-, ∆, G

 Mis abuelos medicinas todos muy sagrados ∆, E-, ∆, G, ∆, E-, ∆, G
 tienen el poder de sanar nuestra gente ∆, E-, ∆, G, ∆, E-, ∆, G

 Mis abuelas medicinas todas muy sagradas ∆, E-, ∆, G, ∆, E-, ∆, G
 tienen el poder de sanar nuestra gente ∆, E-, ∆, G, ∆, E-, ∆, G

 Ayahuasca medicina, eres muy sagrada ∆, E-, ∆, G, ∆, E-, ∆, G
 tienes el poder de sanar nuestra gente ∆, E-, ∆, G, ∆, E-, ∆, G

 Chacrunita medicina... ∆, E-, ∆, G, ∆, E-, ∆, G
 Toecito medicina... (Floripondio)
 Wachumita medicina... (San Pedro)
 Nakaykuna medicina... (Honguitos)
 Jicurito Medicina... (Peyote)
 Mama Coca medicina...
 Mama Wilca medicina... (Yopo)
 Tayta Sairi medicina, es el más sagrado (Tabaco)
 tienes el poder de enseñar medicina'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: Invocar a Dios
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Invocar a Dios', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Invocar a Dios}
{artist: Unknown}
{tag: Spanish}
{tag: Sun}
{tag: Santa Maria}
{tag: Earth}

Con esta Santa Maria voy a invocar a Dios (x2)
Viva este poder, viva este saber (x2)

Yo sigo caminando por la vida con valor (x2)
Porque llevo a Dios aquí en el corazón (x2)

Cantemos con alegria alabando a la creación (x2)
Viva a Pachamama y viva el Taita Sol (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Sun
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sun';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
END $$;
-- Song: Ivan’s Medicine Song
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ivan’s Medicine Song', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ivan’s Medicine Song}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Ayahuasca}
{tag: Peyote}
{tag: Medicine Plants}

Cuand(o) escucho el tambor d’ agua
y también la sonajita
Es que aqui hay medicina
De la gente pa(ra) mi gente

Vuela vuela vuela he-ee-ee
Vuela vuela vuela ha-aa-aa
(X2)

Hikuri, ayahuasca
San Pedro, Coca
Los niñitos medicina
De la gente pa mi gente

Vuela vuela vuela he-ee-ee
Vuela vuela vuela ha-aa-aa
(X2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: Jardincito Curandero
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Jardincito Curandero', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Jardincito Curandero}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Rerererererere
Rarararararara
Rerererererere
Rarararararara

Me conta-ron mis abue-los que la montaña desde lejos nos cantaba
Y un día cuando enten-dieron fueron a ver lo que ella les mostraba
Jardincito curan-dero con todos los colores de el cielo
Y un abuelito soñador señalando el camino

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Breu breu Nai nai nai nai

Y Volando alto en el cielo hay 
un aguila alegre que cantaba

Agida agidada
Agidada agide
Agida
Agide

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Breu breu Nai nai nai nai

Pajarito do-rado po-deroso curandero 
Mués-tranos como volar al camino verdadero
Un caminito curan-dero a través  las venas de la tierra 
como las venas de mi corazón den-tro de todo mi amor.

Flores de la vida y de la sanación 
Te queremos tanto gracias por tu medicina
Ay lunita de mis cielos ilumi-na
Mi camino, con tu luz enamorada
Guíame hasta la bella entrada ya
Deja que camine hasta mi bella amada
Donde mi aguacolla en el centro está 
curándome y amándome por la eternidad

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Breu breu Nai nai nai nai

Y Volando alto en el cielo va 
un cóndor alegre que amaba

Agida agidada
Agidada agide
Agida
Agide

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Breu breu Nai nai nai nai'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Kandjekere
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Kandjekere', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Kandjekere}
{artist: Unknown}
{tag: Medicine Plants}
{tag: Ayahuasca}

4х
Kandjekere kandjekere 

4х
More seu seu, more seu seu, more seu seu
 
4х
Batche korava, Batche korava 
 
4х
A tsa cho pei na te, o ne, te o ne
 
4х
Te o ne Te o nee Te o nee'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Karas Karas
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Karas Karas', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Karas Karas}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Karas Karas kurikingue (x2)
Allpakaraspi kurikingue (x2)
Karas Karas kurikingue (x2)

Karas Karas kurikingue (x2)
Jampi pakari kurikingue (x2)
Karas Karas kurikingue (x2)

Karas Karas kurikingue (x2)
Killa pakari kurikingue (x2)
Karas Karas kurikingue (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Kas ten po mano sodelį vaikščiojo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Kas ten po mano sodelį vaikščiojo',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Kas ten po mano sodelį vaikščiojo}
{artist: Unknown}
{tag: Lithuanian}

 '
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lithuanian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lithuanian';
END $$;
-- Song: Keros (Canto alla Montagna)
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Keros (Canto alla Montagna)', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Keros (Canto alla Montagna)}
{artist: Unknown}
{tag: Italian}
{tag: Mountain}

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai


Io vengo dalla montagna dove il sílenzio mi parla
Io vengo dalla montagna dove la pietrá mi canta
Dove la Mamma Coca mi segnala il destino
Dove il tuono ed il lampo illumínano il cammino

Io vengo della montagna dove il sílenzio ci parla
Io vengo della montagna dove la pietrá ci canta
Dove la Mamma Coca ci segnala il destino
Dove il tuono ed il lampo illuminano il cammino

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai


Andiamo sulla Montagna camminando senza fretta 
Là in cima c''è un''anziano medicina che ci aspetta 
Dove la laguna è il riflesso del tuo cuore 
Dove la memoria è la fiamma dell''amore 

Andiamo sulla Montagna camminando senza fretta 
Là in cima c''è un''anziana medicina che ci aspetta 
Dove la laguna è il riflesso del tuo cuore 
Dove la memoria è la fiamma dell''amore 

Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai
Trainai nai nai nai nai'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Italian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'italian';
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
END $$;
-- Song: Kola, lecel lecun wo hey
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Kola, lecel lecun wo hey', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Kola, lecel lecun wo hey}
{artist: Unknown}
{tag: Lakota}
{tag: Sacred Pipe}

Kola, lecel lecun wo x3 hey 
Hecanun kin Nitunkasila  
Wanniyanguktelo hey 
Cannunpa wanji yuha ilotake cin  
Miksuye opagi yo hey 
Hecanun kin taku yacin kin  
Iyecetuktelo hey  
 
Kola, lecel lecun wo x3 hey 
Hecanun kin Nitunkasila  
Wanniyanguktelo hey 
Hocoka wanji yuha ilotake cin  
Miksuye opagi yo hey 
Hecanun kin taku yacin kin  
Iyecetuktelo hey  
 
 
Friend, do this this way  
When you do, your Grandfather  
Will come to see you  
When you sit with the one Cannunpa   
(When you sit with the one in the Centre) 
Remember me when you fill it  
When you do, what you need  
Will become so'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Sacred Pipe
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sacred-pipe';
END $$;
-- Song: La Anaconda
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('La Anaconda', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: La Anaconda}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

 

Haaaaaaay, habla la anaconda, canta la anaconda
Habla la anaconda y es la voz de mi abuelo
Yageee, yageee

Sueña la maraca y el abuelo canta
Sueña la maraca y el abuelo danza
Yageee, yageee

Haaaaaay aquí está su medicina
Poderosa medicina
Para ver, para ver

Haaaaay, hagamos reverencia
que ya llego el abuelo
Poderoso abuelo
Amoroso abuelo
Yageee, yageee'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: La canzone del Grano
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('La canzone del Grano', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: La canzone del Grano}
{artist: Unknown}
{tag: Italian}

Testo: Bruno Tognolini
Musica: Maggie Pitzalis


Trai nai-nai nai-nai nai
Nai-nai nai-nai nai-nai
Nai-nai nai-nai nai-nai
nai-nai nai-nai nai-nai nai-nai

Nai-nai nai-nai nai-nai
Nai-nai nai-nai nai-nai
Nai-nai nai-nai nai-nai
Nai-nai nai-nai nai-nai nai-nai

Cantano Cicale, Volano Farfalle
Spuntano le Spighe e Babbo Sole le fa Gialle
Cavallette Saltano, l''uomo falcia il Grano
Gocce di sudore che si asciuga con la Mano (гочче ди судоре ке ся ашьюга кон ля мано)

Acqua, Sole e Sale
Vento asciuga i Giorni
Grano nel Mulino e primo Pane dentro i Forni
Grano Saporito d’Acqua Sole e Sale
Pane Colorito di Farfalle di Cicale'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Italian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'italian';
END $$;
-- Song: La luz del bosque
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('La luz del bosque', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: La luz del bosque}
{artist: Unknown}
{tag: Spanish}

https://soundcloud.com/shiramekudeshet/la-luz-del-bosque


Somos la luz del bosque, espíritu de todas edades (x2) 
Somos la luz divina, sabiduría de los mares (x2) 
Transformamos el dolor trayendo todo a la luz (x2) 
Con el espíritu de la abuelita cantando toda la noche 
Con la ayuda de la madrecita cantando toda la noche'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Leti sokole
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Leti sokole', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Leti sokole}
{artist: Unknown}
{tag: Bird}
{tag: Croatian}

By Petra Luman Pakari


Traj naj naj naj naj naj naj 
Traj naj naj naj naj naj naj
(x2)

Traj naj naj naj naj naaaaaj
Traj naj naj naj naaaaaj
Traj naj naj naj naaaj naj
Traj naj naj naj naj naj naj 
Traj naj naj naj naj naj naj

Leti, leti sokole, 
Leti, leti sokole 
(x2)

Leti, leti sokoleeeee
Leti sokolee
Leti leti sokole
Leti leti sokole
E moj sokole

U sedam smjerova poleti 
Moju molitvu ponesi, 
U sedam smjerova poleti
Moju molitvu ponesi.

Tvojim očima da gledam,
Tvojim krilima da letim, 
tvojim srcem ja da kucam, 
tvojim perom sve iscijelim.


Traj naj naj naj naj naj naj 
Traj naj naj naj naj naj naj
(x2)

Traj naj naj naj naj naaaaaj
Traj naj naj naj naaaaaj
Traj naj naj naj naaaj naj
Traj naj naj naj naj naj naj 
Traj naj naj naj naj naj naj

Sleti, sleti sokole
Sleti sleti sokole
(x2)

Sleti sleti sokole
Sleti sokoleee
Sleti sleti sokole
U ovu vatru sokole
E moj sokole

Donesi nam darove, 
Učenje sa planine 
Donesi nam darove
Vizije i buđenje

Tvojim očima sad gledam, 
tvojim krilima ja letim
Tvojim srcem ja sad kucam, 
tvojim perom sve iscijelim.

Traj naj naj naj naj naj naj, 
traj naj naj nja najnnaj naj
Traj naj naj naj naj naj naj
Traj naj naj naj naj naj naaj
Traj naj naj naj naj naaaaj 
traj naj na na naaaaa
Traj naj naj naj nanaaa
Traj naj naj naj naj naj naj
Traj naj naj naj naj'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
-- Tag: Croatian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'croatian';
END $$;
-- Song: Libero
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Libero', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Libero}
{artist: Unknown}
{tag: Spanish}

Libero, libero, libero
libero, libero me
disuelvo, disuelvo, disuelvo
disuelvo, disuelvo me

Y elevo, y elevo, y elevo
elevo, elevo me
Camino, camino, camino
camino, con mucha fe

Mi padre, y mi madre, me guían
Hacia el centro de mi ser
Confio, confio, confio
Confio en que todo es'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Lobos de la tribu
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Lobos de la tribu', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Lobos de la tribu}
{artist: Unknown}
{tag: Spanish}

 
Curawaka*


[Intro]
One, two, three four

En la noche
Cuando la luna
Como plata
Se eleva
Ilumina las selvas
Y también las praderas

Viejos lobos de la tribu
Cantarón al espíritu
Al espíritu del fuego
[2x]

[Coro]
Awa''wa''wa
Muy a ni mi
Awa''wa''wa
Luna yani
[2x]

Ani''qu ni''
Ani''qu ni''
Ani''qu ni''
Ani''qu ni''

Hai hai hai nika hai chawu’nai 
Hai hai hai nika hai chawu’nai 
Hai hai hai nika hai chawu’nai 
Hai hai hai nika hai chawu’nai 

Ay Ani''qu ni''
Muy ani
Ay Ani''qu ni''
Muy ani''

[Puente]

[Coro]
Awa''wa''wa
Mu ya ni mi
Awa''wa''wa
Luna yani
[2x]

Cuando brilla mama killa lunita
Se encanta el corazón
Tribu de la tierra
Cantando el viento
Bailando el corazón

Cuando brilla mama killa lunita
Se encanta el corazón
Tribu de la tierra
Cantando el viento
Bailando el corazón

[Break]

En la noche
Cuando la luna
Como plata
Se eleva
Ilumina las selvas
Y también las praderas

Viejos lobos de la tribu
Cantarón al espíritu
Al espíritu del fuego

[Coro]
Awa''wa''wa
Muy a ni mi
Awa''wa''wa
Luna yani
[2x]

Cuando brilla 
Mama killa lunita
Se encanta el corazón
Tribu de la tierra
Cantando el viento
Bailando el corazón

Cuando brilla 
Mama killa lunita
Se encanta el corazón
Tribu de la tierra
Cantando el viento
Bailando el corazón

[Conclusión]
[El sonido del aullar como lobos]

 *“Lobos de la tribu” is based on a variation of “Ani’qu ne’chawu’nani”, an Arapaho Ghost-Dance song. A number of versions of “Ani’qu ne’chawu’nani” have been performed over the years, including a basic form that has been taught to countless schoolchildren. One version introduced Spanish lyrics; Curawaka’s recording is a variation of the Spanish-lyric version. Theirs is unusual in that it alters or omits most of the Arapaho lyrics and phrasing. Compared with Mirabai Ceiba’s version—"Ani Couni“, which was released two years prior—"Lobos de la tribu” sounds like a more uptempo remix.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Madre Ayahuasca (Mireia)
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Madre Ayahuasca (Mireia)', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Madre Ayahuasca (Mireia)}
{artist: Unknown}
{tag: Ayahuasca}
{tag: Spanish}

Madre Ayahuasca
Aquí están tus hijos
Hoy hemos venido
Para estar contigo

Madre Ayahuasca 
Aquí están tus hijas
Hoy hemos venido 
Para estar contigo

Madre Ayahuasca
Curación espíritu (?)
Para mis hermanos 
Que hoy están conmigo

Madre Ayahuasca
Curación espíritu (?)
Para mis hermanas 
Que hoy están conmigo

Madre Ayahuasca
Muestra nos caminos
Pintando visiónes 
Con un buén destino

Madre Ayahuasca
Muestra nos caminos
Pintando visiónes 
Con un buén destino

Madre Ayahuasca
Muy agradecidos
Santa Medicina
Que cura la tribu

Madre Ayahuasca
Muy agradecidas
Santa Medicina
Que cura la tribu'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Madre Ayahuasca
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Madre Ayahuasca', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Madre Ayahuasca}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

Madre ayahuasca, llévame, hacia el sol
De la savia, de la tierra, hazme beber
Llévame contigo hacia el sol
Del sol interior, hacia arriba
Hacia arriba subiré, a mi padre llegare

Madre ayahuasca, llévame, hacia el sol
Tómame, háblame, enséñame
Enséñame a ver, a ver más allá

A ver el hombre dentro del hombre
A ver la mujer dentro de la mujer
A ver el sol dentro y fuera de todo, madre, maaadre

Madre ayahuasca, llévame, hacia el sol
Toma mi cuerpo y hazme vibrar
Toma mi cuerpo, hazme brillar

Con brillo de estrellas, con calor de sol
Con luz de luna y fuerza de tierra
Con luz de luna y calor del sol, Madre'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Madre Tierra Temazcal
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Madre Tierra Temazcal', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Madre Tierra Temazcal}
{artist: Unknown}
{tag: Spanish}
{tag: Air}
{tag: Earth}
{tag: Fire}
{tag: Water}
{tag: Temazcal}

 En este vientre madre tierra temazcal,
las gracias hoy le vengo a dar (2).

Fuego sagrado abuelo Huehuetéotl,
gracias le doy por tu calor (2).

Agua sagrada Haramara yo le doy,
las gracias doy las gracias doy (2).
Al aire aliento sagrado movimiento,
gracias le doy por respirar (2).

En este vientre madre tierra temazcal,
las gracias hoy te vendo a dar.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Temazcal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'temazcal';
END $$;
-- Song: Manachu
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Manachu', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Manachu}
{artist: Unknown}
{tag: Spanish}
{tag: Water}

Re re re re re re re re re
Ra ra ra ra ra ra ra ra ra
Re re re re re re re re re
Ra ra ra ra ra ra ra ra ra

Por ese cerrito nevado
por ese cerrito nevado
ya va bajando un venado
ya va cantando un venado
Manachuuuuu

Por ese cerrito nevado
por ese cerrito nevado
vamos a cantarle al venado
vamos a cazar un venado
Manachuuuuu

El agua va por la corriente 
El agua va por la quebrada 
El agua va por la cuchilla 
El agua va por la serranía 
Manachuuuuu

Tu te vas por la corriente 
Tu te vas por la quebrada 
Yo me voy por la cuchilla 
Yo me voy por la serranía 
Manachuuuuu

Re re re re re re re re re
Ra ra ra ra ra ra ra ra ra
Re re re re re re re re re
Ra ra ra ra ra ra ra ra ra'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Mariri
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mariri', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mariri}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Ayahuasca}
{tag: Santa Maria}
{tag: Peyote}
{tag: Earth}
{tag: Medicine Plants}

(Clarita)

Ding ding ding ding ding ding ding ding ding ding ding ding ding ding
Ding ding ding ding ding ding ding ding ding ding ding ding ding ding
Ding ding ding ding ding ding ding ding ding ding ding ding ding ding 
Ding ding ding ding ding ding ding ding ding ding ding ding…

Ayahuasca* supai kaya puntai mantai mari (x2)
Medicina* supai kaya puntai mantai mari (x2)
Ay maririri maririri maririri ri ri ri ri

Chacrunita / Pinturera
Tabaquito / Taita Sayri 
Wayucito / Medicina
Aguacolla / San Pedrito / Wachumito
Peyotito / Hicurico
Mama Coca / Coca mama
Pachamama / Tierra tierra / Madrecita
Cielo cielo / Padrecito
Otorongo / Tigre negro
Anaconda / Boa boa
Tarantura / Tarantura
Ayahuasca / Medicina
Tabaquito / Taita Sayri

Ding ding ding…'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
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
END $$;
-- Song: María Magdalena
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('María Magdalena', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: María Magdalena}
{artist: Unknown}
{tag: Spanish}

Rosa María, Wasi Rupangi 
Rosa María, Wasi Rupangi 
María Isabelita. shamuy kuna 
Pinta poderosa, ay kayari

María Magdalenita, ay shamuy kuna 
Pinta poderosa kayariri 
Cotacachi manta, shamuy cuna 
pinta poderosa, shamuy kayari

María Isabelita shamuy kuna..
Pinta poderosa, ay kayari

María Magdalenita, ay shamuy kuna 
Pinta poderosa kayariri'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Mazatl
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mazatl', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mazatl}
{artist: Unknown}
{tag: Spanish}
{tag: Nahuatl}

 Mazatl mazatl mazatl mazatl (deer)
maza maza maza maza huella (paw print) (the deer is trotting)
correle benadito correle benadito correle benadito (run deer run)
donde esta tatewaria (where grandpa fire is at)
herica herica herica si (gourd of the huichole, they drink the peyote from)
herica herica herica si
herica si herica si
maza maza maza huella (paw of the deer)
tan lindo mazatl tan lindo mazatl tan lindo mazatl si (such a beautiful deer, yes)
tan lindo mazatl tan lindo mazatl tan lindo mazatl si
maza maza maza maza huella
a la luz de rio vas (he is going to the light of the river)
a su lado fuego (at his side is the fire)
a su lado viento (at his side is the wind)
maza maza maza huella
pura para pompwei pura para pompwei
(pura pecha - people who hunt the deer)
pura pompeche pura pompeche
maza maza maza huella




Load audioSoundCloudSoundCloud might collect personal data. Privacy PolicyContinueDismiss

https://floricantos.com/88-el-venadito


Hare bumbu yaya wue, hare bumbu yaya wue 
Mazatl Mazatl ?teca?, 
Mazatl Mazatl ?teca?
Mazatl Mazatl, 
Mazatl Mazatl wueeeee 

Al lado de un rio esta, 
bebiendo su agua ya  
Por un lado tierra, 
por un lado fuego  
Arriba viento, 
viento viene y va  

Mazatl Mazatl, 
Mazatl Mazatl  
Mazatl Mazatl, 
Mazatl Mazatl wueeeee  

Correle venadito
Correle venadito  
Correle a las montanas
Correle a las montanas
Donde esta ~ a la Tata Tatewari  

El venado, 
el venado 
de corazón sagrado  
Mazatl Mazatl, 
Mazatl Mazatl  
Mazatl Mazatl, 
Mazatl Mazatl wueeeee'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
END $$;
-- Song: Media Luna
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Media Luna', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Media Luna}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Fire}
{tag: San Pedro}
{tag: Medicine Plants}

Media Luna Madre Tierra,
tu que abrazas y sostienes y levantas con amor
este Fuego buen sagrado, siete flechas en el centro arden en su corazón

Brilla y arde en la Media Luna, 
luminoso poderoso Fuego en mi corazón (x2)

Abuelo Viento poderoso aliento
Tu que llevas las fragancias y que traes la claridad  (x2)
Canta y danza en la Media Luna
Luminoso poderoso aliento en mi corazón (x2)

Ay Agüita luminosa, brilla en el cuerpesito vibra vibra en el Tambor  (x2)
Brilla y vibra en la Media Luna, luminosa poderosa Agüita en mi corazón (x2)

Media Luna de mi corazón Montanita bien Sagrada,  Camino del Buscador (x2)

Tu levantas las Medicinas
Awacolla curandero mi San Pedro Poderoso
Tu levantas las Medicinas
Tabaco curandero la palabra de mi pueblo

En ti  viven los Abuelos , ellos llevan el misterio de el Agüita vertical
En ti danzan las Abuelas, ellas llevan el misterio de el Agüita horizontal

Cantan y danzan los Ancestros
Luminosos poderosos ancestros en mi corazón (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: Medicina que trae los cielos
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Medicina que trae los cielos', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Medicina que trae los cielos}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

Medicina que trae los cielos desde la floresta a mi corazón  (x2)
Alumbrando camino trayendo liberación  (x2) 
Doy gracias a todos los seres maestros divinos de redención  (x2) 
Humildad y paciencia enseñan la compasión  (x2) 
Aquí pido por todos los seres desamparados y sin protección  (x2) 
Ofreciendo este canto desde el fondo de mi corazón  (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Mensageiro Beija Flor
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mensageiro Beija Flor', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mensageiro Beija Flor}
{artist: Unknown}
{tag: Portuguese}

 

Venho lá da floresta
O meu canto é de amor
Sou um índio mensageiro
Mensageiro do amor              
x2

Ehehe ehehe ehehehehe   
Ehehe ehehe ehehehehe   

Peço à mãe Rainha
Toda hora todo dia
Para trazer a cura
E a nos dar muit(a) alegria       
x2

Ehehe ehehe ehehehehe
Ehehe ehehe ehehehehe

No meio da floresta 
junto com os meus irmãos
Vou falar com o coração
Essa é a minha tradição         
x2

Ehehe ehehe ehehehehe
Ehehe ehehe ehehehehe   

Venho lá da floresta
O meu canto é de amor
Sou um índio mensageiro
Mensageiro beija-flor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Mi San Pedro de la laguna
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mi San Pedro de la laguna', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mi San Pedro de la laguna}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Fire}
{tag: San Pedro}
{tag: Bird}

(M mujeres, H hombres)

M	Ri ri ri ri ri ri ri ri ri 
H	Re re re re re ra ra ra...

M	Mi San Pedro de la laguna 
H	Mi San Pedro de la laguna 
M	Mi San Pedro ay shamuy kuna 
H	Mi San Pedro ay shamuy kuna 
M	Mi San Pedro de la montaña 
H	Mi San Pedro de la mañana 
M	Mi San Pedro de la pradera 
H	Mi San Pedro de la laguna

M	Eres mi abuelo yariri 
H	Mi curandero kayari 
M	Eres mi abuela yariri 
H	Mi curandera kayari

M	Ri ri ri ri ri ri ri ri ri 
H	Re re re re re ra ra ra…

M	Mi halconcito de la laguna 
H	Mi halconcito de la laguna 
M	Mi halconcito ai shamuy kuna 
H	Mi halconcito ai shamuy kuna 
M	Mi halconcito de la montaña 
H	Mi halconcito de la mañana
M	Mi halconcito de la pradera
H	Mi halconcito de la laguna

M	Eres el fuego kayari,
H	Eres el agua yariri.
M	Los cuatro vientos kayari.
H	Mi madre tierra yariri... ri

M	Ri ri ri ri ri ri ri ri ri 
H	Re re re re re ra ra ra…'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Mira como cura el agua
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mira como cura el agua', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mira como cura el agua}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: Fire}

Mira como cura el agua
Va lavando como un río
Mira como cura el aire
Va cantándote al oído

Mira como cura el fuego
Va quemándote el olvido
Como la tierra levanta
Oí su canto tan dolido

Que el Wilkamayu traiga las notas para que alegres tu corazón
Que el Apu Linli todas las tardes venga soplando su bendición
Que el Ch''eqta Qaqa venga trayendo al padre rayo que enseñará
Que Mama Ñusta viene cuidando a mis hijitos en la oscuridad

Mira como cura el agua
Va lavando como un río
Mira como cura el aire
Va cantándote al oído

Mira como cura el fuego
Va quemándote el olvido
Como la tierra levanta
Tu corazón tan dolido

Que el Wilkamayu traiga las notas para que alegres tu corazón
Que el Apu Linli todas las tardes venga soplando su bendición
Que el Ch''eqta Qaqa venga trayendo al padre rayo que enseñará
Que Mama Ñusta viene cuidando a mis hijitos en la oscuridad'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
END $$;
-- Song: Mira todo lo que me encontré
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mira todo lo que me encontré', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mira todo lo que me encontré}
{artist: Unknown}
{tag: Spanish}

Rarararai rarai rai ra rarararai
rerararai rarai rai rai rararara
rarararai rarai rai ra rararara
rerararai rarai rai rai rararara

rarararai rarai rai ra
rarararai rarai rai rai rairarara
rarararai rarai rai ra
rarararai rarai rai rai rairarara
rarararai rarai rai rai rairarara


Mira todo lo que me encontré
En el camino de mi familia
Mira todo lo que me encontré
En el camino de mi corazón
Mira que ya encontré
Es el agüita de mis amores
Mira que ya encontré
La medicina de bellas flores
La medicina de los corazones

Rarararai rarai rai ra rarararai...

Mira todo lo que me encontré 
En el camino de mi familia
Mira todo lo que me encontré
La mariposa de bellos colores
Mira que ya encontré
El aguacolla de mis amores
Mira que ya encontré
El tabaquito de bellas flores
La medicina del picaflor

Rarararai rarai rai ra rarararai...

Que el viento nos acompañe 
En la montaña de la vision
Que el agua nos cuide 
Desde el cielo en la laguna
Que el fuego nos  calor
Con su luz y su amor
Que la tierra nos alimente 
Con sus frutos y bendiciones
Con sus frutas y sus amores

Rarararai rarai rai ra rarararai...'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Mother earth I am praying to you
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Mother earth I am praying to you',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mother earth I am praying to you}
{artist: Unknown}
{tag: English}
{tag: Fire}
{tag: Air}
{tag: Earth}
{tag: Bird}

Mother earth, I am praying to you (x3)
all my life, all my life
Hey una heyana, hey yana heyana (x3)
oh wey, oh wey

Father sky, I am praying to you (x3)
all my life, all my life
Hey una heyana, hey yana heyana (x3)
oh wey, oh wey

Sacred fire, I am praying to you (x3)
all my life, all my life
Hey una heyana, hey yana heyana (x3)
oh wey, oh wey

Family, I am praying to you (x3)
all my life, all my life
Hey una heyana, hey yana heyana (x3)
oh wey, oh wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
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
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Mulheres de força
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mulheres de força', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mulheres de força}
{artist: Unknown}
{tag: English}
{tag: Portuguese}
{tag: Women}

 Mulheres de força, mulheres de luz
Mulheres de força acompanham Jesus
E a força de oxum, sou as forças de oxum
E a força de oxum, sou as forças de oxum

Esta força te centra, esta forca te leva
Tenha fé en esta força, chega e lai tentre
A ya força de oxum sou as forças de oxum
E a força de oxum sou as forças de oxum

E meu protectora, mulher celadora
Firmeza na menti, ya doçura presente
E a força de oxum, sou as forças de oxum
E a força de oxum, sou as forças de oxum'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Women
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'women';
END $$;
-- Song: Mãe d´ água
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Mãe d´ água', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Mãe d´ água}
{artist: Unknown}
{tag: Portuguese}
{tag: Water}

Oh Mãe D´ Água, Oh Mãe D´ Água
Oh Mamãe Oxum

Corrente de água, Fluindo limpando
A todos que precisam da luz

Corrente de água, Fluindo limpando
A todos que precisam da luz

Com Senhor São Miguel, Arcanjo Rafael
Emmanuel, Gabriel todos anjos do céu

Flor das águas, flor das águas
Flor de mamãe Oxum

Água Cristal, Lava clareia
A Corrente de esta sessão'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
END $$;
-- Song: Nai nai nai nai nai nai nai
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Nai nai nai nai nai nai nai', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Nai nai nai nai nai nai nai}
{artist: Unknown}
{tag: Spanish}
{tag: Medicine Plants}

Nai nai nai nai nai nai nai
Nai nai nai nai nai nai nai
Nai nai nai nai nai nai nai
Nai nai nai nai nai nai nai

Nai nai nai nai nai na na nai nai
Nai nai nai nai nai na na nai nai
Nai nai nai nai nai na na nai nai

Siente la medicina nai
Viene curando nai nai nai
Viene limpiando (sanando) nai nai nai
Viene sanando (aliviando) nai nai nai

Siento el calor del sol↘️
Fluyendo en mi corazón↘️
Viajando↗️ en (el) universo
Libre volando 
haciá la luz queda la vida ↘️
en este paraíso ↘️
de color ↗️y alegría 
canta melodia (medicina) nai nai nai

Madre ayahuasca, calma mi mente,
luz divina, guia mi corazon,
Madre ayahuasca, da nos consciencia,
Luz divina, guia mi corazon, nai nai'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Nananawa
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Nananawa', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Nananawa}
{artist: Unknown}
{tag: Spanish}
{tag: Russian}
{tag: Rapé}

nanananananawa nanananananawa
nanananananawa nanananananawa
nanananananawa es la tribu nanawa
nanananananawa es la tribu nanawa

sóplame (tócame) rape
para los buenos pensamientos
sóplame (tócame) rape
para los bellos sentimientos
medicina ancestral
que clarea nuestra mente
medicina ancestral
limpia limpia nuestro cuerpo
fortalece nuestro espíritu 
y abre nuestros corazones
fortalece nuestro espíritu
у me presenta aquí y ahora

con la tribu nanawa
elevando la energía
con la tribu nanawa
elevando la energía

Нанананананава Нанананананава
Нанананананава Нанананананава
Нанананананава это племя нанава
Нанананананава мы все племя нанава

мне задуй рапэ
для хороших размышлений
мне задуй рапэ
для приятных ощущений
медицина наших предков
освещает наши мысли
медицина наших предков
очищает наше тело
укрепляет силу духа
открывает нам сердца
укрепляет силу духа
и я стою перед тобой

вместе с родом нанава
поднимаем нашу силу
вместе с родом нанава
поднимаем нашу силу'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Russian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'russian';
-- Tag: Rapé
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'rape';
END $$;
-- Song: No hay más Coraje que sostener
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('No hay más Coraje que sostener', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: No hay más Coraje que sostener}
{artist: Unknown}
{tag: Spanish}

 

No hay más Coraje que sostener
Todo mi ser, todo mi ser
No hay más Coraje que sostener
Todo mi ser

El entendimiento viene del corazón
del corazón, del corazón
El entendimiento viene del corazón
es el amor

Estoy aquí para recordar 
que me puedo amar
que puedo soñar
Estoy aquí para recordar 
que me puedo amar'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Noku Mana
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Noku Mana', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Noku Mana}
{artist: Unknown}

Load audioSoundCloudSoundCloud might collect personal data. Privacy PolicyContinueDismiss'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
END $$;
-- Song: Nuevo amanecer
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Nuevo amanecer', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Nuevo amanecer}
{artist: Unknown}
{tag: Spanish}

by Anna Milaeva


Adidada adidada adida-a-a
Adidada adidada adide-e-e
x3

Va llegando Padre Sol a mi Altar
Va mirando su familia a despertar
Destellando alegría de su ser
Va naciendo un nuevo amanecer
Destellando alegría de su ser
Va brillando un nuevo amanecer

Va llegando medicina del tambor
Alegría late en mi corazón
Se revela la esencia de mi ser
Nacen flores de nuevo amanacer
Se revela la esencia de mi ser
Nacen flores de nuevo amanacer

Va limpiando su memoria y visión
Va creando una nueva relación
Alegria danza pura en tu ser
Es el rezo del nuevo amanecer
Alegría danza pura en tu ser
Es el rezo del nuevo amanecer

Va llegando Madre Agua a su altar
Va mirando su familia a despertar
Destellando alegría de su ser
Va naciendo un nuevo amanecer
Destellando alegría de su ser
Va brillando un nuevo amanecer

Adidada adidada adida-a-a
Adidada adidada adide-e-e
x3'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Os segredos vem da floresta
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Os segredos vem da floresta', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Os segredos vem da floresta}
{artist: Unknown}
{tag: Portuguese}
{tag: Medicine Plants}
{tag: Ayahuasca}

 

Os segredos vem da floresta de luz
Pacha Mama, Pacha Mama
Abre a consciência
Dos seus filhos a crescer
A verdade traz realeza aqui
Alimenta o coração
Dissolvendo as tormentas
Deste mundo de ilusão
Renascendo das cinzas da história
Mãe da sua fortaleza
As virtudes clareiam o cristal
Prima graça tão brilhante
Pacha Mama abraça seus filhos
Na jornada do amor
Da sua fonte cristalina
Correm asas de esplendor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Pantera
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pantera', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pantera}
{artist: Unknown}
{tag: Spanish}
{tag: Animal}

Desde lo más hondo de la selva 
viene oteando una pantera
Desde lo más hondo de la selva 
viene enseñarnos una pantera

De su negrura aprenderás los misterios del oscuro
te protegerá de todo lo que no es puro 
Con ella aprenderás a rastrear en el abismo
Sin miedo partirás al encuentro de ti mismo

Desde lo más hondo de la selva 
viene oteando una pantera
Desde lo más hondo de la selva 
viene enseñarte una pantera

Te ayudará enfrentarte a lo desconocido
no existirá en ti el miedo te sabrás bendecido
Como ella entenderás que no hay enemigos
Acepta las pruebas que te pone en el camino

Desde lo más hondo de la selva 
viene oteando una pantera
Desde lo más hondo de la selva 
viene enseñarnos una pantera

Silencio en su presencia 
Aprende de su instinto
Atención a sus lecciones
son tesoros escondidos

Ábrete a recibir y agradece los regalos
La pantera acechará cuando hagas tu llamado

Desde lo más hondo de la selva 
viene oteando una pantera
Desde lo más hondo de la selva 
viene enseñarnos una pantera

Desde lo más hondo de tu selva 
viene oteando una pantera
Desde lo más hondo de tu selva 
viene enseñarte una pantera

Desde lo más hondo de la selva 
nai-nai-nai-nai-nai una pantera'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Animal
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'animales';
END $$;
-- Song: Peyote Song 4
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Peyote Song 4', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Peyote Song 4}
{artist: Unknown}
{tag: Vocalization}
{tag: Peyote}

a heya wanna hoyna, ho wo wo
a heya wanna hoyna hey ney
a heya wanna hoyna, ho wo wo
a heya wanna hoyna hey ney

a heya wanna hoyna
heya wanna hoyna
heya wanna hoyna hey ney

a heya wanna hoyna, ho wo wo
a heya wanna hoyna hey ney yo wey
a heya wanna hoyna, ho wo wo
a heya wanna hoyna hey ney

a heya wanna hoyna
heya wanna hoyna hey ney yo wey 

x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
END $$;
-- Song: Peyote song 3
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Peyote song 3', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Peyote song 3}
{artist: Unknown}
{tag: Vocalization}
{tag: Peyote}

Aheyayna heyayna yo, wanna hey ney yo hey
Aheyayna heyayna yo wanna hey ney
na weya yo, na weya yo
na weya yo, heyana hey ney
aheyayna, aheyayna, na weya yo
heyana hey ney yo wey

Aheyayna heyayna yo, wanna hey ney
na weya yo, na weya yo
na weya yo, heyana hey ney
aheyayna, aheyayna, na weya yo
heyana hey ney yo wey

x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
END $$;
-- Song: Peço aos Seres da Floresta
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Peço aos Seres da Floresta', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Peço aos Seres da Floresta}
{artist: Unknown}
{tag: Portuguese}

Eu peço aos Seres da Floresta
Para vir me ajudar
Seres do Vento, seres do Céu
Seres da Terra e seres do Mar

Todos façam a concentração
Para vir me ajudar
Para mim com os Vossos filhos
Para sempre triunfar'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Pido a los seres que me acompañen
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Pido a los seres que me acompañen',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pido a los seres que me acompañen}
{artist: Unknown}
{tag: Spanish}

https://soundcloud.com/medicina_arcturus/que-floresca-la-luz


Pido a los seres que me acompañan
Que nos guíen en este camino

Que nos lleven a la conciencia
Y que se abra nuestro corazón 
(x2)

Padre llévame a la luz
Madre llévame al amor
(x2)
Que florezca la luz, que florezca el amor
Que florezca la paz en la Tierra
(x2)
La paz, la paz, la paz en todo el planeta (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Pipe song 10
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pipe song 10', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pipe song 10}
{artist: Unknown}
{tag: Lakota}
{tag: Sacred Pipe}

Prayer song - Pipe presentation
(*) Weyaya welo hayo 
Welo hayo welohe 
Weyaya welo hayo 
Welo hayo welohe
x
Weyaya welo hayo 
Cannupa hayo welohe 
Weyaya welo hayo 
Welo hayo welohe
x
Wakan Tanka cewakiyaca 
Cannupa mayaku elo he 
Weyaya welo hayo		I pray to the Great Spirit
Welo hayo welohe		he gave me a sacred pipe	
(*)
Wakan Tanka cewakiyaca 
Wicozani mayaku elo he 
Weyaya welo hayo		I pray to the Great Spirit
Welo hayo welohe		he gives me good health
(*)
Wakan Tanka cewakiyaca 
Anpetu luta mayaku elo he 
Weyaya welo hayo		I pray to the Great Spirit 
weya hayo welohe		he gave me a red day'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Sacred Pipe
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sacred-pipe';
END $$;
-- Song: Pipe song 58
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pipe song 58', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pipe song 58}
{artist: Unknown}
{tag: Lakota}
{tag: Sacred Pipe}

Wakan Tanka Tunkasila (*) 		Great Spirit Grandfather
Wakan Tanka Tunkasila 
Pilama ya yelo (he) 			I thank you

Cannupa wakan ca 			    For this sacred pipe 
Mayakuelo he 			That you gave it to me 
Pilama ya yelo he			I thank you

Wicozani wa mayakuelo 		You have given me good health
Pilama ya ye				So I thank you
Pilama ya yelo he

Cannupa wakan ca 			For this sacred pipe 
Mayakuelo he 			That you gave it to me 
Pilama ya yelo he			I thank you

Wicozani wa mayakuelo 		You have given me good health
Pilama ya ye				So I thank you
Pilama ya yelo he'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Sacred Pipe
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sacred-pipe';
END $$;
-- Song: Pipe song 63
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pipe song 63', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pipe song 63}
{artist: Unknown}
{tag: Lakota}
{tag: Sacred Pipe}

Oyate wama yanka po 
Oyate wama yanka po
Oyate wama yanka po 
Cannupa wakan ca
Yuha cewaki yelo he              
Oyate yanipi kta ca              
Leca mu welo he

Oyate wama yanka po 
Cannupa wakan ca
Yuha cewaki yelo he 
Oyate yanipi kta ca 
Leca mu welo he'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Sacred Pipe
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sacred-pipe';
END $$;
-- Song: Pipe song 65
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pipe song 65', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pipe song 65}
{artist: Unknown}
{tag: Lakota}
{tag: Sacred Pipe}

Weya heya hehe weya weya welo he (**)
Weya heya hehe weya weya welo he
Weya heyo he weya heyo welo he
Weya heyo he weya heyo welo he

Wakan Tanka unsimala yelo he		Great Spirit, have mercy on me
Makakijelo Wani waci yelo he			I am suffering and I will live
Cannupa ki le yuha hoye wayeloyo he	With this pipe I send a voice'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Sacred Pipe
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sacred-pipe';
END $$;
-- Song: Porque te quiero tanto
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Porque te quiero tanto', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Porque te quiero tanto}
{artist: Unknown}
{tag: Spanish}
{tag: English}

Porque te quiero tanto (x2)
Tanto tanto
Porque te quiero tanto
Con todo mi corazon
Heyana hey ney o wey

Xiuhtecuhtli we-we teo (x2)
We we teo
Xiuhtecuhtli we-we teo (x2)
Heyana hey ney o wey

Because I love you so much (x2)
So much so much
Because I love you so much
With all of my heart
Heyana hey ney o wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
END $$;
-- Song: Pájaro viejo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Pájaro viejo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Pájaro viejo}
{artist: Unknown}
{tag: Spanish}
{tag: Bird}

Pájaro viejo que cantas, que cantas esta tierra te ha visto nacer (bis) 
Canta, canta, cántame cántame, recuérdame (bis) 
Que somos todos hijos del sol
Que somos todos hijas del sol

Pájaro viejo que cantas, que cantas esta tierra te ha visto nacer (bis) 
Canta, canta, cántame cántame, recuérdame (bis) 
Que somos todos hijos de Tonantzin
Que somos todos hijas de Tonantzin

Pájaro viejo que cantas, que cantas esta tierra te ha visto nacer (bis) 
Canta, canta, cántame cántame, recuérdame (bis) 
que somos todos hijos de la luna
que somos todos hijas de la luna'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
END $$;
-- Song: Sagrada Familia
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sagrada Familia', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sagrada Familia}
{artist: Unknown}
{tag: Bird}
{tag: Medicine Plants}
{tag: Spanish}

https://music.curawaka.com/track/sagrada-familia
https://www.facebook.com/watch/?v=1128600107493130


Águila del norte, vigilante vuelo
Trae la medicina, sagrada familia
Tambor milagrero, retumba en los montes
Junta a los hermanos, cura corazones

Cóndor de los andes, señor de los cielos
Pide a las estrellas, que curen a su pueblo
Protege a los niños, tráeles bendiciones
Pinta los colores, cantas tus canciones

Águila y cóndor, sol, luna y estrella
Sierra selva y mar, corazón de fuego
Mira que belleza, misterio de la vida 
Un sin fin de flores, muestran sus colores'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Bird
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'bird';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Santa Maria vem chegando neste batalhão
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Santa Maria vem chegando neste batalhão',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Santa Maria vem chegando neste batalhão}
{artist: Unknown}
{tag: Portuguese}
{tag: Medicine Plants}
{tag: Santa Maria}

 Santa Maria vem chegando neste batalhão 
Trazendo as forças da Rainha da floresta 
São essas forças vindas de Nossa Senhora 
Que centralizam essa luz aqui na Terra

Eu vou pedindo sempre a minha coragem 
Para seguir nesta batalha do amor 
Com o conforto da minha mãezinha 
Com sua luz com o seu resplendor

Eu vou seguindo sempre no caminho 
Sempre guiado pela luz divina 
Sempre buscando aprender nesta doutrina'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
END $$;
-- Song: Santa Maria è uma mulher
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Santa Maria è uma mulher', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Santa Maria è uma mulher}
{artist: Unknown}
{tag: Portuguese}
{tag: Santa Maria}

by Dario Hampi Pakari


Re re-re re re-re re-re re
re re re re re re re re re
(x2)
ru-ru-ru-ru rai rai rai rai
(x4)
Santa Maria é uma mulher que chega pra todos os que querem ver
Ela é que sabe como ensinar os cantos a nossa Rainha do Mar

Ela vive nas águas de Mamãe Oxum dá volta ao mundo com pai Olodum
Ela vive nas águas de Mamãe Oxum dá volta ao mundo com pai Olodum

re-re-re-re-re-rai rai rai rai ra
ru-ru-ru-ru-ru-ru-ru-ru-ru
re-re-re-re-re-rai rai rai rai ra
ru-ru-ru-ru-ru-ru-ru-ru-ru
(x2)

Santa Maria é uma mulher que chega pra todos os que querem ver
Ela sabes como ensinar os cantos a nossa Rainha do Mar

Ela vem aqui na terra para enamorar dança no vento com Mãe Iansã
Ela vem aqui na terra para ensinar dança no vento com Mãe Iansã

re-re-re-re-re-rai rai rai rai ra
ru-ru-ru-ru-ru-ru-ru-ru-ru
re-re-re-re-re-rai rai rai rai ra
ru-ru-ru-ru-ru-ru-ru-ru-ru
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
END $$;
-- Song: Santa Maria
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Santa Maria', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Santa Maria}
{artist: Unknown}
{tag: Portuguese}
{tag: Santa Maria}

https://ninaurku.com/wiki/File:Santa_Maria.mp3

Eu sou Santa Maria
Trago aqui Amor e Alegria
E aqui dentro deste salão
A alegria é a nossa única razão'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
END $$;
-- Song: Seres vivos da floresta
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Seres vivos da floresta', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Seres vivos da floresta}
{artist: Unknown}
{tag: Portuguese}

Seres vivos da floresta     
Venham me iluminar
Estou aqui estou cantando
Estou aberto para me curar 
Estou aqui estou cantando
Estou aberto para me curar 

Seres vivos da floresta     
Venham me iluminar
Estou aqui estou cantando
Estou aberto para me curar 
Estou aqui estou cantando
Estou aberto para me curar 

A floresta traz misterios
E pedimos vossa proteção
Nossos medos vão sumindo
E vai se abrindo nosso coração
Nossos medos vão sumindo
E vai se abrindo nosso coração

A floresta traz misterios
E pedimos vossa proteção
Nossos medos vão sumindo
E vai se abrindo nosso coração
Nossos medos vão sumindo
E vai se abrindo nosso coração

Toda luz se revelando
Nos damos conta, tudo e amar
A clareza vai surgindo
E agora sei que posso voar
A clareza vai surgindo
E agora sei que posso voar

Toda luz se revelando
Nos damos conta, tudo e amar
A clareza vai surgindo
E agora sei que posso voar
A clareza vai surgindo
E agora sei que posso voar

Seres vivos da floresta     
Venham me iluminar
Estou aqui estou cantando
Estou aberto para me curar 
Estou aqui estou cantando
Estou aberto para me curar 

Seres vivos da floresta     
Venham me iluminar
Estou aqui estou cantando
Estou aberto para me curar
Estou aqui estou cantando
Estou aberto para me curar

A floresta traz misterios
E pedimos vossa proteção
Nossos medos vão sumindo
E vai se abrindo nosso coração
Nossos medos vão sumindo
E vai se abrindo nosso coração

A floresta traz misterios
E pedimos vossa proteção
Nossos medos vão sumindo
E vai se abrindo nosso coração
Nossos medos vão sumindo
E vai se abrindo nosso coração

Toda luz se revelando
Nos damos conta, tudo e amar
A clareza vai surgindo
E agora sei que posso voar
A clareza vai surgindo
E agora sei que posso voar

Toda luz se revelando
Nos damos conta, tudo e amar
A clareza vai surgindo
E agora sei que posso voar
A clareza vai surgindo
E agora sei que posso voar'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Señora mi señora
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Señora mi señora', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Señora mi señora}
{artist: Unknown}
{tag: Spanish}

Señora, mi señora yarí (x2) 
Pachamama nunkui tierra 
sinchi Tonanzin tlali yarí (x2)
 
El agüita de la vida sí
El agüita de mi vida sí
va curando, va sanando 
sinchi Tonanzin tlali yarí
va curando y va limpiando 
sinchi Tonanzin tlali yarí

Maizito de la vida sí 
Maizito de mi vida sí
va curando, va sanando 
sinchi Tonanzin tlali yarí 
va curando y va sembrando 
sinchi Tonanzin tlali  yarí

Carnecita de la vida sí 
Carnecita de mi vida sí
va curando, va sanando 
sinchi Tonanzin tlali yarí 
va curando y va danzando 
sinchi Tonanzin tlali yarí 

Y los frutos de la vida sí 
Y los frutos de mi vida sí
Van curando, va sanando 
sinchi Tonanzin tlali yarí 
van curando y endulzando 
sinchi Tonanzin tlali yarí'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Sigo adelante con la medicina
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sigo adelante con la medicina', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sigo adelante con la medicina}
{artist: Unknown}

https://soundcloud.com/paolo-gabriel-ampuero/sigo-adelante-con-la-medicina


Voy por el camino de luz en la vida
Sigo adelante con la medicina
(x2)
Weya heyo we ya he ha io 
weya heyo we ya ha io
(x2)
(x3)

Tlazokamati Topiltzin Mexica
Noyolo Tanzin Noyolo Nantzin 
(x2)
Weya heyo we ya he ha io 
weya heyo we ya ha io
(x2)
(x3)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
END $$;
-- Song: Sinchi Pakari
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sinchi Pakari', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sinchi Pakari}
{artist: Unknown}
{tag: Spanish}

From Antonio


Yupay kari abueito,
yupay kari abuelo, awacolla
yupay kari, yupay kari
(x2)
Sinchi sinchi pakari
Pakari sinchi, guerrero
Por todos los Andes se levanta
mi gente,
wey ya na, hey ney yo wei
(x2)
La serpiente, puma y condor
bufalo, aguila venado
como círculo que se abre hacia el centro
Y en el nord y en el sur
wey ya na, hey ney yo wei
(X2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Sinchi Sinchi
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sinchi Sinchi', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sinchi Sinchi}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}
{tag: Ayahuasca}
{tag: Peyote}
{tag: Medicine Plants}

Ayahuasca mamay kuna, 
shamuy cuna сayari
Sinchi sinchi medicina 
sinchi sinchi yariri ririri ririri ririri
(x2)

Curandera nai, poderosa yariri
Sinchi sinchi luminosay
sinchi sinchi yariri ririri ririri ririri

Legitima nai, doctorcita kayari
Sinchi sinchi poderosay
sinchi sinchi yariri ririri ririri ririri

Ayahuasca mamay kuna, 
shamuy cuna сayari
Sinchi sinchi medicina 
sinchi sinchi yariri ririri ririri ririri
(x2)

Poderosa nai, luminosa yariri
Sinchi sinchi curandera
sinchi sinchi yariri ririri ririri ririri

Legitima nai, doctorcita kayari
Sinchi sinchi luminosay
sinchi sinchi yariri ririri ririri ririri

Aguacolla, tayta cuna
shamuy cuna сayari
Sinchi sinchi medicina 
sinchi sinchi yariri ririri ririri ririri
(x2)

Poderoso nai, curandero kayari
Sinchi sinchi luminoso
sinchi sinchi yariri ririri ririri ririri

Legitimo nai, doctorcita kayari
Sinchi sinchi poderoso
sinchi sinchi yariri ririri ririri ririri

Peyotito, taitay kuna
shamuy cuna сayari
Sinchi sinchi medicina 
sinchi sinchi yariri ririri ririri ririri
(x2)

Luminoso nai, poderoso kayari
Sinchi sinchi curandero
sinchi sinchi yariri ririri ririri ririri

Legitimo, doctorcito kayari
Sinchi sinchi luminoso
sinchi sinchi yariri ririri ririri ririri

Tabakito, taitay kuna
shamuy cuna сayari
Sinchi sinchi medicina 
sinchi sinchi yariri ririri ririri ririri
(x2)

Poderoso nai, luminoso kayari
Sinchi sinchi curandero
sinchi sinchi yariri ririri ririri ririri

Legitimo doctorcito kayari
Sinchi sinchi luminoso
sinchi sinchi yariri ririri ririri ririri'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Peyote
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'peyote';
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
END $$;
-- Song: Solo Dios Sabe Si Vuelvo (Abrete florcita)
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Solo Dios Sabe Si Vuelvo (Abrete florcita)',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Solo Dios Sabe Si Vuelvo (Abrete florcita)}
{artist: Unknown}
{tag: Spanish}

 

Abrete florcita de los cuatro vientos yari
Olorocita perfumera doctorcita
Estrellita de siete flechas runancita
Ay danzaremos hasta las claras del día
par(a) escuchar la voz de los que ya se fueron.
 
Son tus aguas que le dan la vida a mi pueblo
Ay las que brotan por mis ojos tristemente
porque (e)n mi tierra ya no se le canta (a)l agua
son las que brotan por tus ojos Pachamama
y reverdecen en mi quebrada del tigre

Llena d(e) alegría danza la muerte (a) mi lado
Chuma borracherita pinta gente yari
cuatro (o)torongos magos llegan a la fiesta
s(e) alza (e)n el cielo (e)l brillo (a)zul de la flor blanca
camino rojo solo Dios sabe si vuelvo.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Sou Beija-flor
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sou Beija-flor', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sou Beija-flor}
{artist: Unknown}
{tag: Portuguese}

Sou Cantador
Minha Vida é Cantar (x2)
Vamos meus irmãos
Vamos Cantar (x2)

Sou Beija-flor
Minha Vida é Voar (x2)
E beijar as flores
E Voar (x2)

Sou Rezador
Minha Vida é Rezar (x2)
E pedir a Deus
Para nos ajudar (x2)

I am a singer and my life is a song (x2)
Come brothers and sisters let us sing (x2)

I’m a hummingbird and my life is to fly
I’m a hummingbird and my life is a flight
And I kiss the flowers and I fly (x2)

I am praying and my life is a prayer (x2)
And I pray to God to bless us (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Sou Filho da Rainha Yemanja
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Sou Filho da Rainha Yemanja', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sou Filho da Rainha Yemanja}
{artist: Unknown}
{tag: Portuguese}
{tag: Water}

https://ninaurku.com/wiki/File:1736495421.mp3

Iemanjá eêêêê...
Iemanjá eáááá…
(x2)

Sou filho da Rainha Iemanjá (x2)

Espuma branca
Todas as princesas do mar

Os meus irmãos
E irmãs eu vou chamar
(x2)

Sou filho da Rainha Iemanjá (x2)

Neste Poder
Dá licença eu entrar

Com as águas do mar
Me curo e vou curar
(x2)

Sou filho da Rainha Iemanjá (x2)

Meu Pai mandou
Eu executar

Eu chamo o vento
Chamo a terra e chamo o mar
(x2)

Chamando a tempestade
Que as águas vão limpar
E as estrelas, todas vêm me acompanhar
Sou um com Deus e todo o universo
Na calmaria Jesus é quem vai reinar

Sou filho da Rainha Iemanjá (x2)

Iemanjá eêêêê...
Iemanjá eáááá…
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
END $$;
-- Song: Sou filho de Deus, sou filho da Rainha
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES (
        'Sou filho de Deus, sou filho da Rainha',
        'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    )
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Sou filho de Deus, sou filho da Rainha}
{artist: Unknown}
{tag: Portuguese}
{tag: Santa Maria}

Sou filho de Deus, sou filho da Rainha
Sao Pedro è o Mestre quem me ensina nesta linha
x2
Santa Maria vem-nos ajudar
todos seus filhos quem confiam procurar
x2
Procura procura, quem procura acha
Santa Maria com amor de Deus despacha
x2
Despacha tudo quanto for ruim
deixando tudo com perfume de Jazmin
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
END $$;
-- Song: Strong wind
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Strong wind', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Strong wind}
{artist: Unknown}
{tag: English}
{tag: Water}
{tag: Fire}
{tag: Air}

Strong wind, deep water
Tall tree, warm fire
I can feel it in my body
I can feel it in my soul 
(x2)

Heya Heya Heya Heya 
Heya Heyaho 
Heya Heya Heya Heya 
Heeey aaahoo
(x2)

Es el viento, es el agua
Es la tiera, es el fuego
Yo lo siento en el cuerpo
Y tambien en me corazon
(x2)

Heya Heya Heya Heya 
Heya Heyaho 
Heya Heya Heya Heya 
Heeey aaahoo
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Air
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'air';
END $$;
-- Song: São Paulo (Viva Casa de Maria)
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('São Paulo (Viva Casa de Maria)', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: São Paulo (Viva Casa de Maria)}
{artist: Unknown}
{tag: Portuguese}
{tag: Santa Maria}
{tag: San Pedro}

https://ninaurku.com/wiki/File:19_S%C3%A3o_Paulo.mp3

Viva Casa de Maria
Viva ela como está
x2
Vamos todos ficar firmes
Cada um em seu lugar
Que vai chegar mais aparelho
Para mais força aparelhar
x2

Esta casa é de Maria
E (de) Jesus Cristo Redentor
x2
Eu vou receber esta força
A força do meu Senhor
Para fundar com meu São Paulo
Uma casa de Amor
x2

Viva Casa de Maria
E viva Mamãe Iemanjá
x2
Vamos todos balançando
Como nas ondas do mar
É meu pai que está apurando
O que tem para apurar
x2

Oh! Minha Santa Maria
Vem aqui nos perfumar
x2
Vem aqui tirar o medo
Vem aqui nos clarear
Que o comando é de São Pedro
Ninguém queira duvidar
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Santa Maria
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'santa-maria';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
END $$;
-- Song: Taita Inti Inti tai
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Taita Inti Inti tai', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Taita Inti Inti tai}
{artist: Unknown}
{tag: Spanish}
{tag: Sun}

Tai tai tai tai
Tai tai tai tai

Taita inti Taita inti Taita inti
Taita Inti Inti Tai

Taiticu tai tai tai
Taiticu tai tai tai

Taita inti Taita inti Taita inti
Taita Inti Inti Tai

Guíanos hacia la pureza
La ternura, el Amor
Hacia la Gran Luz del cielo
Hacia los miles de millones
De rayos del Sol, Sol Sol Sol Sol

So re re re rei reireirerei

Viska Yagé, Viska Yagé

So re re rei reireirei
Taiticu tai tai tai

Sobre toda enfermedad,
Ilusión y maldad

Serás iluminado
Con la luz del Sol Sol Sol

So re re re rei reireirerei

Viska Yagé, Viska Yagé
Taiticu tai tai tai

Vuela vuela Colibrí
Bri bri bri bri'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Sun
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sun';
END $$;
-- Song: Taita Inti Padre Sol
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Taita Inti Padre Sol', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Taita Inti Padre Sol}
{artist: Unknown}
{tag: Spanish}
{tag: Sun}

Taita Inti Padre Sol Ven ven ven trae tu calor (saber) (bis) 
Está por el rio, por la tierra y por el mar, volando del viento el poder de Dios está (bis)

Hey-ya Hey-ya Hey-ya Hey-ya Hey-ya Hey-ya-ho, sol, luna y estrellas, yo les canto otra vez (bis) 
Ayahuasca, Caapi Inti intigua currupi currupi (bis) 
Como me enseñó yo aquí fui y lo llame, agradezco siempre que nos abra su poder (bis) 
Pájaro cantó, pájaro voló, lleva su presencia quien aquí lo mereció (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Sun
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sun';
END $$;
-- Song: Tata Awarã
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tata Awarã', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tata Awarã}
{artist: Unknown}
{tag: Medicine Plants}
{tag: Ayahuasca}

 

MAWA ISA version:

4x
TATA AWARÃ, TATA AWARÃ
WAHE TÊNÃDÊ

4x
AMENAKÊ YAMA PÊ, AMENAKÊ YAMA PÊ 

4x
AMENAKÊ PĨDA, AMENAKÊ PĨDA

4x
PĨDA, PĨDA, PĨDA PÔ TATA

4x
TATA AWARÃ, TATA AWARÃ
WAHE TÊNÃDÊ

4x
AMENAKÊ YAMA PÊ, AMENAKÊ YAMA PÊ 

4x
AMENAKÊ PĨDA, AMENAKÊ PĨDA

4x
PĨDA, PĨDA, PĨDA PÔ TATA

4x
TÔRA A, TÔRA A, TÔRA A, TÔRA A

4x
BÔRARA, BÔRARA, BÔRARA, BÔRARA 

4x
PĨDA, PĨDA, PĨDA PÔ TATA'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Medicine Plants
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'plantas';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Te pedimos curacion
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Te pedimos curacion', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Te pedimos curacion}
{artist: Unknown}
{tag: Spanish}
{tag: Medicine Plants}

Re-re-re-re-re-re-re
Ra-ra-ra-ra-ra-ra-ra
x2
Re-re-re-re-re
Ra-ra-ra-ra-ra
x2
Re-re-re-re-re-re-re
Ra-ra-ra-ra-ra-ra-ra

Re-re-re-re-re-re-re
Ra-ra-ra-ra-ra-ra-ra
x2
Re-re-re-re-re
Ra-ra-ra-ra-ra
x2
Re-re-re-re-re-re-re
Ra-ra-ra-ra-ra-ra-ra

Te pedimos curacion
Te pedimos sanacion
x2

awacollita llega aquí
luz medicina esta por venir
awacollita ayudanos
poderosito te rezamos

Te pedimos curacion
Te pedimos sanacion
x2

Ay tabaquito llega aquí
luz medicina esta por venir
Ay tabaquito ayudanos
poderosito te rezamos

Te pedimos curacion
Te pedimos sanacion
x2

Ay rapesito llega aquí
luz medicina esta por venir
Ay rapesito ayudanos
poderosito te rezamos

Te pedimos curacion
Te pedimos sanacion
x2

Santa Maria llega aquí
luz medicina esta por venir
Santa Maria ayudanos
poderosita te rezamos

Te pedimos curacion
Te pedimos sanacion
x2

Ayahuasquita llega aquí
luz medicina esta por venir
Ay Madre Selva ayudanos
poderosita te rezamos'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Tejido Sonoro
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tejido Sonoro', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tejido Sonoro}
{artist: Unknown}
{tag: Spanish}

'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: The River Is Flowing
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('The River Is Flowing', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: The River Is Flowing}
{artist: Unknown}
{tag: English}
{tag: Water}
{tag: Fire}
{tag: Moon}
{tag: Sun}

The river is flowing flowing and growing
The river is flowing back to the sea
Mother Earth is carrying me her child I will always be
Mother Earth carry me back to the sea

The moon she is waning waxing and waning
The moon she is waiting for us to be free
Sister moon watch over me your child I will always be
Sister moon watch over me until we are free

The sun he is shining rising and shining
The sun he is shining to brighten our way
Father sun shine over me your child I will always be
Father sun shine over me and brighten our way

The fire is burning destroying and burning
The fire is burning for us to get pure
Violet flame burn over me a child I will always be
Violet flame burn over me until I am pure'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
-- Tag: Moon
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'moon';
-- Tag: Sun
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'sun';
END $$;
-- Song: Tlazocamati
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tlazocamati', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tlazocamati}
{artist: Unknown}
{tag: Spanish}
{tag: Ayahuasca}

 

Aya Aya Ayahuasca
Aya Aya Ayahuasca
(x2)

Yage Yage Yage Yage he
Yage Yage Yage he
(x2)

Aquí Aya Ayahuasca
Aquí Aya Ayahuasca
(x2)

Tlazocamati topiltzin mexica
Toyo lo tanzin toyo lo nantzin
(x2)

We ya hey ya ho hey ya hey yo
We ya hey ya We ya hey yo
(x2)

Voy por el camino de luz en la vida
Sigo adelante con la medicina
(x2)

We ya hey ya ho hey ya hey yo
We ya hey ya We ya hey yo
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Todo el amor
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Todo el amor', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Todo el amor}
{artist: Unknown}
{tag: Spanish}

Re-re-re-re-re
re-re-re
Ra-ra-ra-ra-ra-ra-ra-ra-ra
x2
Re-re-re-re
re-re-re
Ra-ra-ra-ra-ra-ra-ra-ra-ra
x2

Todo el amor que tu me das
lo llevo en mi corazón
Todo el amor que tu me das
lo guardo en mi corazón

Como una luz, como una flor
me llevas en tu corazón
Como un rubí, como un tesor(o)
te guardo en mi corazón

Todo el amor que yo te doy
lo llevas en tu corazón
Todo el amor que yo te doy
lo guardas en tu corazón

Como una luz, como una flor
te llevo en mi corazón
Como un rubí, como un tesor(o)
me guardas en tu corazón

Re-re-re-re-re
re-re-re
Ra-ra-ra-ra-ra-ra-ra-ra-ra
x2
Re-re-re-re
re-re-re
Ra-ra-ra-ra-ra-ra-ra-ra-ra
x2

Tu eres lo que camina conmigo
camino de corazón
tu eres lo que camina a mi lado
caminó hacia adelante

Como una luz, como una flor
te llevo en mi corazón
Como un rubí, como un tesor(o)
te guardo en mi corazón

Tu eres lo que camina conmigo
camino de corazon
Yo soy la que camino a tu lado
caminó hacia adelante

Como una luz, como una flor
me guardas en tu corazón
Como un rubí, como un tesor(o)
me llevas en tu corazón

Re-re-re-re-re
re-re-re
Ra-ra-ra-ra-ra-ra-ra-ra-ra
x2
Re-re-re-re
re-re-re
Ra-ra-ra-ra-ra-ra-ra-ra-ra
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Todo es Medicina
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Todo es Medicina', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Todo es Medicina}
{artist: Unknown}
{tag: Spanish}

 Todo cura, todo sana, 
todo lleva medicina dentro.(x3)
Todo lleva medicina dentro, 
todo lleva medicina dentro.
Todo lleva fuego dentro, 
todo lleva agua dentro 
Todo lleva tierra dentro, 

todo lleva aire dentro 
llevo llevo medicina dentro,
llevo llevo el universo dentro (x2)
Voy llamando, voy llegando, 
mis ancestros van llegando
Todo tiene medicina dentro, 
llevo llevo medicina dentro 
llevo llevo medicina dentro, 
llevo llevo el universo dentro 
Voy curando, voy sanando, 
las heridas Cicatrizando
Llevo llevo fuego dentro, 
Llevo llevo agua dentro
Llevo llevo aire dentro, 
Llevo llevo tierra dentro
Voy llegando, voy llegando, 
mis ancestros van llegando
Voy curando, voy sanando, 
las heridas Cicatrizando
Todo cura, todo sana…'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Todo es mi familia
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Todo es mi familia', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Todo es mi familia}
{artist: Unknown}
{tag: English}
{tag: Spanish}

Caminaré en Belleza, Caminaré en Paz (x2).
Todo es mi familia (x2).

Todo es sagrado, las plantas y animales,
Todo es sagrado, las montañas, selva y mares.
Todo es mi familia (x2).

he ya he ya he ya, he ya he ya hey (x2).
Todo es mi familia (x2).

I will walk in beauty, i will walk in peace (x2)
Everything is my family (x2)

Everything is sacred, animals and plants
Everything is sacred, the mountains and the sea
Everything is my family (x2)

he ya he ya he ya, he ya he ya hey (x2).
Todo es mi familia (x2).'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: English
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'english';
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Todo lo que tengo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Todo lo que tengo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Todo lo que tengo}
{artist: Unknown}
{tag: Spanish}
{tag: Earth}

Daidai daidaidai daidaidaidai
Daidai daidaidai daidaidaidai
Daidai daidaidai daidaidaidai
Daidai daidaidai daidaidaidai

Quiero que tú sepas
Que lo que yo tengo tu me le has dado
Quiero que tú sepas
Que lo que yo tengo tu me le has dado

El amor de la Pachamama ha entrado en mi cuerpo
Y me está cuidando
El amor de Pachamama ha entrado en mi cuerpo
Y me está ayudando

[Verso 2]
El amor de Pachamama ha entrado en mi cuerpo
Y me está cuidando
El amor de Pachamama ha entrado en mi cuerpo
Y me está hablando

Él me dice que hace tiempo, mucho mucho tiempo
Ella está esperando
Él me dice que hace tiempo, mucho mucho tiempo
Ella está esperando

[Verso 3]
Que agradezca al fuego, a la tierra, al agua 
Y al aire cantando
Que agradezca al fuego, a la tierra, al agua 
Y al aire cantando

Él me dice que las cuatro son las medicinas  
Que andamos buscando
Él me dice que las cuatro son las medicinas
Que andamos buscando'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Song: Tuari rari
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tuari rari', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tuari rari}
{artist: Unknown}
{tag: Spanish}
{tag: Air}
{tag: Ayahuasca}
{tag: Earth}

Abro Medicina de Ayahuasca otra vez
Llamo y llamo humilde al Poder
Quiera de nuevo su Amor proteger
Tuari rari tuari ririri

Lleva la duda y calma el temor
Sea la guía Maestro interior
Abro mi Ser a la Activación
Tuari rari tuari ririri

Mi San Josecito
Su comando poderoso quien mandó
Fue la propia Madre Tierra
Y el grandioso Sol Central
Tuari rari tuari ririri'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
-- Tag: Earth
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'earth';
END $$;
-- Song: Tunkasila omakiyayo omakiyayo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Tunkasila omakiyayo omakiyayo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Tunkasila omakiyayo omakiyayo}
{artist: Unknown}
{tag: Lakota}

Tunkasila omakiyayo omakiyayo 
Eeyana hey ney
Tunkasila omakiyayo  eeyana heyney oh wey
Makatakiya omakiyayo omakiyayo 
Eeyana heyney
Makatakiya omakiyayo eeyana heyney oh wey
Peyut wakan omakiyayo omakiyayo 
Eeyana hey ney
Peyut wakan omakiyayo eeyana hey ney oh wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
END $$;
-- Song: Um ser vestido de branco
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Um ser vestido de branco', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Um ser vestido de branco}
{artist: Unknown}
{tag: Portuguese}

Um ser vestido de branco 
Com flores no coração 
Tinha um perfume de rosa e me relembrava da minha missão 

Ele cantava e dizia pra mim 
Nós somos flores do mesmo jardim 

Eu entendi o segredo e percebi quem eu sou
Junto com os seres Divinos
Um anjo de branco me iluminou

Louvando a Deus com meus pés no chão 
Viva a Jurema no meu coração
Louvando a Deus por este primor
Viva a Jurema estrela do Amor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Vem força, vem
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Vem força, vem', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Vem força, vem}
{artist: Unknown}
{tag: Portuguese}
{tag: Ayahuasca}

Vem força da ayahuasca, vem
Vem a curar todo aquele que tem
Sentimentos que não fazem bem
Que sentem magoas por outro alguém
(x2)

Vem, vem, vem força vem
Força da ayahuasca vem
Vem a mostrar o poder que tem
De fazer o bem
(x2)

De fazer o bem 
De fazer o bem 
como poder que tem
De fazer o bem 
De fazer o bem 
De fazer o bem 
como poder que tem'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Vengan Abuelos
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Vengan Abuelos', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Vengan Abuelos}
{artist: Unknown}
{tag: Spanish}

Venga aquí Taita querido
Venga aquí mi buen Padrino
Que la rueda está formada
Y solo falta usted llegar

Es a eso a que venimos
Y tomamos Medicina
Para que su sabia guía
Sea nuestra Alegría

Ahora sé de un buen camino
Y corrijo sin demora
Que la vida por momentos
Pide máxima atención

Ahora siento su presencia
Siento Paz en mi interior
No preciso ser perfecto
Para recibir su Amor'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Viene Serpenteando
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Viene Serpenteando', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Viene Serpenteando}
{artist: Unknown}
{tag: Spanish}
{tag: Russian}
{tag: Ayahuasca}

Mira quien viene
Quien está llegando
Mira quien viene
Viene y te lleva

Mira quien viene
Viene serpenteando
Mira quien viene
Viene y te lleva

Te lleva y te trae
Haciá la inmensidad,
Te lleva y te trae
Haciá la Eternidad

Te lleva y te trae
Hacia la inmensidad,
Te lleva y te trae
Hacia la verdad

Abre tu mente
Abre tu corazón
Ábrete y recibe
Esta sanación

Abre tu mente
Abre tu corazón
Ábrete y recibe
Esta Curación

Смотри, кто подходит
Кто уже так близко
Смотри, кто подходит
Занимает мысли

Смотри, кто подходит
Рядом тут блуждает 
Смотри, кто подходит
Тебя забирает

Тебя забирает
Уносит высоко
Тебя забирает
Уносит далеко

Тебя забирает
Уносит высоко
Тебя забирает
Тебе так легко

Открой свою душу
И сердце раскрой
Открой и получишь
Эту любовь

Открой свою душу
И сердце раскрой
Излечишь все раны
И обретешь покой




Глянь, кто приходит
Кто уже так близко
Вьется змеей
Занимает мысли

Глянь, кто приходит
Рядом тут блуждает 
Вьется змеей
Вверх тебя вздымает

В высь поднимает
Уносит далеко
Вверх в бесконечность
Летишь так легко

В высь поднимает
Уносит далеко
Истину в сердце 
слышишь легко

открой свою душу
и разум открой
вдыхай всем сердцем  
эту любовь

открой свое сердце 
и душу открой
излечатся раны
и обретешь покой'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Russian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'russian';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Viento
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Viento', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Viento}
{artist: Unknown}
{tag: Spanish}
{tag: Water}
{tag: San Pedro}
{tag: Ayahuasca}

Viento que traes claridad
Lluvia que calma la emoción
Viento que traes claridad
Agua que toca el corazón

Y vuela vuela hasta el sol 
Y siembra amor en esta tierra
Y toca la sonaja 
Y toca el tambor
Y lleva este rezo con amor

Ay la medicina, ay la medicina, ay la medicina 
Que hay aquí ( x 2 )

Agua que fluye, agua que danza, agua que canta
Con claridad ( x 2 )

Ay la medicina, ay la medicina, ay la medicina 
Que hay aquí ( x 2 )

Viento que traes claridad
Lluvia que calma la emoción
Viento que traes claridad
Agua que toca el corazón

Y vuela vuela hasta el sol 
Y siembra amor en esta tierra
Y toca la sonaja 
Y toca el tambor
Y eleva este rezo con amor

Ay la medicina, ay la medicina, ay la medicina 
Que hay aquí ( x 2 )

Abuela ayahuasca de madre selva
Que va limpiando el caminar
Abuelo Peyote de Wirikuta
Danza venado, venado (a)zul
Abuelo San Pedro de la montaña
Que va trayendo la claridad
Son los niñitos, son los honguitos
Cantando vienen, cantando van

Ay la medicina, ay la medicina, ay la medicina
Que hay aquí ( x2 )'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
-- Tag: Ayahuasca
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'ayahuasca';
END $$;
-- Song: Visión Buscado
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Visión Buscado', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Visión Buscado}
{artist: Unknown}
{tag: Spanish}
{tag: Mountain}

Heya heya heya heya, Heya heya heyanna ho (x2)

Hay montaña de visión de visión
cura cura el corazón
Hay montaña de visión de visión
Traenos la sanación

Viento, canto luz de la montaña, Grande Espíritu de Amor 
Heya heya heya heya, Heya heya heyanna ho (x2)
Hay montaña de visión de visión
cura cura el corazón
Hay montaña de visión de visión
Traenos la sanación

Viento, canto luz de la montaña, Grande Espíritu del Amor (x2)
 
En la mañana Taita Inti cuidará tu corazón
En la noche Mama Quilla alumbrará tus sueños
y una estrellita matutina encenderá tu corazón

Heya heya heya heya, Heya heya heyanna ho (x3)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: Mountain
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'mountain';
END $$;
-- Song: Vou Banindo
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Vou Banindo', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Vou Banindo}
{artist: Unknown}
{tag: Portuguese}

Vou banindo pela Terra e ar
Vou banindo pelo fogo e mar
Vou banindo, vou banindo pra purificar
Vou banindo, vou banindo pra exterminar

Espiral, Espiral, Espiral
Sugue o que há de ruim
Leve todo mal
(x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Voy comiendo medicina
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Voy comiendo medicina', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Voy comiendo medicina}
{artist: Unknown}
{tag: Spanish}

 Voy comiendo medicina
por este camino rojo
y las flechas de obsidiana
que vienen de Chicomóztoc
x2

yana wina yana wina yana wina heya
yana wina yana wina yana wina hayo 
x2

Van bajando los guerreros con sus rostros,
negros, rojos, blancos, amarillos
vienen lanzando sus flechas
a las cuatro direcciones
x2'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Wei Xiuhtecuhtli
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Wei Xiuhtecuhtli', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Wei Xiuhtecuhtli}
{artist: Unknown}
{tag: Nahuatl}
{tag: Fire}

Wei Xiuhtecuhtli Wei Xiuhtecuhtli 
Xiuhtecuhtli 
Yanawana Hiyana Hey Ne Yo We 

Wei Xiuhtecuhtli Wei Xiuhtecuhtli 
Xiuhtecuhtli  
Yanawana Hiyana Hey Ne Yo We

Wei Xiuhtecuhtli Wei Xiuhtecuhtli 
Tlazohcamati I Mexihcah Yo
Yanawana Hiyana Hey Ne Yo We 
Xiuhtecuhtli 
Yanawana Hiyana Hey Ne Yo We'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Nahuatl
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'nahuatl';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
END $$;
-- Song: Wey ya, wey ya
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Wey ya, wey ya', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Wey ya, wey ya}
{artist: Unknown}
{tag: Vocalization}

Wey ya, wey ya
Wey ya hey ya hey yo
Wey ya hey ya hey yo
Wey ya, wey yo
Wey ya, wey yo'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
END $$;
-- Song: Wiscachachuscaiman
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Wiscachachuscaiman', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Wiscachachuscaiman}
{artist: Unknown}
{tag: Quechua}

Wiscachachuscaiman orqopi sayaiman (2 times)
Orqo patapiri wayrawantusuyman (2 times)
Wayra,wayra,wayrawantusuyman (2 times)
Takiman,tusuyman,wayrawantusuyman (2 times)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Quechua
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'quechua-kichwa';
END $$;
-- Song: Ya weyo he he he
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ya weyo he he he', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ya weyo he he he}
{artist: Unknown}
{tag: Sun Dance}
{tag: Lakota}

Ya weyo he he he
Weya hayo (*) call from leader
Ya weyo he he he
Weya hayo

Ya weyo he he
Weya haya

Ya weyo he he
Weya haya

Ya weyo he he
Weya haya

Ya weyo he he
Weya ha
Ya welo he'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Sun Dance
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'danza-del-sol';
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
END $$;
-- Song: Ya yahe yaho weyo he
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ya yahe yaho weyo he', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ya yahe yaho weyo he}
{artist: Unknown}
{tag: Sun Dance}
{tag: Lakota}

Ya yahe yaho weyo he (*) call from leader, all start with second line when leader sings bold
Ya yahe yaho weyo he

Yahehehe yahehe
Heya heya haya

Wey ha yaho
Wey haya
Heya heya haya

Wey ha yaho
Wey haya
Heya ho welo he

Wakantanka unci malaye
Waniktaca lecamu
Weya heya haya

Wey ha yaho
Wey ha ya
Weyo heya haya

Wey ha yaho
Wey ha ya
Heya ho welo he'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Sun Dance
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'danza-del-sol';
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
END $$;
-- Song: Yaha weyo he
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Yaha weyo he', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Yaha weyo he}
{artist: Unknown}
{tag: Sun Dance}
{tag: Lakota}

Yaha weyo he (*) call from leader
Yaha weyo he
Weya weya haya

Yaha weyo he
Weya weya
Weya weya
Weya weya haya
Yaha weya haya
Yaha weya
Yaha weya welo he

Ya he heya
Weya weya
Weya weya haya
Yaha weya haya
Yaha weya
Waha weya welo he'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Sun Dance
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'danza-del-sol';
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
END $$;
-- Song: Yanna heyo wanna
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Yanna heyo wanna', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Yanna heyo wanna}
{artist: Unknown}
{tag: Vocalization}

Yanna heyo wanna hey yana hey ney (x3)
Yanna heyo wanna hey yana hey ney yo wei (x2)'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
END $$;
-- Song: Yarin di rin din din din
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Yarin di rin din din din', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Yarin di rin din din din}
{artist: Unknown}
{tag: Spanish}
{tag: San Pedro}

 Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Estrellita matutina shamuy kuna y kayari
va curando y va sanando poderosa yariri din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Por el horizonte
Viene curando viene, sanando y poderosa
Medicina y shamuy kuna
Pinta al que le va
Yarin di rin di rin din
Yarin di rin din din din
Yarin di rin din

Por el horizonte
Viene curando viene, sanando y poderosa
Pajarito y shamuy kuna 
Pinta al que le va 
Yarin di rin di rin din
Yarin di rin din din din
Yarin di rin din

Yo te traigo mis flores 
Yo te traigo mis amores 
Yo te traigo mis canciones 
Poderosa medicina y shamuy kuna
Pinta al que le vaya  
Yarin di rin din din
Yarin di rin din

Yo te traigo mis flores 
Yo te traigo mis amores 
Yo te traigo mis canciones 
Poderoso pajarito y shamuy kuna
Pinta al que le vaya  
Yarin di rin din
Yarin di rin din din

Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Media luna poderosa y shamuy kuna y kayari
Luna de mis emociónes luminosa y kayari-ri
Yarin di rin din din din
Yarin di rin din
Yarin di rin din din din
Yarin di rin din

Por el horizonte 
Viene curando viene, sanando y poderosa
Medicina y shamuy kuna 
Pinta al que le va 
Yarin di rin di rin din
Yarin di rin din din din
Yarin di rin din

Por el horizonte
Viene curando viene, sanando y poderoso
Pajarito shamuy kuna 
Pinta al que le va 
Yarin di rin di rin din
Yarin di rin din din din
Yarin di rin din

Yo te traigo mis flores 
Yo te traigo mis amores 
Yo te traigo mis canciones 
Poderosa medicina y shamuy kuna
Pinta al que le vaya rin
Yarin di rin din
Yarin di rin din

Yo te traigo mis flores 
Yo te traigo mis amores 
Yo te traigo mis canciones 
Poderoso pajarito y shamuy kuna
Pinta al que le vaya rin 
Yarin di rin din din
Yarin di rin din

Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din

Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din din din
Yarin di rin din'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
-- Tag: San Pedro
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'san-pedro';
END $$;
-- Song: Yo winni yana
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Yo winni yana', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Yo winni yana}
{artist: Unknown}
{tag: Lakota}
{tag: Vocalization}

Yo winni yana 
Yo wanna eeana hey ney ney
Yanna yo wanna eeana hey ney 
x3

Yo winni yana 
Yo wanna eeana hey ney ney
Yanna yo wanna eeana hey ney oh wey'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Lakota
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'lakota';
-- Tag: Vocalization
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'vocalization';
END $$;
-- Song: Zhuringa
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Zhuringa', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Zhuringa}
{artist: Unknown}
{tag: Portuguese}

Llama el este/sur/oeste/norte
Zhuringa
Oña suena huaringa
Oña ufa na wa na
Hey
E o a ou hey
Huairita 
Oña eua
Oña ufa sueña
Oña awacolla
Oña e o a u nee
Wairita oña eua
Oña ufa sueña
Oña awacolla
Oña e o a u nee'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Portuguese
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'portuguese';
END $$;
-- Song: Ábrete Corazón
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Ábrete Corazón', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Ábrete Corazón}
{artist: Unknown}
{tag: Spanish}

https://www.song-circle.com/world-songs/condor/abrete-coraz%C3%B3n


Ábrete corazón ábrete sentimiento
ábrete entendimiento deja a un lado la razón
Y deja brillar el sol escondido en tu interior
Ábrete memoria antigua escondida en la tierra

En las plantas en el aire
Recuerda lo que aprendiste bajo agua bajo fuego
Hace ya ya mucho tiempo
Ya es hora ya ya es hora

Abre la mente y recuerda
Como el espíritu cura como el amor sana
Como el árbol florece
Y la vida perdura'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Spanish
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'spanish';
END $$;
-- Song: Águas Claras
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Águas Claras', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Águas Claras}
{artist: Unknown}
{tag: Portuguese}
{tag: Water}

 Águas claras
águas doces
aguas puras
Oxum minha mãe

sois vós quem me cuida
vós quem me sana,
vós que me ama
te agradeço mamãe

linda pureza
tua doçura
minha mamãe pura
é toda limpeza

Mãe Natureza
tuas águas claras
sempre cristalinas
são pura beleza'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
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
END $$;
-- Song: Дай
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Дай', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Дай}
{artist: Unknown}
{tag: Russian}
{tag: Water}
{tag: Fire}

By Anna Milaeva


Дай дай дай дай мама мама дай дай
Дай дай дай дай мама мама дай дай
Дай дай дай дай моя мама дай дай
Дай дай дай дай моя мама дай дай

Мама мама земля я приветствую тебя
Мама мама земля я приветствую тебя
Мама мама земля я благодарю тебя
Мама мама земля я благодарю тебя

Дай дай дай дай папа папа дай дай
Дай дай дай дай мой папа дай дай
Дай дай дай дай папа папа дай дай
Дай дай дай дай мой папа дай дай

Папа папа огонь ты ведешь меня домой
Папа папа огонь ты ведешь меня домой
Папа папа огонь мой учитель золотой
Папа папа огонь мой учитель золотой

Дай дай дай дай мама мама дай дай
Дай дай дай дай мой папа дай дай
Дай дай дай дай моя мама дай дай
Дай дай дай дай папа папа дай дай

Огонь и земля - наша первая семья
Огонь и земля - наша первая семья
Наша первая семья для тебя и для меня
Огонь и земля для тебя и для меня

Дай дай дай дай мама мама дай дай
Дай дай дай дай моя мама дай дай
Дай дай дай дай мой папа дай дай
Дай дай дай дай папа папа дай дай

Моя первая семья прошу помощь у тебя
Моя первая семья прошу помощь у тебя
Дай здоровья для людей и для всех своих детей
Дай здоровья для людей и для всех своих детей

Дай дай дай дай мама мама дай дай
Дай дай дай дай моя мама дай дай
Дай дай дай дай папа папа дай дай
Дай дай дай дай мой папа дай дай

Наша первая семья просим помощь у тебя
Наша первая семья просим помощь у тебя
Дай любовь для людей и для всех своих детей
Дай любовь для людей и для всех своих детей

Дай дай дай дай мама мама дай дай
Дай дай дай дай папа папа дай дай
Дай дай дай дай моя мама дай дай
Дай дай дай дай мой папа дай дай'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Russian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'russian';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Fire
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'fire';
END $$;
-- Song: Купалiнка
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Купалiнка', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Купалiнка}
{artist: Unknown}
{tag: Belarusian}
{tag: Water}
{tag: Women}

Купалiнка-купалiнка, цёмная ночка, 
Цёмная ночка, а дзе ж твая дочка, 
Цёмная ночка, а дзе ж твая дочка. 

Мая дочка у садочку ружу, ружу полiць, 
Ружу, ружу полiць, белы ручкi колiць, 
Ружу, ружу полiць, белы ручкi колiць. 

Кветачкi рвець, кветачкi рвець, 
Вяночкi звiвае, 
Вяночкi звiвае, слёзкi пралiвае, 
Вяночкi звiвае, слёзкi пралiвае. 

Купалiнка-купалiнка, цёмная ночка, 
Цёмная ночка, а дзе ж твая дочка, 
Цёмная ночка, а дзе ж твая дочка.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Belarusian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'belarusian';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Women
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'women';
END $$;
-- Song: Прекрасное далеко
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Прекрасное далеко', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Прекрасное далеко}
{artist: Unknown}
{tag: Russian}

 

Слышу голос из прекрасного далека,
Голос утренний в серебряной росе.
Слышу голос, и манящая дорога
Кружит голову, как в детстве карусель.

Припев:

Прекрасное далеко,
Не будь ко мне жестоко,
Не будь ко мне жестоко,
Жестоко не будь.
От чистого истока,
В прекрасное далеко,
В прекрасное далеко,
Я начинаю путь.

Слышу голос из прекрасного далека,
Он зовет меня не в райские края.
Слышу голос, голос спрашивает строго :
А сегодня что для завтра сделал я ?

Припев.

Я клянусь, что стану чище и добрее
И в беде не брошу друга никогда.
Слышу голос и спешу на зов скорее
По дороге, на которой нет следа.

Припев.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Russian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'russian';
END $$;
-- Song: Рэчанька
DO $$
DECLARE comp_id uuid;
BEGIN -- Insert composition
INSERT INTO public.compositions (title, original_author, is_public, owner_id)
VALUES ('Рэчанька', 'Traditional',
        true,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
RETURNING id INTO comp_id;
-- Insert standard version
INSERT INTO public.song_versions (composition_id, version_name, content_chordpro, contributor_id)
VALUES (
        comp_id,
        'Standard',
        '{title: Рэчанька}
{artist: Unknown}
{tag: Belarusian}
{tag: Water}
{tag: Women}

Ой, рэчанька, рэчанька, чаму ж ты ня поўная, 
Ой, рэчанька, рэчанька, чаму ж ты ня поўная,
Лю-лі лю-лі лю-лi, чаму ж ты ня поўная, 
Лю-лі лю-лі лю-лi, чаму ж ты ня поўная,

Чаму ж ты ня поўнаяй з беражком ня роўная. 
Чаму ж ты ня поўнаяй з беражком ня роўная. 
Лю-лі лю-лі лю-лi з беражком ня роўная, 
Лю-лі лю-лі лю-лi з беражком ня роўная. 

А як жа мне поўнай быць з беражкамі роўна плыць, 
А як жа мне поўнай быць з беражкамі роўна плыць. 
Люлі люлі люлі з беражкамі роўна плыць, 
Люлі люлі люлі з беражкамі роўна плыць. 

Янка коніка паіў, Кася воду чэрпала, 
Янка коніка паіў, Кася воду чэрпала. 
Лю-лі лю-лі лю-лi Кася воду чэрпала, 
Лю-лі лю-лі лю-лi Кася воду чэрпала.

Ой, рэчанька, рэчанька, чаму ж ты ня поўная, 
Ой, рэчанька, рэчанька, чаму ж ты ня поўная,
Лю-лі лю-лі лю-лi, чаму ж ты ня поўная, 
Лю-лі лю-лі лю-лi, чаму ж ты ня поўная.'
    ,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12');
-- Map categories
-- Tag: Belarusian
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'belarusian';
-- Tag: Water
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'water';
-- Tag: Women
INSERT INTO public.song_category_map (song_id, category_id)
SELECT comp_id,
    id
FROM public.categories
WHERE slug = 'women';
END $$;

-- Update SoundCloud and YouTube URLs for Nina Urku songs
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/marco-helenio-coelho/13-a-firmeza' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'A Firmeza');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/nathan-duvall-1/5-abuelito-tatewari' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Abuelito Tatewari');
UPDATE public.song_versions SET youtube_url = '0vh2hEvlz4A' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Abuelo (adida, adide)');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/cieloytierra-pedro-vadhar/agua-vital' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Agua Vital');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/nicole-andujar/ag-ita-que-vienes' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Agüita que Vienes');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/nicole-andujar/aguita' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Agüitay, agüita');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/jempe/sofia-by-jana-31-7-2011-in-as' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Aliança');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/guy-lacroix/anaboa' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Anaboa');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/shir-jivani/aqui-na-terra' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Aqui Na Terra');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/ayamlovemedicine/ayahuasca-taki-muyki-rachael-sessions' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Ayahuasca Urcumanta');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/floweroflife/aguas-claras' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Águas Claras');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/waximi_ackawala/cancao-da-jiboia-de-thiago-moreno-dantas' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Canção da Jibóia');
UPDATE public.song_versions SET youtube_url = 'Ui_k9mE8bYw' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Colibrí Dorado');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/jornada-da/curawaka-cunaq' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Cuñaq');
UPDATE public.song_versions SET youtube_url = 'Mi_L2fLEjhM' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Deusa (Curawaka)');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/nathan-duvall-1/8-eagle-song' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Eagle Song');
UPDATE public.song_versions SET youtube_url = 'gKNZ4aWhRnA' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'El Gran Espíritu nos da la Vida');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/ando-rah-doula/este-fuego-irina-florez' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Este fuego');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/yakuruna/flor-das-aguas' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Flor Das Águas');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/vleonov/flores-en-mi-camino' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Flores en mi camino');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/sound-of-light/108-floresta' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Floresta');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/astral-flowers-music/forca-do-rape' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Força do Rapé');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/mujeres-de-luna/fuerza-del-copal' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Fuerza Del Copal');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/patricia-karenina-casari/gitsi-manitu-hunter' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Gitsi Manitou');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/bastiaan-yansa/guerreiro-da-paz' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Guerreiro da paz');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/cuatro-vientos-pur-pecha/he-venido-aqui' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'He venido aqui');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/mcabz-1/icaro-sagrado-norma-panduro' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Icaro Sagrado');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/taller-aluna-beadworkcrafts/inan-tonanzin-tlali' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Inan Tonanzin');
UPDATE public.song_versions SET youtube_url = 'p013KHSU6Jo' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Inti Raymi');
UPDATE public.song_versions SET youtube_url = 'tAUFzXym088' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Kas ten po mano sodelį vaikščiojo');
UPDATE public.song_versions SET youtube_url = 'OzaD1PyB4UI' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'La Anaconda');
UPDATE public.song_versions SET youtube_url = '0vDQUgBz41s' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Lobos de la tribu');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/amma-nacer/madre-tierra-temazcal' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Madre Tierra Temazcal');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/nicole-andujar/nicole-mazatl' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Mazatl');
UPDATE public.song_versions SET youtube_url = '5rKUHyuEL70' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Mensageiro Beija Flor');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/mireialunna/mulheres-de-forca' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Mulheres de força');
UPDATE public.song_versions SET youtube_url = 'Q2RvkxuudHU' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'No hay más Coraje que sostener');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/curawaka_official/noku-mana' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Noku Mana');
UPDATE public.song_versions SET youtube_url = '5hVHVYdifRs' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Os segredos vem da floresta');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/samambai_a/pantera' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Pantera');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/sound-of-light/santa-maria-vem-chegar-neste' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Santa Maria vem chegando neste batalhão');
UPDATE public.song_versions SET youtube_url = 't4XPBtdX4FM' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Solo Dios Sabe Si Vuelvo (Abrete florcita)');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/user-578337830/tata-awara-saiti' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Tata Awarã');
UPDATE public.song_versions SET youtube_url = 'F_Zk3-bT8y8' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Tlazocamati');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/waximi_ackawala/todo-lleva-medicina-dentro-milagrospisaq-thea-mateu-becky-davidmp3' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Todo es Medicina');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/fevezyta-fonsek/voy-comiendo-medicina' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Voy comiendo medicina');
UPDATE public.song_versions SET soundcloud_url = 'https://soundcloud.com/vleonov/celebracion-a-la-estrella-matutina' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Yarin di rin din din din');
UPDATE public.song_versions SET youtube_url = 'DRYzImN_bDM' WHERE composition_id IN (SELECT id FROM public.compositions WHERE title = 'Прекрасное далеко');
