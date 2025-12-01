import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface IntroStoryProps {
  customerName: string;
  totalVisits: number;
}

export const IntroStory = ({ customerName, totalVisits }: IntroStoryProps) => {
  return (
    <group>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.8}
        color="#F654A9" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        ¡Hola, {customerName}!
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
        Este fue tu 2025 en Chin Chin
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Nos visitaste {totalVisits} veces
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