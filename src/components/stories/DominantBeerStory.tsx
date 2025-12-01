import React from 'react';
import { Text } from '@react-three/drei';
import { DominantBeerBarChart } from '../DominantBeerBarChart'; // Import the new bar chart
import { useThree } from '@react-three/fiber';

interface DominantBeerStoryProps {
  dominantBeerCategory: string;
  categoryVolumes: { [key: string]: number };
}

export const DominantBeerStory = ({ dominantBeerCategory, categoryVolumes }: DominantBeerStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  return (
    <group>
      <Text
        position={[0, 2.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale} // Simulating 6vw
        color="#FF008A" // neon-magenta
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
        fontWeight={900} // Apply extreme font weight
      >
        TU CERVEZA DOMINANTE
      </Text>
      <Text
        position={[0, 1.8 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.8) * responsiveScale} // Simulating 6vw
        color="#00FF66" // neon-green
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
        fontWeight={900} // Apply extreme font weight
      >
        {dominantBeerCategory.toUpperCase()}
      </Text>
      <DominantBeerBarChart categoryVolumes={categoryVolumes} dominantBeerCategory={dominantBeerCategory} position={[0, -0.5 * responsiveScale, 0]} />
    </group>
  );
};