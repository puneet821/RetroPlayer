import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import './PlaybackControls.css';

const PlaybackControls: React.FC = () => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const skipForward = usePlayerStore((state) => state.skipForward);
  const skipBackward = usePlayerStore((state) => state.skipBackward);

  return (
    <div className="playback-controls glass-panel">
      <button className="control-btn" onClick={skipBackward}>
        <SkipBack size={28} />
      </button>
      
      <button className="control-btn play-btn" onClick={togglePlay}>
        {isPlaying ? (
          <Pause size={36} fill="currentColor" />
        ) : (
          <Play size={36} fill="currentColor" className="play-icon" />
        )}
      </button>
      
      <button className="control-btn" onClick={skipForward}>
        <SkipForward size={28} />
      </button>
    </div>
  );
};

export default PlaybackControls;
