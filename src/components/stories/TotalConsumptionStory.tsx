import React from 'react';
import { WrappedMeter } from '../WrappedMeter';
import { Text } from '@react-three/drei';

interface TotalConsumptionStoryProps {
  totalLiters: number;
}

export const TotalConsumptionStory = ({ totalLiters }: TotalConsumptionStoryProps) => {
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
        Tu Consumo Total
      </Text>
      <WrappedMeter totalLiters={totalLiters} position={[0, -0.5, 0]} />
    </group>
  );
};