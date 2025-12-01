import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText';
import { AnimatedBackgroundLines } from './WelcomeStory'; // Reusing background lines

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  isPaused: boolean;
}

export const MostActiveDayStory = ({ mostActiveDay, isPaused }: MostActiveDayStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isDayTyped, setIsDayTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsDayTyped(false);
  }, [mostActiveDay]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        text="TU DÍA MÁS CHIN CHIN FUE..."
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 2.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          text={mostActiveDay.toUpperCase()}
          speed={75}
          onComplete={() => setIsDayTyped(true)}
          isPaused={isPaused}
          position={[0, 1.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.08, 0.8) * responsiveScale}
          color="#FFFFFF"
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