// songShift.ts
// SongShift — Import Spotify playlists with zero configuration.
// Uses the server-side proxy in vite.config.ts to fetch playlist data.
// No API keys, no developer dashboard, no login needed.

import { playSpotifyTrackViaSaavn } from './api';
import type { Track } from '../stores/usePlayerStore';

// Extract playlist ID from various Spotify URL formats
export const extractPlaylistId = (input: string): string | null => {
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
  const urlMatch = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
  const uriMatch = input.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];

  // Raw ID
  if (/^[a-zA-Z0-9]{22}$/.test(input.trim())) return input.trim();

  return null;
};

// Fetch playlist data from our server-side proxy
const fetchPlaylistFromProxy = async (playlistId: string) => {
  const res = await fetch(`/api/spotify-playlist?id=${encodeURIComponent(playlistId)}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch playlist');
  }

  return data as {
    name: string;
    image: string;
    total: number;
    tracks: { name: string; artist: string; artwork: string }[];
  };
};

// The full SongShift pipeline: Fetch Spotify → Match on Saavn → Return playable tracks
export const songShiftImport = async (
  playlistUrl: string,
  onProgress?: (status: string) => void
): Promise<{ name: string; tracks: Track[] }> => {
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) throw new Error('Invalid Spotify link. Copy the playlist link from the Spotify app.');

  if (onProgress) onProgress('Fetching playlist from Spotify...');

  const playlist = await fetchPlaylistFromProxy(playlistId);

  if (!playlist.tracks.length) {
    throw new Error('This playlist appears to be empty.');
  }

  if (onProgress) onProgress(`Found "${playlist.name}" — matching ${playlist.tracks.length} tracks...`);

  const matchedTracks: Track[] = [];

  for (let i = 0; i < playlist.tracks.length; i++) {
    const st = playlist.tracks[i];
    if (onProgress) onProgress(`Matching (${i + 1}/${playlist.tracks.length}): ${st.name}`);

    try {
      const matched = await playSpotifyTrackViaSaavn(st.name, st.artist, st.artwork);
      matchedTracks.push(matched);
    } catch (e) {
      console.warn(`Could not match: ${st.name} by ${st.artist}`);
    }
  }

  return { name: playlist.name, tracks: matchedTracks };
};
