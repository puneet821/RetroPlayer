const https = require('https');

const songs = [
  "Kaavish - Tere Pyaar Main",
  "Kaavish - Piya Dekho Na",
  "Kaavish - Dekho",
  "Kaavish - Sunn Zaraa",
  "Kaavish - Bachpan",
  "Kaavish - Koi Hai To Sahee",
  "Kaavish - Chaand Taaray",
  "Kaavish - Dil Main Meray",
  "Kaavish - Baat Unkahi feat. Samra Khan",
  "Kaavish - Moray Sayyaan",
  "Kaavish - Chaltay Rahein"
];

const fetchJson = (url) => new Promise((resolve, reject) => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                resolve(null);
            }
        });
    }).on('error', reject);
});

const formatSongToTrack = (s) => {
  if (s.media_url) {
      return {
          id: s.id,
          title: s.song || s.title || 'Unknown',
          artist: s.singers || s.primary_artists || 'Unknown Artist',
          artwork: typeof s.image === 'string' ? s.image : '',
          url: s.media_url, 
      };
  }
  return null;
};

async function main() {
    const customSongs = [];
    for (const fullName of songs) {
        try {
            const titleOnly = fullName.split('-')[1].trim();
            const query = encodeURIComponent("Kaavish " + titleOnly);
            const url = `https://saavnapi-nine.vercel.app/result/?query=${query}`;
            const data = await fetchJson(url);
            if (data && Array.isArray(data) && data.length > 0) {
                const track = formatSongToTrack(data[0]);
                if (track && track.url) {
                    customSongs.push({
                        ...track,
                        id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        title: fullName, // Preserve original title
                    });
                    console.log(`Found: ${titleOnly}`);
                } else {
                    console.log(`No URL for: ${titleOnly}`);
                }
            } else {
                console.log(`No results for: ${titleOnly}`);
            }
        } catch (e) {
            console.error(`Error for ${fullName}:`, e.message);
        }
    }
    
    console.log("\n\nexport const CUSTOM_SONGS: Track[] = " + JSON.stringify(customSongs, null, 2) + ";");
}

main();
