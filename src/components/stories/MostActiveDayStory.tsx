import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

export const MostActiveDayStory = ({ mostActiveDay, isPaused, textColor, highlightColor }: MostActiveDayStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isDayTyped, setIsDayTyped] = useState(false);

  useEffect(() => {
    setIsDayTyped(false);
  }, [mostActiveDay]);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU DÍA MÁS\nCHIN CHIN FUE...", color: textColor },
    { text: `\n${mostActiveDay.toUpperCase()}`, color: highlightColor },
  ], [mostActiveDay, textColor, highlightColor]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={storySegments}
        speed={75}
        onComplete={() => setIsDayTyped(true)}
        isPaused={isPaused}
        position={[0, 0, 0]} // Centered
        fontSize={Math.min(viewport.width * 0.2, 1.2) * responsiveScale} // Multiplicador aumentado de 0.08 a 0.2, max de 0.8 a 1.2
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