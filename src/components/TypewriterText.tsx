import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface TextSegment {
  text: string;
  color: string;
}

interface TypewriterTextProps {
  segments: TextSegment[]; // Changed from 'text: string'
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  isPaused?: boolean;
  position: [number, number, number];
  fontSize: number;
  // Removed 'color' prop as it's now in segments
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
  anchorX = 'center', // Default to center for easier positioning
  anchorY = 'middle',
  maxWidth,
  textAlign,
  letterSpacing,
  fontWeight,
}: TypewriterTextProps) => {
  const [displayedChars, setDisplayedChars] = useState<TextSegment[]>([]);
  const currentSegmentIndex = useRef(0);
  const currentCharIndexInSegment = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const fullTextLength = segments.reduce((sum, seg) => sum + seg.text.length, 0);

  const animateTyping = useCallback((currentTime: number) => {
    if (isPaused) {
      lastTimeRef.current = currentTime;
      animationFrameRef.current = requestAnimationFrame(animateTyping);
      return;
    }

    if (currentTime - lastTimeRef.current > speed) {
      if (currentSegmentIndex.current < segments.length) {
        const currentSegment = segments[currentSegmentIndex.current];
        if (currentCharIndexInSegment.current < currentSegment.text.length) {
          // Add the next character
          setDisplayedChars((prev) => [
            ...prev,
            { text: currentSegment.text[currentCharIndexInSegment.current], color: currentSegment.color },
          ]);
          currentCharIndexInSegment.current++;
        } else {
          // Move to the next segment
          currentSegmentIndex.current++;
          currentCharIndexInSegment.current = 0;
        }
        lastTimeRef.current = currentTime;
      } else {
        // All segments typed
        cancelAnimationFrame(animationFrameRef.current!);
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateTyping);
  }, [segments, speed, onComplete, isPaused]);

  useEffect(() => {
    setDisplayedChars([]);
    currentSegmentIndex.current = 0;
    currentCharIndexInSegment.current = 0;
    lastTimeRef.current = performance.now();
    cancelAnimationFrame(animationFrameRef.current!);
    animationFrameRef.current = requestAnimationFrame(animateTyping);

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [segments, animateTyping]);

  // Group the displayed characters by color to render fewer <Text> components
  const groupedSegments: TextSegment[] = [];
  if (displayedChars.length > 0) {
    let currentGroup = { text: '', color: displayedChars[0].color };
    for (let i = 0; i < displayedChars.length; i++) {
      if (displayedChars[i].color === currentGroup.color) {
        currentGroup.text += displayedChars[i].text;
      } else {
        groupedSegments.push(currentGroup);
        currentGroup = { text: displayedChars[i].text, color: displayedChars[i].color };
      }
    }
    groupedSegments.push(currentGroup);
  }

  // Calculate total width of the text to center it
  // This is still a challenge. `Text` component from drei doesn't expose text width easily.
  // For now, I'll rely on `anchorX="center"` and let `drei/Text` handle the centering of the *entire group* of segments.
  // This means each segment will be rendered as a separate <Text> component, and their combined width will be centered.
  // This might not be perfect for inline text, but it's the best compromise without complex text layout engines.

  const textComponents = groupedSegments.map((seg, index) => (
    <Text
      key={index}
      position={[0, 0, 0]} // Position relative to the parent group
      fontSize={fontSize}
      color={seg.color}
      anchorX={anchorX}
      anchorY={anchorY}
      maxWidth={maxWidth}
      textAlign={textAlign}
      letterSpacing={letterSpacing}
      fontWeight={fontWeight}
    >
      {seg.text}
    </Text>
  ));

  return (
    <group position={position}>
      {textComponents}
    </group>
  );
};