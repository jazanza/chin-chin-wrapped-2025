import React from 'react';
import { WrappedTop5 } from '../WrappedTop5';
import { Text } from '@react-three/drei';

interface Product {
  name: string;
  liters: number;
  color: string;
}

interface Top5StoryProps {
  top5Products: Product[];
}

export const Top5Story = ({ top5Products }: Top5StoryProps) => {
  return (
    <group>
      <Text
        position={[0, 3, 0]}
        fontSize={0.6}
        color="#FF00FF" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        Tu Top 5 de Cervezas
      </Text>
      <WrappedTop5 top5Products={top5Products} position={[0, -1, 0]} />
    </group>
  );
};