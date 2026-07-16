# Task: Sync Production DB Songs and Move Folders

- [x] Move all songs from `doc/extracted_songs` to `docs/extracted_songs` using `git mv`
- [x] Write Python database and ChordPro parser script (`scripts/prod_songs_2_pdf.py`)
- [x] Fetch all songs from Production DB (read-only)
- [x] Format songs to clean ChordPro `.cho` files, merging DB and text metadata
- [x] Write files to `data/extracted_songs/production_db/`
- [x] Update `.gitignore` to ignore the `production_db/` folder to prevent committing to Git
- [x] Run script to sync 238 songs successfully
