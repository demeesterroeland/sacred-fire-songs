export async function seedRandomData(client, count = 80) {
  console.log(`[random-seeder] Initializing database-side randomized seeding (target: ${count} songs)...`);

  const sql = `
DO $$
DECLARE
    -- Array constants for generation
    verbs text[] := ARRAY['Canto al', 'Danza del', 'Rezo al', 'Camino del', 'Luz de la', 'Fuerza de la', 'Cura de la', 'Llamado del', 'Voz del', 'Abuelo', 'Abuelita', 'Pájaro', 'Viento del', 'Espíritu de la', 'Sinfonía del', 'Latido de la', 'Ecos del', 'Guardián del'];
    nouns text[] := ARRAY['Selva', 'Luna', 'Tierra', 'Agua', 'Fuego', 'Estrella', 'Montaña', 'Sol', 'Vida', 'Medicina', 'Lluvia', 'Flor', 'Pachamama', 'Jaguar', 'Águila', 'Cóndor', 'Corazón', 'Piedra', 'Colibrí', 'Bosque', 'Cielo'];
    adjs text[] := ARRAY['Sagrado', 'Curandero', 'Cielo', 'Amor', 'Gratitud', 'Limpio', 'Brillante', 'Eterno', 'Puro', 'Viejo', 'Divino', 'Profundo', 'Cósmico', 'Universal', 'Ancestral', 'Verde'];
    authors text[] := ARRAY['Nina', 'Alonso del Río', 'Traditional', 'Diego Palma', 'Shimshai', 'Cari El', 'Ayla Schafer', 'Herbert Quinteros', 'Traditional (Camino Rojo)', 'Santo Daime', 'Traditional (Umbanda)', null];
    keys text[] := ARRAY['Am', 'Em', 'C', 'G', 'D', 'Dm', 'F', 'A', 'E', null];
    tunings text[] := ARRAY['Standard', 'Half-Step Down', 'Drop D', 'DADGAD'];
    
    -- Variables
    songs_count int := ${count};
    cat_count int;
    comp_id uuid;
    version_id uuid;
    tag_ids uuid[];
    selected_tags uuid[];
    forced_tag uuid;
    num_tags int;
    rand_val float;
    title text;
    artist text;
    owner_id uuid;
    is_public boolean;
    song_key text;
    capo int;
    tuning text;
    content text;
    var_has_chords boolean;
    has_youtube boolean;
    has_spotify boolean;
    has_soundcloud boolean;
    var_has_melody boolean;
    youtube_url text;
    spotify_url text;
    soundcloud_url text;
    
    -- Recordings generation variables
    rec_count int;
    rec_idx int;
    rec_name text;
    rec_path text;
    rec_uuid uuid;
    rec_names text[] := ARRAY['First Take', 'Practice Session', 'Late Night run', 'Slow practice', 'Full run-through', 'Tempo check', 'Acoustic draft', 'Vocal guide'];
    
    -- Playlist generation variables
    pl_id uuid;
    pl_titles text[] := ARRAY['Forest Sweat Lodge', 'Morning Hearth', 'My Private Practice', 'Full Moon Setlist', 'Guitar Circle Favorites'];
    pl_descs text[] := ARRAY['Powerful songs for high heat and deep clearing.', 'Gentle opening songs for morning meditation.', 'Songs I am practicing and learning right now.', 'Celebratory songs with rich melodies.', 'Chords-heavy songs for the circle to jam.'];
    pl_publics boolean[] := ARRAY[true, true, false, false, false];
    member_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    num_pl_songs int;
    
    -- For Box-Muller normal distribution
    u1 float;
    u2 float;
    rand_std_normal float;
    norm_val int;
BEGIN
    -- Check categories
    SELECT COUNT(*) INTO cat_count FROM public.categories;
    IF cat_count = 0 THEN
        INSERT INTO public.categories (name, slug, emoji, icon_name) VALUES
            ('The Elements', 'the-elements', '🔥', 'Flame'),
            ('Nature', 'nature', '🌲', 'Tree'),
            ('Languages', 'languages', '🗣️', 'Languages'),
            ('Lineage & Tradition', 'lineage-tradition', '🪶', 'Compass'),
            ('Medicine & Healing', 'medicine-healing', '🍵', 'HeartPulse'),
            ('Spiritual Concepts', 'spiritual-concepts', '👁️', 'Sparkles');
            
        -- Insert subcategories
        INSERT INTO public.categories (name, slug, emoji, parent_id)
        SELECT 'Fire', 'fire', '🔥', id FROM public.categories WHERE slug = 'the-elements' UNION ALL
        SELECT 'Water', 'water', '🌊', id FROM public.categories WHERE slug = 'the-elements' UNION ALL
        SELECT 'Air', 'air', '🌬️', id FROM public.categories WHERE slug = 'the-elements' UNION ALL
        SELECT 'Earth', 'earth', '🌱', id FROM public.categories WHERE slug = 'the-elements' UNION ALL
        
        SELECT 'Sun', 'sun', '☀️', id FROM public.categories WHERE slug = 'nature' UNION ALL
        SELECT 'Moon', 'moon', '🌙', id FROM public.categories WHERE slug = 'nature' UNION ALL
        SELECT 'Forest', 'forest', '🌲', id FROM public.categories WHERE slug = 'nature' UNION ALL
        SELECT 'Stars', 'stars', '✨', id FROM public.categories WHERE slug = 'nature' UNION ALL
        
        SELECT 'English', 'english', '🇬🇧', id FROM public.categories WHERE slug = 'languages' UNION ALL
        SELECT 'Spanish', 'spanish', '🇪🇸', id FROM public.categories WHERE slug = 'languages' UNION ALL
        SELECT 'Portuguese', 'portuguese', '🇵🇹', id FROM public.categories WHERE slug = 'languages' UNION ALL
        SELECT 'Sanskrit', 'sanskrit', '🇮🇳', id FROM public.categories WHERE slug = 'languages' UNION ALL
        
        SELECT 'Andean', 'andean', '🏔️', id FROM public.categories WHERE slug = 'lineage-tradition' UNION ALL
        SELECT 'Lakota', 'lakota', '🪶', id FROM public.categories WHERE slug = 'lineage-tradition' UNION ALL
        SELECT 'Santo Daime', 'santo-daime', '🌟', id FROM public.categories WHERE slug = 'lineage-tradition' UNION ALL
        SELECT 'Umbanda', 'umbanda', '🌊', id FROM public.categories WHERE slug = 'lineage-tradition' UNION ALL
        
        SELECT 'Ayahuasca', 'ayahuasca', '🍵', id FROM public.categories WHERE slug = 'medicine-healing' UNION ALL
        SELECT 'Peyote', 'peyote', '🌵', id FROM public.categories WHERE slug = 'medicine-healing' UNION ALL
        SELECT 'Rapé', 'rape', '🌬️', id FROM public.categories WHERE slug = 'medicine-healing' UNION ALL
        SELECT 'San Pedro', 'san-pedro', '🌵', id FROM public.categories WHERE slug = 'medicine-healing' UNION ALL
        
        SELECT 'Gratitude', 'gratitude', '🙏', id FROM public.categories WHERE slug = 'spiritual-concepts' UNION ALL
        SELECT 'Oneness', 'oneness', '✨', id FROM public.categories WHERE slug = 'spiritual-concepts' UNION ALL
        SELECT 'Healing', 'healing', '💚', id FROM public.categories WHERE slug = 'spiritual-concepts';
    END IF;
    
    -- Get list of subcategories
    SELECT array_agg(id) INTO tag_ids FROM public.categories WHERE parent_id IS NOT NULL;
    
    -- Insert compositions & versions
    FOR i IN 1..songs_count LOOP
        -- generate title
        title := verbs[1 + floor(random() * array_length(verbs, 1))] || ' ' || nouns[1 + floor(random() * array_length(nouns, 1))];
        IF random() > 0.4 THEN
            title := title || ' ' || adjs[1 + floor(random() * array_length(adjs, 1))];
        END IF;
        
        artist := authors[1 + floor(random() * array_length(authors, 1))];
        
        -- owner
        rand_val := random();
        IF rand_val < 0.25 THEN
            owner_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        ELSIF rand_val < 0.5 THEN
            owner_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
        ELSIF rand_val < 0.75 THEN
            owner_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
        ELSE
            owner_id := null;
        END IF;
        
        is_public := random() > 0.15;
        
        INSERT INTO public.compositions (title, original_author, is_public, owner_id)
        VALUES (title, artist, is_public, owner_id)
        RETURNING id INTO comp_id;
        
        -- version details
        song_key := keys[1 + floor(random() * array_length(keys, 1))];
        capo := floor(random() * 5);
        tuning := tunings[1 + floor(random() * array_length(tunings, 1))];
        var_has_chords := random() > 0.2;
        
        -- content
        content := '{title: ' || title || '}';
        IF artist IS NOT NULL THEN
            content := content || chr(10) || '{artist: ' || artist || '}';
        END IF;
        IF song_key IS NOT NULL THEN
            content := content || chr(10) || '{key: ' || song_key || '}';
        END IF;
        content := content || chr(10) || chr(10) || '[Am]Luna, luna, [C]luna llena' || chr(10) || '[G]Brilla en la [Am]noche entera';
        
        has_youtube := random() > 0.6;
        has_spotify := random() > 0.8;
        has_soundcloud := random() > 0.8;
        
        IF has_youtube THEN youtube_url := 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; ELSE youtube_url := null; END IF;
        IF has_spotify THEN spotify_url := 'https://open.spotify.com/track/4PTG3Z6ehGkBF3zIqYQGKg'; ELSE spotify_url := null; END IF;
        IF has_soundcloud THEN soundcloud_url := 'https://soundcloud.com/octobersveryown/drake-back-to-back'; ELSE soundcloud_url := null; END IF;
        var_has_melody := has_youtube OR has_spotify OR has_soundcloud OR (random() > 0.9);
        
        INSERT INTO public.song_versions (
            composition_id, version_name, content_chordpro, key, capo, tuning, 
            contributor_id, youtube_url, spotify_url, soundcloud_url
        )
        VALUES (
            comp_id, 'Standard', content, song_key, capo, tuning,
            coalesce(owner_id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
            youtube_url, spotify_url, soundcloud_url
        )
        RETURNING id INTO version_id;
        
        UPDATE public.compositions
        SET has_chords = var_has_chords, has_melody = var_has_melody
        WHERE id = comp_id;
        
        -- Seed private recordings
        rand_val := random();
        IF rand_val < 0.50 THEN
            -- 50% of the songs: multiple recordings (2 to 5)
            rec_count := 2 + floor(random() * 4); -- 2, 3, 4, or 5
        ELSIF rand_val < 0.80 THEN
            -- 30% of the songs: exactly 1 recording
            rec_count := 1;
        ELSE
            -- 20% of the songs: 0 recordings
            rec_count := 0;
        END IF;

        IF rec_count > 0 THEN
            FOR rec_idx IN 1..rec_count LOOP
                rec_name := rec_names[1 + floor(random() * array_length(rec_names, 1))];
                IF rec_count > 1 THEN
                    rec_name := rec_name || ' (Take ' || rec_idx || ')';
                END IF;
                rec_uuid := gen_random_uuid();
                rec_path := member_id || '/' || version_id || '/' || rec_uuid || '.webm';
                
                INSERT INTO public.user_recordings (id, user_id, song_version_id, recording_name, storage_path, created_at)
                VALUES (
                    rec_uuid,
                    member_id,
                    version_id,
                    rec_name,
                    rec_path,
                    now() - (random() * interval '7 days') - (rec_idx * interval '1 hour')
                );
            END LOOP;
        END IF;

        
        -- Box-Muller normal distribution around 3 (range 1-5)
        u1 := random();
        IF u1 = 0 THEN u1 := 0.0001; END IF; -- avoid log(0)
        u2 := random();
        rand_std_normal := sqrt(-2.0 * log(u1)) * sin(2.0 * pi() * u2);
        norm_val := round(3.0 + 1.0 * rand_std_normal);
        
        IF norm_val < 1 THEN num_tags := 1;
        ELSIF norm_val > 5 THEN num_tags := 5;
        ELSE num_tags := norm_val;
        END IF;
        
        -- Force-include each tag at least once during first iterations
        IF i <= array_length(tag_ids, 1) THEN
            forced_tag := tag_ids[i];
            IF num_tags > 1 THEN
                SELECT array_agg(id) INTO selected_tags FROM (
                    SELECT id FROM public.categories 
                    WHERE parent_id IS NOT NULL AND id != forced_tag
                    ORDER BY random() 
                    LIMIT (num_tags - 1)
                ) x;
                selected_tags := array_append(selected_tags, forced_tag);
            ELSE
                selected_tags := ARRAY[forced_tag];
            END IF;
        ELSE
            SELECT array_agg(id) INTO selected_tags FROM (
                SELECT id FROM public.categories 
                WHERE parent_id IS NOT NULL 
                ORDER BY random() 
                LIMIT num_tags
            ) x;
        END IF;
        
        -- Insert mappings
        IF selected_tags IS NOT NULL THEN
            FOR j IN 1..array_length(selected_tags, 1) LOOP
                INSERT INTO public.song_category_map (song_id, category_id)
                VALUES (comp_id, selected_tags[j])
                ON CONFLICT DO NOTHING;
            END LOOP;
        END IF;
    END LOOP;
    
    -- Playlist seeding
    FOR i IN 1..5 LOOP
        pl_id := ('bbbbbbbb-000' || i || '-4000-b000-00000000000' || i)::uuid;
        
        INSERT INTO public.setlists (id, owner_id, title, description, is_public)
        VALUES (pl_id, member_id, pl_titles[i], pl_descs[i], pl_publics[i])
        ON CONFLICT (id) DO NOTHING;
        
        -- Select 5-12 random song versions to add
        num_pl_songs := 5 + floor(random() * 8);
        
        INSERT INTO public.setlist_items (setlist_id, song_version_id, order_index)
        SELECT pl_id, sv.id, row_number() OVER ()
        FROM public.song_versions sv
        ORDER BY random()
        LIMIT num_pl_songs
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
  `;

  await client.query(sql);
  console.log('[random-seeder] Database-side randomized seeding completed successfully!');
}
