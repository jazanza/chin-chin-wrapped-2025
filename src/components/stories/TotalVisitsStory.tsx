import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText';
import { AnimatedBackgroundLines } from './WelcomeStory'; // Reusing background lines

interface TotalVisitsStoryProps {
  customerName: string;
  year: string;
  totalVisits: number;
  totalVisits2024: number;
  isPaused: boolean;
}

const ComparisonText = ({ current, previous, responsiveScale, year }: { current: number; previous: number; responsiveScale: number; year: string }) => {
  const { viewport } = useThree();

  if (previous === 0) {
    return (
      <Text
        fontSize={Math.min(viewport.width * 0.02, 0.1) * responsiveScale}
        color="#888888"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.4 * responsiveScale, 0.03]}
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={400}
      >
        No data for {parseInt(year) - 1}
      </Text>
    );
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = percentage >= 0;
  const color = isPositive ? "#00FF00" : "#FF0000"; // Green for up, Red for down

  return (
    <group position={[0, -0.4 * responsiveScale, 0.03]}>
      <Text
        fontSize={Math.min(viewport.width * 0.02, 0.1) * responsiveScale}
        color={color}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={700}
      >
        {`${isPositive ? '▲ +' : '▼ '}${percentage.toFixed(1)}% vs. ${parseInt(year) - 1}`}
      </Text>
    </group>
  );
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, totalVisits2024, isPaused }: TotalVisitsStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isVisitsTyped, setIsVisitsTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsVisitsTyped(false);
  }, [customerName, year, totalVisits, totalVisits2024]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        text={`¡${customerName.toUpperCase()}, NOS VISITASTE...`}
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
          text={`${totalVisits} VECES!`}
          speed={75}
          onComplete={() => setIsVisitsTyped(true)}
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
      {isVisitsTyped && (
        <ComparisonText current={totalVisits} previous={totalVisits2024} responsiveScale={responsiveScale} year={year} />
      )}
    </group>
  );
};