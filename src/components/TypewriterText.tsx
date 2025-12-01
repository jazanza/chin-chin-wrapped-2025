import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  isPaused?: boolean;
  position: [number, number, number];
  fontSize: number;
  color: string;
  anchorX?: 'left' | 'center' | 'right';
  anchorY?: 'top' | 'middle' | 'bottom';
  outlineWidth?: number;
  outlineColor?: string;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  fontWeight?: number;
}

export const TypewriterText = ({
  text,
  speed = 50,
  onComplete,
  isPaused = false,
  ...textProps
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const currentIndex = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const animateTyping = useCallback((currentTime: number) => {
    if (isPaused) {
      lastTimeRef.current = currentTime; // Update lastTimeRef to prevent jump when resuming
      animationFrameRef.current = requestAnimationFrame(animateTyping);
      return;
    }

    if (currentTime - lastTimeRef.current > speed) {
      if (currentIndex.current < text.length) {
        setDisplayedText(text.substring(0, currentIndex.current + 1));
        currentIndex.current++;
        lastTimeRef.current = currentTime;
      } else {
        cancelAnimationFrame(animationFrameRef.current!);
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateTyping);
  }, [text, speed, onComplete, isPaused]);

  useEffect(() => {
    // Reset on text change or story change
    setDisplayedText('');
    currentIndex.current = 0;
    lastTimeRef.current = performance.now(); // Reset lastTimeRef
    cancelAnimationFrame(animationFrameRef.current!);
    animationFrameRef.current = requestAnimationFrame(animateTyping);

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [text, animateTyping]);

  return (
    <Text {...textProps}>
      {displayedText}
    </Text>
  );
};