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
  speed?: number; // milliseconds per word
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

interface WordData {
  word: string;
  color: string;
  originalSegmentIndex: number;
  originalWordIndexInSegment: number;
  width?: number; // Will be calculated after rendering
}

export const TypewriterText = ({
  segments,
  speed = 50, // This speed will now apply per word
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
  const [typedWords, setTypedWords] = useState<WordData[]>([]);
  const allWordsRef = useRef<WordData[]>([]);
  const currentWordIndexRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const textRefs = useRef<(THREE.Mesh | null)[]>([]); // Refs for each Text component to measure width

  // Pre-process all words from segments
  useEffect(() => {
    const words: WordData[] = [];
    segments.forEach((segment, segmentIndex) => {
      const segmentWords = segment.text.split(/\s+/).filter(Boolean); // Split by space, remove empty strings
      segmentWords.forEach((word, wordIndexInSegment) => {
        words.push({
          word: word + (wordIndexInSegment < segmentWords.length - 1 ? ' ' : ''), // Add space back if not last word in segment
          color: segment.color,
          originalSegmentIndex: segmentIndex,
          originalWordIndexInSegment: wordIndexInSegment,
        });
      });
    });
    allWordsRef.current = words;
    setTypedWords([]);
    currentWordIndexRef.current = 0;
    lastTimeRef.current = performance.now();
    cancelAnimationFrame(animationFrameRef.current!);
    animationFrameRef.current = requestAnimationFrame(animateTyping);

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [segments, speed, isPaused]);

  // Measure widths of newly typed words
  useEffect(() => {
    if (typedWords.length > 0) {
      const lastTypedWordIndex = typedWords.length - 1;
      const textMesh = textRefs.current[lastTypedWordIndex];
      if (textMesh && textMesh.geometry) {
        // Ensure geometry is computed for bounding box
        textMesh.geometry.computeBoundingBox();
        const width = textMesh.geometry.boundingBox?.max.x - textMesh.geometry.boundingBox?.min.x;
        if (width !== undefined && typedWords[lastTypedWordIndex].width === undefined) {
          setTypedWords(prev => {
            const newTypedWords = [...prev];
            newTypedWords[lastTypedWordIndex] = { ...newTypedWords[lastTypedWordIndex], width: width };
            return newTypedWords;
          });
        }
      }
    }
  }, [typedWords]);


  const animateTyping = useCallback((currentTime: number) => {
    if (isPaused) {
      lastTimeRef.current = currentTime;
      animationFrameRef.current = requestAnimationFrame(animateTyping);
      return;
    }

    if (currentTime - lastTimeRef.current > speed) {
      if (currentWordIndexRef.current < allWordsRef.current.length) {
        setTypedWords(prev => [...prev, allWordsRef.current[currentWordIndexRef.current]]);
        currentWordIndexRef.current++;
        lastTimeRef.current = currentTime;
      } else {
        // All words typed
        cancelAnimationFrame(animationFrameRef.current!);
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateTyping);
  }, [speed, isPaused, onComplete]);

  // Calculate total width of all typed words for centering
  const totalTypedWidth = typedWords.reduce((sum, wordData) => sum + (wordData.width || 0), 0);

  let currentXOffset = 0;
  if (textAlign === 'center' || anchorX === 'center') {
    currentXOffset = -totalTypedWidth / 2;
  } else if (textAlign === 'right' || anchorX === 'right') {
    currentXOffset = -totalTypedWidth;
  }

  return (
    <group position={position}>
      {typedWords.map((wordData, index) => {
        const wordPositionX = currentXOffset;
        currentXOffset += (wordData.word.trim().length > 0 ? (wordData.width || 0) : 0); // Update offset for next word, handle trailing space

        return (
          <Text
            key={`${wordData.originalSegmentIndex}-${wordData.originalWordIndexInSegment}-${index}`}
            ref={el => textRefs.current[index] = el}
            position={[wordPositionX, 0, 0]} // Position relative to the group
            fontSize={fontSize}
            color={wordData.color}
            anchorX="left" // Each word is anchored left relative to its own position
            anchorY={anchorY}
            maxWidth={maxWidth} // Apply maxWidth to individual words if needed, but usually for the whole block
            textAlign="left" // Each word is left-aligned
            letterSpacing={letterSpacing}
            fontWeight={fontWeight}
            // sync // Use sync to ensure geometry is computed for bounding box
          >
            {wordData.word}
          </Text>
        );
      })}
    </group>
  );
};