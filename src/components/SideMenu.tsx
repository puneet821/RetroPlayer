import React, { useState, useEffect } from 'react';
import { X, Loader2, Play, ChevronLeft, Library } from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { playSpotifyTrackViaSaavn } from '../services/api';
import './SideMenu.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: React.FC<Props> = ({ isOpen, onClose }) => {
  const { spotifyToken, setTrack } = usePlayerStore();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && spotifyToken && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [isOpen, spotifyToken]);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/playlists?limit=50`, {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Spotify Error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      setPlaylists(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistTracks = async (playlist: any) => {
    setSelectedPlaylist(playlist);
    setLoading(true);
    setError('');
    setTracks([]);
    try {
      // Fetch explicitly requesting the tracks field
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}?fields=tracks.items(track(id,name,artists,album(images)))`, {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Spotify Error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      const items = data.tracks?.items || [];
      const validItems = Array.isArray(items) ? items : [];
      const finalTracks = validItems.map((item: any) => item.track).filter(Boolean);
      
      setTracks(finalTracks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySpotifyTrack = async (spotifyTrack: any) => {
    setPlayingId(spotifyTrack.id);
    try {
      const title = spotifyTrack.name;
      const artist = spotifyTrack.artists[0]?.name || 'Unknown';
      const artwork = spotifyTrack.album?.images[0]?.url || '';
      
      const hybridTrack = await playSpotifyTrackViaSaavn(title, artist, artwork);
      setTrack(hybridTrack);
    } catch (err: any) {
      alert("Error playing track: " + err.message);
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <>
      <div className={`side-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`side-menu glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          {selectedPlaylist ? (
            <button onClick={() => setSelectedPlaylist(null)} className="back-btn">
              <ChevronLeft size={24} />
              <span className="playlist-title-truncate">{selectedPlaylist.name}</span>
            </button>
          ) : (
            <h2>Your Library</h2>
          )}
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>

        {!spotifyToken ? (
          <div className="side-menu-empty">
            <Library size={48} opacity={0.2} style={{marginBottom: '10px'}} />
            <p>Connect to Spotify in settings to access your personal playlists.</p>
          </div>
        ) : (
          <div className="side-menu-content">
            {loading && !tracks.length && !playlists.length && (
              <div className="loading-state">
                <Loader2 size={24} className="spin-icon" />
              </div>
            )}
            
            {error && <p className="error-text">{error}</p>}

            {/* BUILT-IN CURATED PLAYLISTS */}
            {!spotifyToken && !selectedPlaylist && (
              <div className="spotify-results">
                <div className="spotify-track-card" onClick={() => {
                  setSelectedPlaylist({ name: 'Top Hindi Hits' });
                  setTracks([
                    { id: '1', name: 'Tum Hi Ho', artists: [{ name: 'Arijit Singh' }], album: { images: [{ url: 'https://c.saavncdn.com/258/Aashiqui-2-Hindi-2013-500x500.jpg' }] } },
                    { id: '2', name: 'Chaleya', artists: [{ name: 'Arijit Singh' }], album: { images: [{ url: 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814014337-500x500.jpg' }] } },
                    { id: '3', name: 'Kesariya', artists: [{ name: 'Arijit Singh' }], album: { images: [{ url: 'https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg' }] } },
                    { id: '4', name: 'Apna Bana Le', artists: [{ name: 'Arijit Singh' }], album: { images: [{ url: 'https://c.saavncdn.com/814/Bhediya-Hindi-2022-20221128185523-500x500.jpg' }] } },
                    { id: '5', name: 'Kabira', artists: [{ name: 'Arijit Singh' }], album: { images: [{ url: 'https://c.saavncdn.com/111/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.jpg' }] } },
                  ]);
                }}>
                  <img src="https://c.saavncdn.com/258/Aashiqui-2-Hindi-2013-500x500.jpg" alt="Top Hindi Hits" />
                  <div className="track-info">
                    <h4>Top Hindi Hits</h4>
                    <p>Curated Playlist</p>
                  </div>
                </div>

                <div className="spotify-track-card" onClick={() => {
                  setSelectedPlaylist({ name: 'Global Top 50' });
                  setTracks([
                    { id: '6', name: 'Blinding Lights', artists: [{ name: 'The Weeknd' }], album: { images: [{ url: 'https://c.saavncdn.com/973/Blinding-Lights-English-2019-20191129060416-500x500.jpg' }] } },
                    { id: '7', name: 'Shape of You', artists: [{ name: 'Ed Sheeran' }], album: { images: [{ url: 'https://c.saavncdn.com/749/Divide-Deluxe-English-2017-500x500.jpg' }] } },
                    { id: '8', name: 'Starboy', artists: [{ name: 'The Weeknd' }], album: { images: [{ url: 'https://c.saavncdn.com/181/Starboy-English-2016-500x500.jpg' }] } },
                    { id: '9', name: 'Dance Monkey', artists: [{ name: 'Tones And I' }], album: { images: [{ url: 'https://c.saavncdn.com/832/Dance-Monkey-English-2019-20190510001042-500x500.jpg' }] } },
                    { id: '10', name: 'Perfect', artists: [{ name: 'Ed Sheeran' }], album: { images: [{ url: 'https://c.saavncdn.com/749/Divide-Deluxe-English-2017-500x500.jpg' }] } },
                  ]);
                }}>
                  <img src="https://c.saavncdn.com/973/Blinding-Lights-English-2019-20191129060416-500x500.jpg" alt="Global Top 50" />
                  <div className="track-info">
                    <h4>Global Top 50</h4>
                    <p>Curated Playlist</p>
                  </div>
                </div>

                <div className="spotify-track-card" onClick={() => {
                  setSelectedPlaylist({ name: 'Lo-Fi Chill' });
                  setTracks([
                    { id: '11', name: 'snowfall', artists: [{ name: 'Oneheart' }], album: { images: [{ url: 'https://c.saavncdn.com/393/snowfall-English-2022-20220215033742-500x500.jpg' }] } },
                    { id: '12', name: 'Aesthetic', artists: [{ name: 'Tollan Kim' }], album: { images: [{ url: 'https://c.saavncdn.com/490/Aesthetic-English-2022-20220304162744-500x500.jpg' }] } },
                    { id: '13', name: 'Lofi Study', artists: [{ name: 'FASSounds' }], album: { images: [{ url: 'https://c.saavncdn.com/310/Lofi-Study-English-2022-20220803125134-500x500.jpg' }] } },
                  ]);
                }}>
                  <img src="https://c.saavncdn.com/393/snowfall-English-2022-20220215033742-500x500.jpg" alt="Lo-Fi Chill" />
                  <div className="track-info">
                    <h4>Lo-Fi Chill</h4>
                    <p>Curated Playlist</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="spotify-results">
              {/* PLAYLISTS VIEW */}
              {spotifyToken && !selectedPlaylist && playlists.map((p) => (
                <div key={p.id} className="spotify-track-card" onClick={() => fetchPlaylistTracks(p)}>
                  <img src={p.images?.[0]?.url || 'https://via.placeholder.com/48'} alt={p.name} />
                  <div className="track-info">
                    <h4>{p.name}</h4>
                    <p>{p.tracks?.total} tracks</p>
                  </div>
                </div>
              ))}

              {/* TRACKS VIEW */}
              {selectedPlaylist && tracks.map((track) => (
                <div key={track.id} className="spotify-track-card" onClick={() => handlePlaySpotifyTrack(track)}>
                  <img src={track.album?.images?.[0]?.url || 'https://via.placeholder.com/48'} alt={track.name} />
                  <div className="track-info">
                    <h4>{track.name}</h4>
                    <p>{track.artists?.[0]?.name}</p>
                  </div>
                  <button className="play-btn-small">
                    {playingId === track.id ? <Loader2 size={16} className="spin-icon" /> : <Play size={16} fill="currentColor" />}
                  </button>
                </div>
              ))}
              
              {selectedPlaylist && loading && tracks.length === 0 && (
                <div className="loading-state">
                  <Loader2 size={24} className="spin-icon" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
