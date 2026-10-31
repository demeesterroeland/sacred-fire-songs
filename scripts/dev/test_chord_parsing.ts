
import ChordSheetJS from 'chordsheetjs';

const chordPro = `
{title: Abre tus alas}
{artist: Nina}

{start_of_verse: Verse 1}
[Dm]Abre tus alas [A7]pajaro vo[Dm]lar
[Gm]con plumas de colores [A7]danzandole a la mar
{end_of_verse}

{start_of_chorus: Chorus}
[Gm]Abre tus alas [Dm]libres y a volar
[A7]el sol y las estrellas [Dm]son mi guia al caminar[D7]
{end_of_chorus}
`;

const parser = new ChordSheetJS.ChordProParser();
const song = parser.parse(chordPro);

console.log(JSON.stringify(song, null, 2));
