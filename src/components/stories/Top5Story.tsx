import React from 'react';
import { WrappedTop5 } from '../WrappedTop5';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

interface Product {
  name: string;
  liters: number;
  color: string;
}

interface Top5StoryProps {
  top5Products: Product[];
}

export const Top5Story = ({ top5Products }: Top5StoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  return (
    <group>
      <Text
        position={[0, 3 * responsiveScale, 0]}
        fontSize={0.6 * responsiveScale}
        color="#FF00FF" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
      >
        TU TOP 5 DE CERVEZAS
      </Text>
      <WrappedTop5 top5Products={top5Products} position={[0, -1 * responsiveScale, 0]} />
    </group>
  );
};