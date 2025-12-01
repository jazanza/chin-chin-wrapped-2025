import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StoryProgressBarProps {
  currentStoryIndex: number;
  totalStories: number;
  storyDuration: number; // in milliseconds
  isPaused: boolean;
}

export const StoryProgressBar = ({
  currentStoryIndex,
  totalStories,
  storyDuration,
  isPaused,
}: StoryProgressBarProps) => {
  const [progress, setProgress] = useState(0); // Progress for the current segment (0-100)
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isPaused) {
      // Pause: record elapsed time and stop animation
      cancelAnimationFrame(animationFrameRef.current!);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    } else {
      // Resume or start new story
      startTimeRef.current = Date.now() - pausedTimeRef.current; // Adjust start time for resume
      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTimeRef.current;
        const newProgress = Math.min((elapsedTime / storyDuration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [currentStoryIndex, isPaused, storyDuration]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
  }, [currentStoryIndex]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex w-[90%] max-w-md space-x-1">
      {Array.from({ length: totalStories }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1 flex-1 bg-gray-700 overflow-hidden", // Removed rounded-full
            index < currentStoryIndex && "bg-white", // Completed stories are white
          )}
        >
          {index === currentStoryIndex && (
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};