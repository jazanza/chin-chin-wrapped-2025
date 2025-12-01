import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  position: [number, number, number]; // Overall position of the entire text block
  fontSize: number;
  anchorX?: 'left' | 'center' | 'right'; // This will now apply to the overall block, not individual words
  anchorY?: 'top' | 'middle' | 'bottom'; // This will now apply to the overall block, not individual words
  maxWidth?: number; // Max width for a single line
  textAlign?: 'left' | 'center' | 'right'; // This will now apply to the overall block, not individual words
  letterSpacing?: number;
  fontWeight?: number;
  lineHeight?: number; // New prop for line spacing
}

interface WordData {
  word: string;
  color: string;
  lineIndex: number;
  originalSegmentIndex: number;
  originalWordIndexInSegment: number;
  width?: number; // Will be calculated after rendering
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
  textAlign = 'center', // Default to center for poster style
  letterSpacing,
  fontWeight,
  lineHeight = 1.2, // Default line height multiplier
}: TypewriterTextProps) => {
  const [typedWords, setTypedWords] = useState<WordData[]>([]);
  const allWordsRef = useRef<WordData[]>([]);
  const currentWordIndexRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const textRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Process segments into words, handling newlines
  useEffect(() => {
    const words: WordData[] = [];
    let currentLineIndex = 0;

    segments.forEach((segment, segmentIndex) => {
      const linesInSegment = segment.text.split('\n');
      linesInSegment.forEach((line, lineIndexInSegment) => {
        const lineWords = line.split(/\s+/).filter(Boolean);
        lineWords.forEach((word, wordIndexInLine) => {
          words.push({
            word: word + (wordIndexInLine < lineWords.length - 1 ? ' ' : ''), // Add space back if not last word in line
            color: segment.color,
            lineIndex: currentLineIndex,
            originalSegmentIndex: segmentIndex,
            originalWordIndexInSegment: wordIndexInLine,
          });
        });
        // Only increment line index if there was an explicit newline in the source segment
        if (lineIndexInSegment < linesInSegment.length - 1) {
          currentLineIndex++; 
        }
      });
      // If the segment ends with a space, the next segment should start on the same line.
      // If the segment ends with a newline, currentLineIndex was already incremented.
      // If the segment ends without a space or newline, the next segment continues on the same line.
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
        cancelAnimationFrame(animationFrameRef.current!);
        if (onComplete) {
          onComplete();
        }
        return;
      }
    }
    animationFrameRef.current = requestAnimationFrame(animateTyping);
  }, [speed, isPaused, onComplete]);

  // Group typed words by line and calculate layout
  const lines = useMemo(() => {
    if (typedWords.length === 0) return [];

    const linesMap = new Map<number, WordData[]>();
    typedWords.forEach(wordData => {
      if (!linesMap.has(wordData.lineIndex)) {
        linesMap.set(wordData.lineIndex, []);
      }
      linesMap.get(wordData.lineIndex)?.push(wordData);
    });

    const lineLayouts: { words: WordData[]; width: number; currentXOffset: number }[] = [];
    Array.from(linesMap.keys()).sort((a, b) => a - b).forEach(lineIndex => {
      const wordsInLine = linesMap.get(lineIndex)!;
      const lineWidth = wordsInLine.reduce((sum, wordData) => sum + (wordData.width || 0), 0);
      lineLayouts.push({ words: wordsInLine, width: lineWidth, currentXOffset: 0 });
    });
    return lineLayouts;
  }, [typedWords]);

  // Calculate overall block dimensions for centering
  const totalLines = lines.length;
  const totalBlockHeight = totalLines * fontSize * lineHeight;

  let startY = 0;
  if (anchorY === 'middle') {
    // Calculate the top edge of the block relative to the center (0,0)
    // If totalLines=3, height=3.6, startY should be 3.6/2 - 0.6 = 1.2 (to position the first line correctly)
    startY = totalBlockHeight / 2 - fontSize * lineHeight / 2; 
  } else if (anchorY === 'bottom') {
    startY = totalBlockHeight - fontSize * lineHeight;
  }
  // For 'top', startY remains 0 (or adjusted to top of the block)

  return (
    <group position={position}>
      {lines.map((line, lineIndex) => {
        let lineXOffset = 0;
        if (textAlign === 'center') {
          lineXOffset = -line.width / 2;
        } else if (textAlign === 'right') {
          lineXOffset = -line.width;
        }

        return (
          <group key={lineIndex} position={[0, startY - lineIndex * fontSize * lineHeight, 0]}>
            {line.words.map((wordData, wordIndex) => {
              const wordPositionX = lineXOffset;
              lineXOffset += (wordData.width || 0);

              return (
                <Text
                  key={`${wordData.originalSegmentIndex}-${wordData.originalWordIndexInSegment}-${wordIndex}`}
                  ref={el => textRefs.current[typedWords.indexOf(wordData)] = el} // Map back to original typedWords index
                  position={[wordPositionX, 0, 0]}
                  fontSize={fontSize}
                  color={wordData.color}
                  anchorX="left"
                  anchorY="middle" // Each word is middle-anchored vertically within its line
                  maxWidth={maxWidth}
                  textAlign="left"
                  letterSpacing={letterSpacing}
                  fontWeight={fontWeight}
                >
                  {wordData.word}
                </Text>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};