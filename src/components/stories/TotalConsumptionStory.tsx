import React, { useState, useEffect } from 'react';
import { WrappedMeter } from '../WrappedMeter';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText'; // Import the new component

interface TotalConsumptionStoryProps {
  totalLiters: number;
  isPaused: boolean; // Added isPaused prop
}

export const TotalConsumptionStory = ({ totalLiters, isPaused }: TotalConsumptionStoryProps) => {
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 12);

  const [isTitleTyped, setIsTitleTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
  }, [totalLiters]);

  return (
    <group>
      <TypewriterText
        text="TU CONSUMO TOTAL"
        speed={50}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 3 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        color="#FF008A" // neon-magenta
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <WrappedMeter totalLiters={totalLiters} position={[0, -0.5 * responsiveScale, 0]} />
      )}
    </group>
  );
};