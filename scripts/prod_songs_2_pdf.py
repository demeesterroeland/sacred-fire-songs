#!/bin/sh
'''':
if [ -d ".venv" ]; then
  exec .venv/bin/python "$0" "$@"
elif [ -d "../.venv" ]; then
  exec ../.venv/bin/python "$0" "$@"
else
  exec python3 "$0" "$@"
fi
'''
import os
import re
import html
import psycopg2

def clean_filename(title):
    s = title.lower()
    # Replace accents for clean URLs/filenames
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ñ': 'n', 'ü': 'u', 'ç': 'c', 'ã': 'a', 'õ': 'o',
        'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u'
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    # Strip special chars, replace spaces/hyphens/underscores with a single underscore
    s = re.sub(r'[^a-z0-9\s_-]', '', s)
    s = re.sub(r'[\s_-]+', '_', s)
    s = s.strip('_')
    return s + '.cho'

def format_to_chordpro(song):
    content = song['lyrics'] or ""
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    
    # Strip any inline metadata headers to avoid duplicates
    lyrics_lines = content.split('\n')
    clean_lyrics_lines = []
    
    existing_tags = set()
    existing_title = None
    existing_artist = None
    existing_key = None
    existing_capo = None
    
    for line in lyrics_lines:
        line_stripped = line.strip()
        matched = False
        
        # Match title
        m = re.match(r'^\{(?:title|t):\s*(.*?)\}\s*$', line_stripped, re.IGNORECASE)
        if m:
            existing_title = m.group(1).strip()
            matched = True
            
        # Match artist/author
        m = re.match(r'^\{(?:artist|a|author):\s*(.*?)\}\s*$', line_stripped, re.IGNORECASE)
        if m:
            existing_artist = m.group(1).strip()
            matched = True
            
        # Match key
        m = re.match(r'^\{(?:key|k):\s*(.*?)\}\s*$', line_stripped, re.IGNORECASE)
        if m:
            existing_key = m.group(1).strip()
            matched = True
            
        # Match capo
        m = re.match(r'^\{(?:capo):\s*(.*?)\}\s*$', line_stripped, re.IGNORECASE)
        if m:
            existing_capo = m.group(1).strip()
            matched = True
            
        # Match tag
        m = re.match(r'^\{(?:tag):\s*(.*?)\}\s*$', line_stripped, re.IGNORECASE)
        if m:
            existing_tags.add(m.group(1).strip())
            matched = True
            
        if not matched:
            clean_lyrics_lines.append(line)
            
    clean_lyrics = '\n'.join(clean_lyrics_lines).strip()
    
    # Consolidate metadata
    title = existing_title or song['title']
    artist = existing_artist or song['author']
    key = existing_key or song['key']
    
    # Parse capo safely
    capo = None
    if existing_capo is not None:
        capo = existing_capo
    elif song['capo'] and song['capo'] > 0:
        capo = str(song['capo'])
        
    tags = set(song['tags'])
    tags.update(existing_tags)
    
    # Construct clean ChordPro header
    header = []
    if title:
        header.append(f"{{title: {title}}}")
    if artist and artist != 'Unknown':
        header.append(f"{{artist: {artist}}}")
    if key:
        header.append(f"{{key: {key}}}")
    if capo:
        header.append(f"{{capo: {capo}}}")
        
    for tag in sorted(tags):
        header.append(f"{{tag: {tag}}}")
        
    return '\n'.join(header) + "\n\n" + clean_lyrics

def main():
    conn_str = "postgresql://postgres.REDACTED_PROD_PROJECT_ID:REDACTED_DB_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
    output_dir = "data/extracted_songs/production_db"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Connecting to Production Database...")
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    
    query = """
    SELECT 
        c.id,
        c.title,
        c.original_author AS author,
        (
            SELECT content_chordpro 
            FROM public.song_versions 
            WHERE composition_id = c.id 
            ORDER BY created_at ASC 
            LIMIT 1
        ) AS lyrics,
        (
            SELECT key 
            FROM public.song_versions 
            WHERE composition_id = c.id 
            ORDER BY created_at ASC 
            LIMIT 1
        ) AS key,
        (
            SELECT capo 
            FROM public.song_versions 
            WHERE composition_id = c.id 
            ORDER BY created_at ASC 
            LIMIT 1
        ) AS capo,
        ARRAY(
            SELECT cat.name 
            FROM public.categories cat
            JOIN public.song_category_map scm ON scm.category_id = cat.id
            WHERE scm.song_id = c.id
        ) AS tags
    FROM public.compositions c
    ORDER BY LOWER(c.title) ASC;
    """
    
    print("Fetching songs...")
    cur.execute(query)
    rows = cur.fetchall()
    
    print(f"Syncing {len(rows)} songs to '{output_dir}'...")
    count = 0
    for row in rows:
        song_id, title, author, lyrics, key, capo, tags = row
        if not lyrics:
            continue
            
        song_data = {
            'title': title,
            'author': author,
            'lyrics': lyrics,
            'key': key,
            'capo': capo,
            'tags': tags
        }
        
        chordpro_content = format_to_chordpro(song_data)
        filename = clean_filename(title)
        file_path = os.path.join(output_dir, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(chordpro_content)
        count += 1
        
    cur.close()
    conn.close()
    print(f"Successfully synced {count} songs as `.cho` files.")
    
    # Update .gitignore
    gitignore_path = ".gitignore"
    git_ignore_line = "/data/extracted_songs/production_db/"
    
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if git_ignore_line not in content:
            print("Adding production_db/ to .gitignore...")
            # Ensure newline at the end
            if not content.endswith('\n'):
                content += '\n'
            content += f"\n# Synced Production DB songs\n{git_ignore_line}\n"
            with open(gitignore_path, 'w', encoding='utf-8') as f:
                f.write(content)
        else:
            print("production_db/ is already ignored in .gitignore.")
            
    # Compile to PDF using chordpro CLI
    pdf_output = "production_songbook.pdf"
    print(f"Compiling synced songs from '{output_dir}' into '{pdf_output}'...")
    
    cho_files = [
        os.path.join(output_dir, f)
        for f in os.listdir(output_dir)
        if f.endswith('.cho')
    ]
    cho_files.sort(key=lambda x: os.path.basename(x).lower())
    
    if not cho_files:
        print("No .cho files found to compile.")
        return
        
    cmd = ['chordpro', '--page-size=a4', '--toc', '--no-chord-grids', '--define=pdf.songbook.align-songs=false', '-o', pdf_output]
    cmd.extend(cho_files)
    
    try:
        import subprocess
        subprocess.run(cmd, check=True)
        print(f"Successfully compiled PDF songbook at '{pdf_output}'!")
    except FileNotFoundError:
        print("Warning: 'chordpro' CLI tool is not installed or not in PATH. PDF compilation skipped.")
    except subprocess.CalledProcessError as e:
        print(f"Error compiling PDF: {e}")

if __name__ == '__main__':
    main()
