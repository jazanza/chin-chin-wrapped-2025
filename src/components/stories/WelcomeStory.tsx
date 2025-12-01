import React, { useState, useEffect } from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText'; // Import TextSegment

interface WelcomeStoryProps {
  customerName: string;
  year: string; // Added year prop
  totalVisits: number; // Still passed, but not used in this component anymore
  isPaused: boolean; // Added isPaused prop
}

export const AnimatedBackgroundLines = () => {
  const groupRef = React.useRef<THREE.Group>(null!);
  const lineCount = 10;
  const lineLength = 10;

  const lines = React.useMemo(() => {
    const generatedLines = [];
    for (let i = 0; i < lineCount; i++) {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * lineLength * 2,
        (Math.random() - 0.5) * lineLength * 2,
        (Math.random() - 0.5) * 2
      );
      const end = start.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * lineLength,
        (Math.random() - 0.5) * lineLength,
        (Math.random() - 0.5) * 2
      ));
      // Brutalist: Use White and Dark Gray lines
      generatedLines.push({ start, end, color: i % 2 === 0 ? "#FFFFFF" : "#333333", speed: 0.5 + Math.random() * 0.5 }); 
    }
    return generatedLines;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = clock.getElapsedTime() * 0.03;
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={[line.start, line.end]}
          color={line.color}
          lineWidth={2}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
};

export const WelcomeStory = ({ customerName, year, isPaused }: WelcomeStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isSubTitleTyped, setIsSubTitleTyped] = useState(false);

  useEffect(() => {
    // Reset animation states when story changes
    setIsTitleTyped(false);
    setIsSubTitleTyped(false);
  }, [customerName, year]);

  const titleSegments: TextSegment[] = [
    { text: `¡HOLA, ${customerName.toUpperCase()}!`, color: "#FFFFFF" },
  ];

  const subTitleSegments: TextSegment[] = [
    { text: `BIENVENIDO A TU ${year} WRAPPED`, color: "#FFFFFF" },
  ];

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={titleSegments}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 1.5 * responsiveScale, 0]}
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
          segments={subTitleSegments}
          speed={75}
          onComplete={() => setIsSubTitleTyped(true)}
          isPaused={isPaused}
          position={[0, 0.5 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.06, 0.4) * responsiveScale}
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