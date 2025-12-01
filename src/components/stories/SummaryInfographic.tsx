import React from 'react';
import { Text, Box, Cylinder } from '@react-three/drei'; // Import Cylinder
import * as THREE from 'three';

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
        {customerName}
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
        {year} Wrapped
      </Text>

      {/* Total Liters */}
      <Text
        position={[-2.5, 1.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.5}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        Total Consumido:
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
        <meshBasicMaterial color="#F654A9" />
      </Cylinder>

      {/* Dominant Beer Category */}
      <Text
        position={[2.5, 1.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.5}
        color="white"
        anchorX="right"
        anchorY="middle"
      >
        Cerveza Dominante:
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
        {dominantBeerCategory}
      </Text>
      {/* Simple visual for dominant beer */}
      <Box args={[0.5, 0.5, 0.1]} position={[1.5, 0.8, 0]}>
        <meshBasicMaterial color="#00FF99" />
      </Box>

      {/* Top 5 Products */}
      <Text
        position={[-2.5, -0.2, 0]}
        fontSize={BASE_FONT_SIZE * 1.2}
        color="white"
        anchorX="left"
        anchorY="middle"
      >
        Top 5 Productos:
      </Text>
      {top5Products.map((product, index) => (
        <group key={product.name} position={[-2.5, -0.6 - index * LINE_HEIGHT, 0]}>
          <Text
            fontSize={SMALL_FONT_SIZE}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            {index + 1}. {product.name}
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
          <Box args={[product.liters / 50, 0.05, 0.01]} position={[1.2, 0, 0]} anchorX="left">
            <meshBasicMaterial color={product.color} />
          </Box>
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
        Visitas:
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
        <meshBasicMaterial color="#F654A9" />
      </Box>
    </group>
  );
};