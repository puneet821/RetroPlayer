import React from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import './VinylTurntable.css';

const VinylTurntable: React.FC = () => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  return (
    <div className="turntable-container">
      <div className={`turntable-platter ${isPlaying ? 'spin' : 'spin paused'}`}>
        <div className="vinyl-record">
          <div className="record-grooves"></div>
          <div className="record-grooves groove-2"></div>
          <div className="record-grooves groove-3"></div>
          <div className="record-label">
            {currentTrack?.artwork ? (
              <img src={currentTrack.artwork} alt="Album Art" className="album-art" />
            ) : (
              <div className="placeholder-art"></div>
            )}
            <div className="spindle"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VinylTurntable;
