import React from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { initiateSpotifyLogin } from '../services/spotifyAuth';
import './ConnectionModal.css';

interface Props {
  onClose: () => void;
}

const ConnectionModal: React.FC<Props> = ({ onClose }) => {
  const { spotifyToken } = usePlayerStore();

  const handleConnectSpotify = () => {
    initiateSpotifyLogin();
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('code_verifier');
    usePlayerStore.getState().setSpotifyToken(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>Music Integrations</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="provider-list">
          <div className={`provider-card ${spotifyToken ? 'active' : ''}`} onClick={() => {
            if (!spotifyToken) handleConnectSpotify();
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z" />
            </svg>
            <div className="provider-info">
              <h3>Connect to Spotify</h3>
              <p>{spotifyToken ? 'Connected! Access your Playlists' : 'Login to access your library'}</p>
            </div>
            {spotifyToken && (
              <button className="disconnect-btn" onClick={handleDisconnect}>
                Disconnect
              </button>
            )}
          </div>
        </div>

        <p className="modal-disclaimer">
          Connecting to Spotify imports your personal playlists. The audio will be automatically streamed via Saavn (free) for maximum compatibility.
        </p>
      </div>
    </div>
  );
};

export default ConnectionModal;
