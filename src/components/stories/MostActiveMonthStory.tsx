import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText'; // Import TextSegment
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // Updated import path

interface MostActiveMonthStoryProps {
  mostActiveMonth: string;
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

export const MostActiveMonthStory = ({ mostActiveMonth, isPaused, textColor, highlightColor }: MostActiveMonthStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isMonthTyped, setIsMonthTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsMonthTyped(false);
  }, [mostActiveMonth]);

  const titleSegments: TextSegment[] = [
    { text: "EL MES DE LA SED FUE...", color: textColor },
  ];

  const monthSegments: TextSegment[] = [
    { text: mostActiveMonth.toUpperCase(), color: highlightColor },
  ];

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={titleSegments}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 2.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          segments={monthSegments}
          speed={75}
          onComplete={() => setIsMonthTyped(true)}
          isPaused={isPaused}
          position={[0, 1.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.08, 0.8) * responsiveScale}
          anchorX="center"
          anchorY="middle"
          maxWidth={viewport.width * 0.8}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={900}
        />
      )}
    </group>
  );
};