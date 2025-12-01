import React from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface IntroStoryProps {
  customerName: string;
  totalVisits: number;
}

const AnimatedBackgroundLines = () => {
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
      generatedLines.push({ start, end, color: i % 2 === 0 ? "#FF008A" : "#00FF66", speed: 0.5 + Math.random() * 0.5 }); // neon-magenta : neon-green
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

export const IntroStory = ({ customerName, totalVisits }: IntroStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  return (
    <group>
      <AnimatedBackgroundLines />
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.8 * responsiveScale}
        color="#FF008A" // neon-magenta
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
      >
        ¡HOLA, {customerName.toUpperCase()}!
      </Text>
      <Text
        position={[0, 0, 0]}
        fontSize={0.4 * responsiveScale}
        color="#00FF66" // neon-green
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
      >
        ESTE FUE TU 2025 EN CHIN CHIN
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3 * responsiveScale}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
      >
        NOS VISITASTE {totalVisits} VECES
      </Text>
      {/* Simple visual for visits */}
      {Array.from({ length: Math.min(totalVisits, 10) }).map((_, i) => (
        <mesh key={i} position={[-2 + i * 0.4 * responsiveScale, -2.5 * responsiveScale, 0]}>
          <sphereGeometry args={[0.1 * responsiveScale, 16, 16]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#FF008A" : "#00FF66"} /> {/* neon-magenta : neon-green */}
        </mesh>
      ))}
    </group>
  );
};