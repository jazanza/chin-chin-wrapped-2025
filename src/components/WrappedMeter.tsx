import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { BeerVisualizer } from "./BeerVisualizer"; // Import BeerVisualizer

const MAX_LITERS_FOR_SCALE = 15000; // Max liters for visual scaling

export function WrappedMeter({ totalLiters, ...props }: { totalLiters: number } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const textRef = useRef<any>(null!);
  const animatedLiters = useRef(0);

  const maxHeight = viewport.height * 0.8;
  const bottomY = -maxHeight / 2;

  useFrame(() => {
    animatedLiters.current = THREE.MathUtils.lerp(animatedLiters.current, totalLiters, 0.05);

    if (textRef.current) {
      textRef.current.text = `${animatedLiters.current.toFixed(2)} L`;
      textRef.current.fontSize = Math.min(1, viewport.width * 0.08);
      // Position text above the animated liquid level
      const currentLiquidHeight = (animatedLiters.current / MAX_LITERS_FOR_SCALE) * maxHeight;
      textRef.current.position.y = bottomY + currentLiquidHeight + 0.5;
    }
  });

  return (
    <group {...props}>
      <BeerVisualizer liters={totalLiters} visible={true} /> {/* Use BeerVisualizer here */}
      <Text
        ref={textRef}
        position={[0, 0, 0]} // Se ajusta dinámicamente en useFrame
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {`${totalLiters.toFixed(2)} L`}
      </Text>
      <Text
        position={[0, -maxHeight / 2 - 0.8, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        TOTAL CONSUMIDO
      </Text>
    </group>
  );
}