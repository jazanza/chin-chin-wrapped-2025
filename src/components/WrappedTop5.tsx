import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface Product {
  name: string;
  liters: number;
  color: string;
}

const PARTICLE_COUNT_PER_COLUMN = 2000;
const COLUMN_WIDTH = 0.5;
const MAX_COLUMN_HEIGHT = 2;
const BASE_TEXT_FONT_SIZE = 0.1;

const ProductColumn = ({ product, index, maxLiters, responsiveScale, textColor, highlightColor }: { product: Product; index: number; maxLiters: number; totalBars: number; responsiveScale: number; textColor: string; highlightColor: string }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const textRef = useRef<any>(null!);
  const animatedHeight = useRef(0);
  
  const targetHeight = maxLiters > 0 ? (product.liters / maxLiters) * MAX_COLUMN_HEIGHT : 0;
  // Brutalist: Force color to white
  const color = "#FFFFFF"; 

  const originalPositions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT_PER_COLUMN * 3);
    for (let i = 0; i < PARTICLE_COUNT_PER_COLUMN; i++) {
      pos[i * 3] = (Math.random() - 0.5) * COLUMN_WIDTH;
      pos[i * 3 + 1] = (i / PARTICLE_COUNT_PER_COLUMN) * MAX_COLUMN_HEIGHT;
      pos[i * 3 + 2] = (Math.random() - 0.5) * COLUMN_WIDTH;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    animatedHeight.current = THREE.MathUtils.lerp(animatedHeight.current, targetHeight, 0.05);
    const visibleParticles = Math.floor((animatedHeight.current / MAX_COLUMN_HEIGHT) * PARTICLE_COUNT_PER_COLUMN);

    if (pointsRef.current) {
      const geom = pointsRef.current.geometry as THREE.BufferGeometry;
      geom.setDrawRange(0, visibleParticles);

      const positions = geom.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();
      for (let i = 0; i < visibleParticles; i++) {
        const y = originalPositions[i * 3 + 1];
        positions[i * 3] = originalPositions[i * 3] + Math.sin(y * 2 + time * 2 + index) * 0.05;
        positions[i * 3 + 2] = originalPositions[i * 3 + 2] + Math.cos(y * 2 + time * 2 + index) * 0.05;
      }
      geom.attributes.position.needsUpdate = true;
    }

    if (textRef.current) {
      textRef.current.position.y = animatedHeight.current + 0.2;
    }
  });

  return (
    <group position={[(index - 2) * 0.8, 0, 0]}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT_PER_COLUMN} array={originalPositions.slice()} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.02} color={color} />
      </points>
      <Text
        position={[0, MAX_COLUMN_HEIGHT + 0.2, 0]} // Position above the max height
        fontSize={BASE_TEXT_FONT_SIZE * responsiveScale}
        color={highlightColor} // Use highlightColor for product name
        anchorX="center"
        maxWidth={0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={700}
      >
        {product.name.toUpperCase()}
      </Text>
      <Text
        position={[0, MAX_COLUMN_HEIGHT, 0]} // Position slightly below the name
        fontSize={BASE_TEXT_FONT_SIZE * 0.8 * responsiveScale}
        color={textColor} // Use textColor for liters
        anchorX="center"
        maxWidth={0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={400}
      >
        {`${product.liters.toFixed(1)} L`}
      </Text>
    </group>
  );
};

export function WrappedTop5({ top5Products, textColor, highlightColor, ...props }: { top5Products: Product[]; textColor: string; highlightColor: string } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 12);

  const maxLiters = Math.max(...top5Products.map(p => p.liters), 1);

  return (
    <group {...props} scale={responsiveScale}>
      {top5Products.map((product, index) => (
        <ProductColumn
          key={product.name}
          product={product}
          index={index}
          maxLiters={maxLiters}
          totalBars={top5Products.length}
          responsiveScale={responsiveScale}
          textColor={textColor}
          highlightColor={highlightColor}
        />
      ))}
    </group>
  );
}