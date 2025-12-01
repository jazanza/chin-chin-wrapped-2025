import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { DominantBeerBarChart } from '../DominantBeerBarChart';
import { useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText'; // Import the new component

interface DominantBeerStoryProps {
  dominantBeerCategory: string;
  categoryVolumes: { [key: string]: number };
  isPaused: boolean; // Added isPaused prop
}

export const DominantBeerStory = ({ dominantBeerCategory, categoryVolumes, isPaused }: DominantBeerStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isCategoryTyped, setIsCategoryTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsCategoryTyped(false);
  }, [dominantBeerCategory, categoryVolumes]);

  return (
    <group>
      <TypewriterText
        text="TU CERVEZA DOMINANTE"
        speed={75} // Increased typewriter speed
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 2.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        color="#FFFFFF" // White
        anchorX="center"
        anchorY="middle"
        // Removed outlineWidth and outlineColor
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          text={dominantBeerCategory.toUpperCase()}
          speed={75} // Increased typewriter speed
          onComplete={() => setIsCategoryTyped(true)}
          isPaused={isPaused}
          position={[0, 1.8 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.06, 0.8) * responsiveScale}
          color="#FFFFFF" // White
          anchorX="center"
          anchorY="middle"
          // Removed outlineWidth and outlineColor
          maxWidth={viewport.width * 0.8}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={900}
        />
      )}
      {isCategoryTyped && (
        <DominantBeerBarChart categoryVolumes={categoryVolumes} dominantBeerCategory={dominantBeerCategory} position={[0, -0.5 * responsiveScale, 0]} />
      )}
    </group>
  );
};