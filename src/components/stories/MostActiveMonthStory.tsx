import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';

interface MostActiveMonthStoryProps {
  mostActiveMonth: string;
  // isPaused: boolean; // REMOVED
  textColor: string;
  highlightColor: string;
}

export const MostActiveMonthStory = ({ mostActiveMonth, textColor, highlightColor }: MostActiveMonthStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  // const [isMonthTyped, setIsMonthTyped] = useState(false); // REMOVED

  // useEffect(() => { // REMOVED
  //   setIsMonthTyped(false);
  // }, [mostActiveMonth]);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "EL MES DE\nLA SED FUE...", color: textColor },
    { text: `\n${mostActiveMonth.toUpperCase()}`, color: highlightColor },
  ], [mostActiveMonth, textColor, highlightColor]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={storySegments}
        position={[0, 0, 0]} // Centered
        fontSize={Math.min(viewport.width * 0.2, 1.2) * responsiveScale}
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
        lineHeight={1.2}
      />
    </group>
  );
};