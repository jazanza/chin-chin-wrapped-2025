import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText';
import { AnimatedBackgroundLines } from './WelcomeStory'; // Reusing background lines

interface DominantCategoryAndVarietiesStoryProps {
  dominantBeerCategory: string;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  isPaused: boolean;
}

export const DominantCategoryAndVarietiesStory = ({
  dominantBeerCategory,
  uniqueVarieties2025,
  totalVarietiesInDb,
  isPaused,
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

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        text="TU CATEGORÍA DOMINANTE ES..."
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 2.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          text={dominantBeerCategory.toUpperCase()}
          speed={75}
          onComplete={() => setIsCategoryTyped(true)}
          isPaused={isPaused}
          position={[0, 1.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.08, 0.8) * responsiveScale}
          color="#FFFFFF"
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
          text={`Y PROBASTE ${uniqueVarieties2025} DE ${totalVarietiesInDb} VARIEDADES!`}
          speed={75}
          onComplete={() => setIsVarietiesTyped(true)}
          isPaused={isPaused}
          position={[0, -0.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.05, 0.4) * responsiveScale}
          color="#FFFF00" // Highlighted color for varieties
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