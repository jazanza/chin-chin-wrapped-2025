import React from 'react';
import { Text, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface Product {
  name: string;
  liters: number;
  color: string;
}

interface SummaryInfographicProps {
  customerName: string;
  year: string;
  totalLiters: number;
  dominantBeerCategory: string;
  top5Products: Product[];
  totalVisits: number;
}

const ProgressBar = ({ value, maxValue, color, position, scaleFactor = 1 }: { value: number; maxValue: number; color: string; position: [number, number, number]; scaleFactor?: number }) => {
  const barRef = useRef<THREE.Mesh>(null!);
  const animatedScale = useRef(0);
  const targetScale = maxValue > 0 ? (value / maxValue) : 0;

  useFrame(() => {
    animatedScale.current = THREE.MathUtils.lerp(animatedScale.current, targetScale, 0.05);
    if (barRef.current) {
      barRef.current.scale.x = animatedScale.current * scaleFactor;
      barRef.current.position.x = position[0] + (barRef.current.scale.x / 2); // Adjust position to grow from left
    }
  });

  return (
    <group>
      <Box args={[scaleFactor, 0.05, 0.01]} position={[position[0] + scaleFactor / 2, position[1], position[2]]}>
        <meshBasicMaterial color="#333333" transparent opacity={0.5} /> {/* Background bar */}
      </Box>
      <Box ref={barRef} args={[1, 0.05, 0.02]} position={[position[0], position[1], position[2] + 0.01]} scale-x={0.01}>
        <meshBasicMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </Box>
    </group>
  );
};

export const SummaryInfographic = ({
  customerName,
  year,
  totalLiters,
  dominantBeerCategory,
  top5Products,
  totalVisits,
}: SummaryInfographicProps) => {
  const BASE_FONT_SIZE = 0.18;
  const SMALL_FONT_SIZE = 0.12;
  const LINE_HEIGHT = 0.4;

  return (
    <group position={[0, 0, 0]}>
      {/* Background Panel */}
      <Box args={[8, 6, 0.1]} position={[0, 0, -0.1]}>
        <meshBasicMaterial color="#0a0a0a" transparent opacity={0.8} />
      </Box>

      {/* Title */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={BASE_FONT_SIZE * 2}
        color="#F654A9" // primary-glitch-pink
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {customerName.toUpperCase()}
      </Text>
      <Text
        position={[0, 2.1, 0]}
        fontSize={BASE_FONT_SIZE * 1.2}
        color="#00FF99" // secondary-glitch-cyan
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {year} WRAPPED
      </Text>

      {/* Total Liters */}
      <Text
        position={[-2.5, 1.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.5}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        TOTAL CONSUMIDO:
      </Text>
      <Text
        position={[-2.5, 0.8, 0]}
        fontSize={BASE_FONT_SIZE * 2}
        color="#F654A9" // primary-glitch-pink
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {totalLiters.toFixed(1)} L
      </Text>
      {/* Simple visual for total liters */}
      <Cylinder args={[0.3, 0.3, Math.min(totalLiters / 500, 1.5), 16]} position={[-1, 0.8, 0]} rotation-x={Math.PI / 2}>
        <meshBasicMaterial color="#F654A9" emissive="#F654A9" emissiveIntensity={0.5} />
      </Cylinder>

      {/* Dominant Beer Category */}
      <Text
        position={[2.5, 1.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.5}
        color="white"
        anchorX="right"
        anchorY="middle"
      >
        CERVEZA DOMINANTE:
      </Text>
      <Text
        position={[2.5, 0.8, 0]}
        fontSize={BASE_FONT_SIZE * 2}
        color="#00FF99" // secondary-glitch-cyan
        anchorX="right"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {dominantBeerCategory.toUpperCase()}
      </Text>
      {/* Simple visual for dominant beer */}
      <Box args={[0.5, 0.5, 0.1]} position={[1.5, 0.8, 0]}>
        <meshBasicMaterial color="#00FF99" emissive="#00FF99" emissiveIntensity={0.5} />
      </Box>

      {/* Top 5 Products */}
      <Text
        position={[-2.5, -0.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.2}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        TOP 5 PRODUCTOS:
      </Text>
      {top5Products.map((product, index) => (
        <group key={product.name} position={[-2.5, -0.6 - index * LINE_HEIGHT, 0]}>
          <Text
            fontSize={SMALL_FONT_SIZE}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            {index + 1}. {product.name.toUpperCase()}
          </Text>
          <Text
            position={[2, 0, 0]}
            fontSize={SMALL_FONT_SIZE * 0.8}
            color="gray"
            anchorX="right"
            anchorY="middle"
          >
            {product.liters.toFixed(1)} L
          </Text>
          <ProgressBar
            value={product.liters}
            maxValue={Math.max(...top5Products.map(p => p.liters), 1)}
            color={product.color}
            position={[-0.2, -0.15, 0]} // Position relative to the group
            scaleFactor={2.2} // Max width of the progress bar
          />
        </group>
      ))}

      {/* Total Visits */}
      <Text
        position={[2.5, -0.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.2}
        color="white"
        anchorX="right"
        anchorY="middle"
      >
        VISITAS:
      </Text>
      <Text
        position={[2.5, -0.6, 0]}
        fontSize={BASE_FONT_SIZE * 1.5}
        color="#F654A9" // primary-glitch-pink
        anchorX="right"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {totalVisits}
      </Text>
      {/* Simple visual for visits */}
      <Box args={[0.5, 0.5, 0.1]} position={[1.5, -0.6, 0]}>
        <meshBasicMaterial color="#F654A9" emissive="#F654A9" emissiveIntensity={0.5} />
      </Box>
    </group>
  );
};