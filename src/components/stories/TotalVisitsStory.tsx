import React, { useState, useEffect } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText'; // Import TextSegment
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // Updated import path

interface TotalVisitsStoryProps {
  customerName: string;
  year: string;
  totalVisits: number;
  totalVisits2024: number;
  isPaused: boolean;
  textColor: string;
  highlightColor: string;
}

const ComparisonText = ({ current, previous, responsiveScale, year, textColor }: { current: number; previous: number; responsiveScale: number; year: string; textColor: string }) => {
  const { viewport } = useThree();

  if (previous === 0) {
    return (
      <Text
        fontSize={Math.min(viewport.width * 0.02, 0.1) * responsiveScale}
        color={textColor} // Use textColor for "No data"
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

export const TotalVisitsStory = ({ customerName, year, totalVisits, totalVisits2024, isPaused, textColor, highlightColor }: TotalVisitsStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isVisitsTyped, setIsVisitsTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsVisitsTyped(false);
  }, [customerName, year, totalVisits, totalVisits2024]);

  const titleSegments: TextSegment[] = [
    { text: "¡", color: textColor },
    { text: customerName.toUpperCase(), color: highlightColor },
    { text: ", NOS VISITASTE...", color: textColor },
  ];

  const visitsSegments: TextSegment[] = [
    { text: `${totalVisits}`, color: highlightColor },
    { text: " VECES!", color: textColor },
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
          segments={visitsSegments}
          speed={75}
          onComplete={() => setIsVisitsTyped(true)}
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
      {isVisitsTyped && (
        <ComparisonText current={totalVisits} previous={totalVisits2024} responsiveScale={responsiveScale} year={year} textColor={textColor} />
      )}
    </group>
  );
};