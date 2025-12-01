import React from 'react';
import { WrappedMeter } from '../WrappedMeter';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

interface TotalConsumptionStoryProps {
  totalLiters: number;
}

export const TotalConsumptionStory = ({ totalLiters }: TotalConsumptionStoryProps) => {
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 12); // Re-calculate responsive scale

  return (
    <group>
      <Text
        position={[0, 3 * responsiveScale, 0]}
        fontSize={0.6 * responsiveScale}
        color="#F654A9" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
      >
        TU CONSUMO TOTAL
      </Text>
      <WrappedMeter totalLiters={totalLiters} position={[0, -0.5 * responsiveScale, 0]} />
    </group>
  );
};