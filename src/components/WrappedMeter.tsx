import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { BeerVisualizer } from "./BeerVisualizer"; // Import BeerVisualizer

const MAX_LITERS_FOR_SCALE = 15000; // Max liters for visual scaling

export function WrappedMeter({ totalLiters, textColor, highlightColor, ...props }: { totalLiters: number; textColor: string; highlightColor: string } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const animatedLiters = useRef(0);

  const maxHeight = viewport.height * 0.8;
  const bottomY = -maxHeight / 2;
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  useFrame(() => {
    animatedLiters.current = THREE.MathUtils.lerp(animatedLiters.current, totalLiters, 0.05);
  });

  return (
    <group {...props}>
      <BeerVisualizer liters={totalLiters} visible={true} textColor={textColor} highlightColor={highlightColor} />
    </group>
  );
}