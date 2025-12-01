import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

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
    <group ref={groupRef}>{lines.map((line, i) => (
        <Line
          key={i}
          points={[line.start, line.end]}
          color={line.color}
          lineWidth={2}
          transparent
          opacity={0.3}
        />
      ))}</group>
  );
};