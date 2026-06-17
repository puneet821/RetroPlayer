import React, { useState } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { X, Plus, Music, Trash2, Download, Upload, Loader2, ArrowRight } from 'lucide-react';
import { songShiftImport } from '../services/songShift';
import './HamburgerMenu.css';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const { customPlaylists, createCustomPlaylist, deleteCustomPlaylist, exportPlaylists, importPlaylists, createCustomPlaylistWithTracks } = usePlayerStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // SongShift state
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createCustomPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleSongShift = async () => {
    if (!playlistUrl.trim()) return;
    setIsImporting(true);
    setImportStatus('Starting import...');
    try {
      const { name, tracks } = await songShiftImport(
        playlistUrl.trim(),
        (status) => setImportStatus(status)
      );
      createCustomPlaylistWithTracks(name, tracks);
      setImportStatus(`✅ Imported "${name}" — ${tracks.length} tracks!`);
      setPlaylistUrl('');
      setTimeout(() => setImportStatus(''), 5000);
    } catch (e: any) {
      setImportStatus(`❌ ${e.message || 'Import failed'}`);
      setTimeout(() => setImportStatus(''), 5000);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="hamburger-backdrop" onClick={onClose} />}
      
      {/* Sidebar */}
      <div className={`hamburger-sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="hamburger-header">
          <h2>My Library</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="hamburger-content">
          {/* SongShift Section */}
          <div className="songshift-section">
            <h3 className="songshift-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15.001 10.62 18.66 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.239.54-.959.72-1.56.3z" />
              </svg>
              SongShift
            </h3>
            <p className="songshift-hint">Paste any Spotify playlist link to import it</p>
            <div className="songshift-input-row">
              <input
                type="text"
                placeholder="https://open.spotify.com/playlist/..."
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="glass-input"
                style={{ flex: 1 }}
                disabled={isImporting}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSongShift(); }}
              />
              <button 
                className="songshift-go-btn"
                onClick={handleSongShift}
                disabled={isImporting || !playlistUrl.trim()}
                title="Import Playlist"
              >
                {isImporting ? <Loader2 size={18} className="spin-icon" /> : <ArrowRight size={18} />}
              </button>
            </div>
            {importStatus && (
              <div className="songshift-status">{importStatus}</div>
            )}
          </div>

          <div className="create-playlist-section">
            {!isCreating ? (
              <button 
                className="create-btn glass" 
                onClick={() => setIsCreating(true)}
              >
                <Plus size={20} />
                <span>New Playlist</span>
              </button>
            ) : (
              <form onSubmit={handleCreate} className="create-form">
                <input
                  type="text"
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus
                  className="glass-input"
                />
                <div className="form-actions">
                  <button type="button" onClick={() => setIsCreating(false)} className="cancel-btn">Cancel</button>
                  <button type="submit" className="save-btn" disabled={!newPlaylistName.trim()}>Save</button>
                </div>
              </form>
            )}
          </div>

          <div className="playlists-list">
            <h3>Your Playlists</h3>
            {customPlaylists.length === 0 ? (
              <div className="empty-state">
                <Music size={32} opacity={0.5} />
                <p>No playlists yet</p>
              </div>
            ) : (
              <ul>
                {customPlaylists.map(playlist => (
                  <li key={playlist.id} className="playlist-list-item glass">
                    <div className="playlist-list-info">
                      <span className="playlist-list-name">{playlist.name}</span>
                      <span className="playlist-list-count">{playlist.tracks.length} tracks</span>
                    </div>
                    <button 
                      className="delete-playlist-btn"
                      onClick={() => {
                        if (confirm(`Delete "${playlist.name}"?`)) {
                          deleteCustomPlaylist(playlist.id);
                        }
                      }}
                      title="Delete Playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="backup-restore-section">
            <button className="backup-btn glass" onClick={exportPlaylists}>
              <Download size={16} />
              Backup Playlists
            </button>
            <button className="restore-btn glass" onClick={() => document.getElementById('restore-input')?.click()}>
              <Upload size={16} />
              Restore Playlists
            </button>
            <input 
              type="file" 
              id="restore-input" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target?.result as string);
                    if (Array.isArray(data)) {
                      importPlaylists(data);
                      alert('Playlists restored successfully!');
                    }
                  } catch (err) {
                    alert('Failed to parse backup file.');
                  }
                };
                reader.readAsText(file);
                e.target.value = ''; // reset
              }} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
