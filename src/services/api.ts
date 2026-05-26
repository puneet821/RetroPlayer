import type { Track } from '../stores/usePlayerStore';

export const getBestLink = (urls: any[]) => {
  if (!urls || !urls.length) return null;
  const pref = '160kbps'; // Default quality
  let order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  if (pref === '160kbps') {
      order = ['160kbps', '96kbps', '320kbps', '48kbps', '12kbps'];
  } else if (pref === '96kbps') {
      order = ['96kbps', '48kbps', '160kbps', '320kbps', '12kbps'];
  }
  for (const q of order) {
      const found = urls.find(u => u.quality === q);
      if (found) return found.url || found.link || null;
  }
  const first = urls[0];
  return first?.url || first?.link || null;
};

export const getBestImage = (imgs: any[]) => {
  if (!imgs || !imgs.length) return '';
  const big = imgs.find(i => i.quality === '500x500' || i.quality === '150x150');
  if (big) return big.url || big.link || '';
  const last = imgs[imgs.length - 1];
  return last?.url || last?.link || '';
};

export const formatSongToTrack = (s: any): Track => {
  if (s.media_url) {
      return {
          id: s.id,
          title: s.song || s.title || 'Unknown',
          artist: s.singers || s.primary_artists || 'Unknown Artist',
          artwork: s.image || '',
          url: s.media_url, 
      };
  }
  const rawUrl = getBestLink(s.downloadUrl || []);
  return {
      id: s.id,
      title: s.name || s.title || 'Unknown',
      artist: s.primaryArtists || s.artist || (s.artists?.primary || []).map((a: any) => a.name).join(', ') || 'Unknown Artist',
      artwork: getBestImage(s.image || []),
      url: rawUrl || '',
  };
};

export const searchSongs = async (query: string, limit = 10): Promise<Track[]> => {
  const q = encodeURIComponent(query);
  const urls = [
      `https://saavnapi-nine.vercel.app/result/?query=${q}`,
      `https://jiosaavn-api-2.vercel.app/search/songs?query=${q}&limit=${limit}`
  ];

  let lastErr = null;
  for (const url of urls) {
      try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = await res.json();

          let raw = [];
          if (Array.isArray(data)) raw = data;
          else if (data.status === 'SUCCESS' && data.data?.results) raw = data.data.results;
          else if (Array.isArray(data.results)) raw = data.results;
          else continue;

          const tracks = raw.map(formatSongToTrack).filter(t => t.url);
          if (tracks.length) return tracks;
      } catch (e) {
          lastErr = e;
      }
  }
  throw lastErr || new Error('All search sources failed');
};

// Hybrid logic: Map a Spotify track to Saavn audio
export const playSpotifyTrackViaSaavn = async (spotifyTrackTitle: string, spotifyArtistName: string, spotifyArtwork: string): Promise<Track> => {
  // Query format: "SongName ArtistName"
  const query = `${spotifyTrackTitle} ${spotifyArtistName}`;
  const results = await searchSongs(query, 5);
  
  if (!results.length) {
    throw new Error('Could not find this track on Saavn.');
  }
  
  const bestMatch = results[0]; // Assume first result is best
  
  // Return the Saavn audio URL but KEEP the high-res Spotify metadata
  return {
    ...bestMatch,
    id: `hybrid-${bestMatch.id}`,
    title: spotifyTrackTitle,
    artist: spotifyArtistName,
    artwork: spotifyArtwork || bestMatch.artwork, // Favor Spotify's cover art if available
  };
};
