import React, { useRef, useState, useEffect } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import './ToneArm.css';

const ToneArm: React.FC = () => {
  const { isPlaying, position, duration, isSeeking, setIsSeeking, setPosition, play, pause, currentTrack, requestSeek } = usePlayerStore();
  const pivotRef = useRef<HTMLDivElement>(null);
  const [dragAngle, setDragAngle] = useState<number | null>(null);

  // Angle constants
  const OFF_RECORD_ANGLE = -25;
  const START_RECORD_ANGLE = 15;
  const END_RECORD_ANGLE = 35;

  // Calculate current display angle
  let displayAngle = OFF_RECORD_ANGLE;
  
  if (isSeeking && dragAngle !== null) {
    displayAngle = dragAngle;
  } else if (isPlaying || (position > 0 && currentTrack)) {
    // Determine progress on the record (0 to 1)
    const progress = duration > 0 ? position / duration : 0;
    // Cap progress to prevent the needle going past the label
    const safeProgress = Math.min(Math.max(progress, 0), 1);
    displayAngle = START_RECORD_ANGLE + (safeProgress * (END_RECORD_ANGLE - START_RECORD_ANGLE));
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsSeeking(true);
    updateAngle(e.clientX, e.clientY);
  };

  const updateAngle = (clientX: number, clientY: number) => {
    if (!pivotRef.current) return;
    
    // Get absolute center of the pivot point
    const rect = pivotRef.current.getBoundingClientRect();
    const pivotX = rect.left + 30; // 30px is transform-origin X
    const pivotY = rect.top + 30;  // 30px is transform-origin Y

    // Calculate angle in degrees
    const dx = clientX - pivotX;
    const dy = clientY - pivotY;
    
    // CSS 0deg is vertical pointing down. atan2 measures from X axis right.
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
    
    // Normalize angle
    if (angle < -180) angle += 360;
    if (angle > 180) angle -= 360;

    // Constrain angle to physical limits
    if (angle < OFF_RECORD_ANGLE - 5) angle = OFF_RECORD_ANGLE - 5;
    if (angle > END_RECORD_ANGLE + 5) angle = END_RECORD_ANGLE + 5;

    setDragAngle(angle);

    // If dragging ON the record, mathematically seek the song visually!
    if (angle >= START_RECORD_ANGLE && angle <= END_RECORD_ANGLE && duration > 0) {
      const percentage = (angle - START_RECORD_ANGLE) / (END_RECORD_ANGLE - START_RECORD_ANGLE);
      setPosition(percentage * duration);
    }
  };

  useEffect(() => {
    if (!isSeeking) return;

    const handlePointerMove = (e: PointerEvent) => {
      updateAngle(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      setIsSeeking(false);
      if (dragAngle !== null) {
         // If dropped off the record, pause. Otherwise play.
         if (dragAngle < START_RECORD_ANGLE - 5) {
            pause();
         } else if (currentTrack) {
            const percentage = (Math.min(Math.max(dragAngle, START_RECORD_ANGLE), END_RECORD_ANGLE) - START_RECORD_ANGLE) / (END_RECORD_ANGLE - START_RECORD_ANGLE);
            requestSeek(percentage * duration);
            play();
         }
      }
      setDragAngle(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isSeeking, dragAngle, duration, currentTrack, pause, play]);

  return (
    <div 
      className={`tone-arm-container ${isSeeking ? 'dragging' : ''}`} 
      style={{ transform: `rotate(${displayAngle}deg)` }}
      onPointerDown={handlePointerDown}
      ref={pivotRef}
    >
      <div className="tone-arm-pivot">
        <div className="tone-arm-counterweight"></div>
      </div>
      <div className="tone-arm-rod"></div>
      <div className="tone-arm-headshell">
        <div className="tone-arm-stylus"></div>
      </div>
    </div>
  );
};

export default ToneArm;
