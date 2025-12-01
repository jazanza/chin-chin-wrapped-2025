import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';

interface DominantCategoryAndVarietiesStoryProps {
  dominantBeerCategory: string;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

export const DominantCategoryAndVarietiesStory = ({
  dominantBeerCategory,
  uniqueVarieties2025,
  totalVarietiesInDb,
  isPaused,
  textColor,
  highlightColor,
}: DominantCategoryAndVarietiesStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isVarietiesTyped, setIsVarietiesTyped] = useState(false);

  useEffect(() => {
    setIsVarietiesTyped(false);
  }, [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb]);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU CATEGORÍA\nDOMINANTE ES...", color: textColor },
    { text: `\n${dominantBeerCategory.toUpperCase()}`, color: highlightColor },
    { text: "\n\nY PROBASTE ", color: textColor },
    { text: `${uniqueVarieties2025}`, color: highlightColor },
    { text: " DE ", color: textColor },
    { text: `${totalVarietiesInDb}`, color: highlightColor },
    { text: " VARIEDADES!", color: textColor },
  ], [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb, textColor, highlightColor]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={storySegments}
        speed={75}
        onComplete={() => setIsVarietiesTyped(true)}
        isPaused={isPaused}
        position={[0, 0, 0]} // Centered
        fontSize={Math.min(viewport.width * 0.15, 1.0) * responsiveScale} // Multiplicador aumentado de 0.06 a 0.15, max de 0.6 a 1.0
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