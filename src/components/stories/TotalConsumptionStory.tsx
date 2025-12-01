import React, { useState, useEffect, useMemo } from 'react';
import { WrappedMeter } from '../WrappedMeter';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';

interface TotalConsumptionStoryProps {
  totalLiters: number;
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

export const TotalConsumptionStory = ({ totalLiters, isPaused, textColor, highlightColor }: TotalConsumptionStoryProps) => {
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 12);

  const [isTitleTyped, setIsTitleTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
  }, [totalLiters]);

  const titleSegments: TextSegment[] = useMemo(() => [
    { text: "TU CONSUMO\nTOTAL", color: textColor },
  ], [textColor]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={titleSegments}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 3 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.15, 1.0) * responsiveScale} // Multiplicador aumentado de 0.06 a 0.15, max de 0.6 a 1.0
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
        lineHeight={1.2}
      />
      {isTitleTyped && (
        <WrappedMeter totalLiters={totalLiters} position={[0, -0.5 * responsiveScale, 0]} textColor={textColor} highlightColor={highlightColor} />
      )}
    </group>
  );
};