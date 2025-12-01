import React from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

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
      generatedLines.push({ start, end, color: i % 2 === 0 ? "#F654A9" : "#00FF99", speed: 0.5 + Math.random() * 0.5 });
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
  return (
    <group>
      <AnimatedBackgroundLines />
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.8}
        color="#F654A9" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        ¡HOLA, {customerName.toUpperCase()}!
      </Text>
      <Text
        position={[0, 0, 0]}
        fontSize={0.4}
        color="#00FF99" // secondary-glitch-cyan
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        ESTE FUE TU 2025 EN CHIN CHIN
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        NOS VISITASTE {totalVisits} VECES
      </Text>
      {/* Simple visual for visits */}
      {Array.from({ length: Math.min(totalVisits, 10) }).map((_, i) => (
        <mesh key={i} position={[-2 + i * 0.4, -2.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#F654A9" : "#00FF99"} />
        </mesh>
      ))}
    </group>
  );
};