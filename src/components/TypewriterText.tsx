import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface TextSegment {
  text: string;
  color: string;
}

interface TypewriterTextProps {
  segments: TextSegment[];
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  isPaused?: boolean;
  position: [number, number, number];
  fontSize: number;
  anchorX?: 'left' | 'center' | 'right';
  anchorY?: 'top' | 'middle' | 'bottom';
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  fontWeight?: number;
}

export const TypewriterText = ({
  segments,
  speed = 50,
  onComplete,
  isPaused = false,
  position,
  fontSize,
  anchorX = 'center',
  anchorY = 'middle',
  maxWidth,
  textAlign,
  letterSpacing,
  fontWeight,
}: TypewriterTextProps) => {
  const [displayedHtml, setDisplayedHtml] = useState<string>('');
  const fullHtmlRef = useRef<string>('');
  const charIndexRef = useRef(0); // Index in the fullHtml string
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Pre-calculate the full HTML string once and start the animation
  useEffect(() => {
    let html = '';
    segments.forEach(segment => {
      html += `<span style="color: ${segment.color};">${segment.text}</span>`;
    });
    fullHtmlRef.current = html;
    setDisplayedHtml(''); // Reset displayed text
    charIndexRef.current = 0; // Reset character index
    lastTimeRef.current = performance.now();
    cancelAnimationFrame(animationFrameRef.current!);
    animationFrameRef.current = requestAnimationFrame(animateTyping);

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [segments, speed, isPaused]); // Re-run if segments change

  const animateTyping = useCallback((currentTime: number) => {
    if (isPaused) {
      lastTimeRef.current = currentTime;
      animationFrameRef.current = requestAnimationFrame(animateTyping);
      return;
    }

    if (currentTime - lastTimeRef.current > speed) {
      if (charIndexRef.current < fullHtmlRef.current.length) {
        charIndexRef.current++;
        setDisplayedHtml(fullHtmlRef.current.substring(0, charIndexRef.current));
        lastTimeRef.current = currentTime;
      } else {
        // All characters typed
        cancelAnimationFrame(animationFrameRef.current!);
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateTyping);
  }, [speed, isPaused, onComplete]); // Dependencies for useCallback

  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={segments[0]?.color || 'white'} // Fallback color, actual color handled by HTML
      anchorX={anchorX}
      anchorY={anchorY}
      maxWidth={maxWidth}
      textAlign={textAlign}
      letterSpacing={letterSpacing}
      fontWeight={fontWeight}
    >
      {displayedHtml}
    </Text>
  );
};