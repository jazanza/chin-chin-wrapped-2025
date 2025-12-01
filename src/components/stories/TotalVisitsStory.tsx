import React, { useState, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';

interface TotalVisitsStoryProps {
  customerName: string;
  year: string;
  totalVisits: number;
  totalVisits2024: number;
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

const ComparisonText = ({ current, previous, responsiveScale, year, textColor, position }: { current: number; previous: number; responsiveScale: number; year: string; textColor: string; position: [number, number, number] }) => {
  const { viewport } = useThree();

  if (previous === 0) {
    return (
      <group position={position}>
        <Text
          fontSize={Math.min(viewport.width * 0.02, 0.1) * responsiveScale}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.03]}
          maxWidth={viewport.width * 0.8}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={400}
        >
          No data for {parseInt(year) - 1}
        </Text>
      </group>
    );
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = percentage >= 0;
  const color = isPositive ? "#00FF00" : "#FF0000"; // Green for up, Red for down

  return (
    <group position={position}>
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

export const TotalVisitsStory = ({ customerName, year, totalVisits, totalVisits2024, isPaused, textColor, highlightColor }: TotalVisitsStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isVisitsTyped, setIsVisitsTyped] = useState(false);

  useEffect(() => {
    setIsVisitsTyped(false);
  }, [customerName, year, totalVisits, totalVisits2024]);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: `¡${customerName.toUpperCase()},`, color: highlightColor },
    { text: "\nNOS VISITASTE...", color: textColor },
    { text: `\n${totalVisits}`, color: highlightColor },
    { text: " VECES!", color: textColor },
  ], [customerName, totalVisits, textColor, highlightColor]);

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={storySegments}
        speed={75}
        onComplete={() => setIsVisitsTyped(true)}
        isPaused={isPaused}
        position={[0, 0, 0]} // Centered
        fontSize={Math.min(viewport.width * 0.08, 0.8) * responsiveScale}
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
        lineHeight={1.2}
      />
      {isVisitsTyped && (
        <ComparisonText
          current={totalVisits}
          previous={totalVisits2024}
          responsiveScale={responsiveScale}
          year={year}
          textColor={textColor}
          position={[0, -2.5 * responsiveScale, 0]} // Adjusted position below main text
        />
      )}
    </group>
  );
};