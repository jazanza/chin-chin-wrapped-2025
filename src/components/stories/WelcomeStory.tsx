import React, { useState, useEffect } from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText'; // Import the new component

interface WelcomeStoryProps {
  customerName: string;
  year: string; // Added year prop
  totalVisits: number;
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

export const WelcomeStory = ({ customerName, year, totalVisits, isPaused }: WelcomeStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isSubTitleTyped, setIsSubTitleTyped] = useState(false);

  useEffect(() => {
    // Reset animation states when story changes
    setIsTitleTyped(false);
    setIsSubTitleTyped(false);
  }, [customerName, year, totalVisits]); // Added year to dependencies

  return (
    <group>
      <AnimatedBackgroundLines />
      <TypewriterText
        text={`¡HOLA, ${customerName.toUpperCase()}!`}
        speed={50}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, 1.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.8) * responsiveScale}
        color="#FFFFFF" // White
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          text={`ESTE FUE TU ${year} EN CHIN CHIN`}
          speed={50}
          onComplete={() => setIsSubTitleTyped(true)}
          isPaused={isPaused}
          position={[0, 0 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.06, 0.4) * responsiveScale}
          color="#FFFFFF" // White
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03 * responsiveScale}
          outlineColor="#000000"
          maxWidth={viewport.width * 0.8}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={900}
        />
      )}
      {isSubTitleTyped && (
        <group>
          <Text
            position={[0, -1.5 * responsiveScale, 0]}
            fontSize={0.3 * responsiveScale}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={viewport.width * 0.8}
            textAlign="center"
            letterSpacing={-0.05}
            fontWeight={700}
          >
            NOS VISITASTE {totalVisits} VECES
          </Text>
          {/* Simple visual for visits - Monochromatic spheres */}
          {Array.from({ length: Math.min(totalVisits, 10) }).map((_, i) => (
            <mesh key={i} position={[-2 + i * 0.4 * responsiveScale, -2.5 * responsiveScale, 0]}>
              <sphereGeometry args={[0.1 * responsiveScale, 16, 16]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#FFFFFF" : "#333333"} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};