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
        res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
});

const getBestLink = (urls) => {
  if (!urls || !urls.length) return null;
  const pref = '160kbps'; // Default quality
  let order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  for (const q of order) {
      const found = urls.find(u => u.quality === q);
      if (found) return found.url || found.link || null;
  }
  const first = urls[0];
  return first?.url || first?.link || null;
};

const getBestImage = (imgs) => {
  if (!imgs || !imgs.length) return '';
  const big = imgs.find(i => i.quality === '500x500' || i.quality === '150x150');
  if (big) return big.url || big.link || '';
  const last = imgs[imgs.length - 1];
  return last?.url || last?.link || '';
};

const formatSongToTrack = (s) => {
  const rawUrl = getBestLink(s.downloadUrl || []);
  return {
      id: s.id,
      title: s.name || s.title || 'Unknown',
      artist: s.primaryArtists || s.artist || (s.artists?.primary || []).map((a) => a.name).join(', ') || 'Unknown Artist',
      artwork: getBestImage(s.image || []),
      url: rawUrl || '',
  };
};

async function main() {
    const customSongs = [];
    for (const title of songs) {
        try {
            const query = encodeURIComponent(title.replace('Kaavish - ', 'Kaavish '));
            const url = `https://jiosaavn-api-2.vercel.app/search/songs?query=${query}&limit=1`;
            const data = await fetchJson(url);
            if (data && data.data && data.data.results && data.data.results.length > 0) {
                const track = formatSongToTrack(data.data.results[0]);
                if (track.url) {
                    customSongs.push(track);
                    console.log(`Found: ${title}`);
                } else {
                    console.log(`No URL for: ${title}`);
                }
            } else {
                console.log(`No results for: ${title}`);
            }
        } catch (e) {
            console.error(`Error for ${title}:`, e.message);
        }
    }
    
    console.log("\n\nexport const CUSTOM_SONGS: Track[] = " + JSON.stringify(customSongs, null, 2) + ";");
}

main();
