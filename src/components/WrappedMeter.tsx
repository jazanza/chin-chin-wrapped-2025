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
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  useFrame(() => {
    animatedLiters.current = THREE.MathUtils.lerp(animatedLiters.current, totalLiters, 0.05);

    if (textRef.current) {
      textRef.current.text = `${animatedLiters.current.toFixed(1)} L`; // Changed to 1 decimal place
      // Oversize de Datos: font-size: 18vw; font-weight: 900;
      // Simulate 18vw with responsiveScale, capping at a reasonable max
      textRef.current.fontSize = Math.min(viewport.width * 0.18, 2.5); // Max 2.5 for desktop, scales down for mobile
      // Position text above the animated liquid level
      const currentLiquidHeight = (animatedLiters.current / MAX_LITERS_FOR_SCALE) * maxHeight;
      textRef.current.position.y = bottomY + currentLiquidHeight + 0.5 * responsiveScale;
    }
  });

  return (
    <group {...props}>
      <BeerVisualizer liters={totalLiters} visible={true} /> {/* Use BeerVisualizer here */}
      <Text
        ref={textRef}
        position={[0, 0, 0]} // Se ajusta dinámicamente en useFrame
        fontSize={1 * responsiveScale} // Initial value, will be updated in useFrame
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05 * responsiveScale}
        outlineColor="#000000"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
      >
        {`${totalLiters.toFixed(1)} L`}
      </Text>
      <Text
        position={[0, -maxHeight / 2 - 0.8 * responsiveScale, 0]}
        fontSize={0.3 * responsiveScale}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
      >
        TOTAL CONSUMIDO
      </Text>
    </group>
  );
}