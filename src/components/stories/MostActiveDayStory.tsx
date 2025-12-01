import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  // isPaused: boolean; // REMOVED
  textColor: string;
  highlightColor: string;
}

export const MostActiveDayStory = ({ mostActiveDay, textColor, highlightColor }: MostActiveDayStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  // const [isDayTyped, setIsDayTyped] = useState(false); // REMOVED

  // useEffect(() => { // REMOVED
  //   setIsDayTyped(false);
  // }, [mostActiveDay]);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU DÍA MÁS\nCHIN CHIN FUE...", color: textColor },
    { text: `\n${mostActiveDay.toUpperCase()}`, color: highlightColor },
  ], [mostActiveDay, textColor, highlightColor]);

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