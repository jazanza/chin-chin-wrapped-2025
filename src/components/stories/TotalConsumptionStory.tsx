import React, { useState, useEffect } from 'react';
import { WrappedMeter } from '../WrappedMeter';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText'; // Import TextSegment

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

  const titleSegments: TextSegment[] = [
    { text: "TU CONSUMO TOTAL", color: textColor },
  ];

  return (
    <group>
      <TypewriterText
        segments={titleSegments}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 3 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <WrappedMeter totalLiters={totalLiters} position={[0, -0.5 * responsiveScale, 0]} textColor={textColor} highlightColor={highlightColor} />
      )}
    </group>
  );
};