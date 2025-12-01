import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { BeerVisualizer } from "./BeerVisualizer"; // Import BeerVisualizer

const MAX_LITERS_FOR_SCALE = 15000; // Max liters for visual scaling

export function WrappedMeter({ totalLiters, ...props }: { totalLiters: number } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  // Removed textRef as the Text component is now removed
  const animatedLiters = useRef(0);

  const maxHeight = viewport.height * 0.8;
  const bottomY = -maxHeight / 2;
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  useFrame(() => {
    animatedLiters.current = THREE.MathUtils.lerp(animatedLiters.current, totalLiters, 0.05);

    // Removed textRef logic as the Text component is now removed
  });

  return (
    <group {...props}>
      <BeerVisualizer liters={totalLiters} visible={true} /> {/* Use BeerVisualizer here */}
      {/* Removed the redundant Text component that displayed total liters */}
    </group>
  );
}