import React, { useState, useEffect, useMemo } from 'react';
import { WrappedTop5 } from '../WrappedTop5';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';

interface Product {
  name: string;
  liters: number;
  color: string;
}

interface Top5StoryProps {
  top5Products: Product[];
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

export const Top5Story = ({ top5Products, isPaused, textColor, highlightColor }: Top5StoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
  }, [top5Products]);

  const titleSegments: TextSegment[] = useMemo(() => [
    { text: "TU TOP 5\nDE CERVEZAS", color: textColor },
  ], [textColor]);

  return (
    <group>
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
        <WrappedTop5
          top5Products={top5Products}
          position={[0, -1 * responsiveScale, 0]}
          textColor={textColor}
          highlightColor={highlightColor}
        />
      )}
    </group>
  );
};