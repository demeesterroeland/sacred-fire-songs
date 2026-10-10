const ChordSheetJS = require('chordsheetjs');
const parser = new ChordSheetJS.ChordProParser();
const chordPro = "{title: Test Song}\n[Am]Hello [G]World";
const song = parser.parse(chordPro);
console.log(JSON.stringify(song, (key, value) => {
    if (key === 'song') return undefined; // Avoid circular reference
    return value;
}, 2));
