import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText'; // Import TextSegment
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // Reusing background lines

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

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isCategoryTyped, setIsCategoryTyped] = useState(false);
  const [isVarietiesTyped, setIsVarietiesTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsCategoryTyped(false);
    setIsVarietiesTyped(false);
  }, [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb]);

  const titleSegments: TextSegment[] = [
    { text: "TU CATEGORÍA DOMINANTE ES...", color: textColor },
  ];

  const categorySegments: TextSegment[] = [
    { text: dominantBeerCategory.toUpperCase(), color: highlightColor },
  ];

  const varietiesSegments: TextSegment[] = [
    { text: "Y PROBASTE ", color: textColor },
    { text: `${uniqueVarieties2025}`, color: highlightColor },
    { text: " DE ", color: textColor },
    { text: `${totalVarietiesInDb}`, color: highlightColor },
    { text: " VARIEDADES!", color: textColor },
  ];

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={titleSegments}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 2.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          segments={categorySegments}
          speed={75}
          onComplete={() => setIsCategoryTyped(true)}
          isPaused={isPaused}
          position={[0, 1.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.08, 0.8) * responsiveScale}
          anchorX="center"
          anchorY="middle"
          maxWidth={viewport.width * 0.8}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={900}
        />
      )}
      {isCategoryTyped && (
        <TypewriterText
          segments={varietiesSegments}
          speed={75}
          onComplete={() => setIsVarietiesTyped(true)}
          isPaused={isPaused}
          position={[0, -0.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.05, 0.4) * responsiveScale}
          anchorX="center"
          anchorY="middle"
          maxWidth={viewport.width * 0.8}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={700}
        />
      )}
    </group>
  );
};