import React from 'react';
import { WrappedSpectrum } from '../WrappedSpectrum';
import { Text } from '@react-three/drei';

interface DominantBeerStoryProps {
  dominantBeerCategory: string;
  categoryVolumes: { [key: string]: number };
}

export const DominantBeerStory = ({ dominantBeerCategory, categoryVolumes }: DominantBeerStoryProps) => {
  return (
    <group>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.6}
        color="#F654A9" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        Tu Cerveza Dominante
      </Text>
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.8}
        color="#00FF99" // secondary-glitch-cyan
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {dominantBeerCategory}
      </Text>
      <WrappedSpectrum flavorData={categoryVolumes} position={[0, -0.5, 0]} />
    </group>
  );
};