import React, { useEffect, useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface TextSegment {
  text: string;
  color: string;
}

interface TypewriterTextProps {
  segments: TextSegment[];
  position: [number, number, number];
  fontSize: number;
  anchorX?: 'left' | 'center' | 'right';
  anchorY?: 'top' | 'middle' | 'bottom';
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  fontWeight?: number;
  lineHeight?: number;
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
  position,
  fontSize,
  anchorX = 'center',
  anchorY = 'middle',
  maxWidth,
  textAlign = 'center',
  letterSpacing,
  fontWeight,
  lineHeight = 1.2,
}: TypewriterTextProps) => {
  const allWordsWithRefs = useRef<WordData[]>([]);
  const textMeshes = useRef<(THREE.Mesh | null)[]>([]);

  // 1. Process segments into words and store them
  useEffect(() => {
    const words: WordData[] = [];
    let currentLineIndex = 0;

    segments.forEach((segment, segmentIndex) => {
      const linesInSegment = segment.text.split('\n');
      linesInSegment.forEach((line, lineIndexInSegment) => {
        const lineWords = line.split(/\s+/).filter(Boolean);
        lineWords.forEach((word, wordIndexInLine) => {
          words.push({
            word: word + (wordIndexInLine < lineWords.length - 1 ? ' ' : ''),
            color: segment.color,
            lineIndex: currentLineIndex,
            originalSegmentIndex: segmentIndex,
            originalWordIndexInSegment: wordIndexInLine,
          });
        });
        if (lineIndexInSegment < linesInSegment.length - 1) {
          currentLineIndex++;
        }
      });
    });
    allWordsWithRefs.current = words;
    textMeshes.current = new Array(words.length).fill(null); // Initialize refs array
  }, [segments]);

  // 2. Measure widths after all words are rendered and refs are available
  const wordsWithMeasuredWidths = useMemo(() => {
    // This effect runs after the initial render where all Text components are mounted
    // and their refs are populated.
    return allWordsWithRefs.current.map((wordData, index) => {
      const textMesh = textMeshes.current[index];
      if (textMesh && textMesh.geometry) {
        textMesh.geometry.computeBoundingBox();
        const width = textMesh.geometry.boundingBox?.max.x - textMesh.geometry.boundingBox?.min.x;
        return { ...wordData, width: width !== undefined ? width : 0 };
      }
      return { ...wordData, width: 0 };
    });
  }, [allWordsWithRefs.current, textMeshes.current]);

  // 3. Group words by line and calculate layout based on measured widths
  const lines = useMemo(() => {
    const validWords = wordsWithMeasuredWidths.filter(
      (word): word is WordData => word && typeof word.lineIndex === 'number'
    );

    if (validWords.length === 0) return [];

    const linesMap = new Map<number, WordData[]>();
    validWords.forEach(wordData => {
      if (!linesMap.has(wordData.lineIndex)) {
        linesMap.set(wordData.lineIndex, []);
      }
      linesMap.get(wordData.lineIndex)!.push(wordData);
    });

    const lineLayouts: { words: WordData[]; width: number; currentXOffset: number; lineGroupOffsetX: number }[] = [];
    Array.from(linesMap.keys()).sort((a, b) => a - b).forEach(lineIndex => {
      const wordsInLine = linesMap.get(lineIndex)!;
      const lineWidth = wordsInLine.reduce((sum, wordData) => sum + (wordData.width || 0), 0);

      let lineGroupOffsetX = 0;
      if (textAlign === 'center') {
        lineGroupOffsetX = -lineWidth / 2;
      } else if (textAlign === 'right') {
        lineGroupOffsetX = -lineWidth;
      }

      lineLayouts.push({ words: wordsInLine, width: lineWidth, currentXOffset: 0, lineGroupOffsetX });
    });
    return lineLayouts;
  }, [wordsWithMeasuredWidths, textAlign]);

  // Calculate overall block dimensions for centering
  const totalLines = lines.length;
  const totalBlockHeight = totalLines * fontSize * lineHeight;

  let startY = 0;
  if (anchorY === 'middle') {
    startY = totalBlockHeight / 2 - fontSize * lineHeight / 2;
  } else if (anchorY === 'bottom') {
    startY = totalBlockHeight - fontSize * lineHeight;
  }

  return (
    <group position={position}>
      {lines.map((line, lineIndex) => (
        <group key={lineIndex} position={[line.lineGroupOffsetX, startY - lineIndex * fontSize * lineHeight, 0]}>
          {line.words.map((wordData, wordIndex) => {
            const wordPositionX = line.currentXOffset;
            line.currentXOffset += (wordData.width || 0);

            const originalWordIndex = allWordsWithRefs.current.findIndex(
              w => w.originalSegmentIndex === wordData.originalSegmentIndex &&
                   w.originalWordIndexInSegment === wordData.originalWordIndexInSegment &&
                   w.lineIndex === wordData.lineIndex &&
                   w.word === wordData.word
            );

            return (
              <Text
                key={`${wordData.originalSegmentIndex}-${wordData.originalWordIndexInSegment}-${wordIndex}`}
                ref={el => {
                  if (originalWordIndex !== -1) {
                    textMeshes.current[originalWordIndex] = el;
                  }
                }}
                position={[wordPositionX, 0, 0]}
                fontSize={fontSize}
                color={wordData.color}
                anchorX="left"
                anchorY="middle"
                maxWidth={maxWidth}
                textAlign="left"
                letterSpacing={letterSpacing}
                fontWeight={fontWeight}
              >
                <meshBasicMaterial attach="material" color={wordData.color} />
                {wordData.word}
              </Text>
            );
          })}
        </group>
      ))}
    </group>
  );
};