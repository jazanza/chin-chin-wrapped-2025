import React, { useRef, useCallback } from 'react';

interface StoryInteractionZoneProps {
  onNext: () => void;
  onPrev: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
}

const TAP_THRESHOLD_MS = 300; // Max duration for a tap to be considered a tap, not a hold

export const StoryInteractionZone = ({ onNext, onPrev, onPause, onResume, isPaused }: StoryInteractionZoneProps) => {
  const touchStartTime = useRef<number>(0);
  const isHolding = useRef<boolean>(false);

  const handleInteractionStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    touchStartTime.current = Date.now();
    isHolding.current = true; // Assume a hold until proven otherwise
    onPause(); // Pause immediately on touch/mouse down
  }, [onPause]);

  const handleInteractionEnd = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const touchEndTime = Date.now();
    const duration = touchEndTime - touchStartTime.current;

    if (isHolding.current) { // Only process if a hold was initiated
      onResume(); // Resume on touch/mouse up
      isHolding.current = false;

      if (duration < TAP_THRESHOLD_MS) {
        // It was a tap, not a long press
        const target = event.currentTarget as HTMLElement;
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const rect = target.getBoundingClientRect();
        const clickX = clientX - rect.left;

        if (clickX > rect.width / 2) {
          onNext();
        } else {
          onPrev();
        }
      }
    }
  }, [onNext, onPrev, onResume]);

  // Prevent context menu on long press for touch devices
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 cursor-pointer"
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={() => { // Handle case where mouse leaves while holding
        if (isHolding.current) {
          onResume();
          isHolding.current = false;
        }
      }}
      onContextMenu={handleContextMenu}
    />
  );
};