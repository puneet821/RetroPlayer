import React from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { CustomPlaylist } from '../stores/usePlayerStore';
import './PlaylistStack.css';
import { X, Play, Edit2 } from 'lucide-react';

const colors = [
  '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
];

const PlaylistStack: React.FC = () => {
  const { customPlaylists, setTrack, setQueue, setIsPlaylistViewOpen: closeView, updatePlaylistCover } = usePlayerStore();
  const [selectedPlaylist, setSelectedPlaylist] = React.useState<CustomPlaylist | null>(null);
  const [playingTrackId, setPlayingTrackId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectPlaylist = (playlist: CustomPlaylist) => {
    setSelectedPlaylist(playlist);
  };

  const handlePlayTrack = (track: any, index: number) => {
    if (selectedPlaylist) {
      setQueue(selectedPlaylist.tracks, index);
    } else {
      setTrack(track);
    }
    setPlayingTrackId(track.id);
    closeView(false);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPlaylist) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updatePlaylistCover(selectedPlaylist.id, result);
        setSelectedPlaylist(prev => prev ? { ...prev, coverUrl: result } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="playlist-stack-overlay">
      <button className="close-stack-btn glass" onClick={() => closeView(false)}>
        <X size={24} />
      </button>
      
      {selectedPlaylist ? (
        <div className="playlist-detail-view">
          <div className="playlist-detail-header glass">
            <button className="back-btn" onClick={() => setSelectedPlaylist(null)}>
              &larr; Back
            </button>
            <div 
              className="detail-cover-wrapper" 
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '8px' }}
            >
              {selectedPlaylist.coverUrl ? (
                <img src={selectedPlaylist.coverUrl} alt="" className="detail-cover" />
              ) : (
                <div className="detail-cover-placeholder"></div>
              )}
              <div className="cover-edit-overlay" style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
              }}>
                <Edit2 size={24} color="white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            <div className="detail-info">
              <h2>{selectedPlaylist.name}</h2>
              <p>{selectedPlaylist.tracks.length} tracks</p>
            </div>
          </div>
          <div className="track-list">
            {selectedPlaylist.tracks.map((t, i) => (
              <div key={t.id + i} className="track-item glass" onClick={() => handlePlayTrack(t, i)}>
                <img src={t.artwork} alt="" className="track-thumb" />
                <div className="track-info-list">
                  <div className="track-name">{t.title}</div>
                  <div className="track-artists">{t.artist}</div>
                </div>
                {playingTrackId === t.id ? (
                  <div className="spinner small-spinner"></div>
                ) : (
                  <Play size={20} className="track-play-icon" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="perspective-container">
          {customPlaylists.length === 0 ? (
            <div className="empty-playlist-stack">
              <h2 style={{ color: 'white', marginBottom: '20px' }}>Create a playlist first</h2>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('playlistName') as HTMLInputElement;
                  if (input.value.trim()) {
                    usePlayerStore.getState().createCustomPlaylist(input.value.trim());
                  }
                }}
                className="inline-create-form"
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}
              >
                <input 
                  type="text" 
                  name="playlistName"
                  placeholder="Enter playlist name..." 
                  autoFocus
                  style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    outline: 'none',
                    width: '250px',
                    textAlign: 'center'
                  }}
                />
                <button 
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '250px'
                  }}
                >
                  Create Playlist
                </button>
              </form>
            </div>
          ) : (
            <div className="stack-wrapper">
              {customPlaylists.map((playlist, index) => {
                const edgeColor = colors[index % colors.length];
                return (
                  <div 
                    key={playlist.id} 
                    className="playlist-card-3d"
                    style={{ 
                      '--edge-color': edgeColor
                    } as React.CSSProperties}
                    data-title={playlist.name}
                    onClick={() => handleSelectPlaylist(playlist)}
                  >
                    <div className="card-face main-face">
                      {playlist.coverUrl ? (
                        <img src={playlist.coverUrl} alt={playlist.name} />
                      ) : (
                        <div className="card-face-placeholder">{playlist.name}</div>
                      )}
                      <div className="play-overlay">
                        <Play size={40} fill="white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistStack;
