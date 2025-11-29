import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const COLORS: { [key: string]: string } = {
  IPA: "#FF6347",
  Lager: "#FFD700",
  Stout: "#4B0082",
  Porter: "#8B4513",
  Pilsner: "#F0E68C",
  Ale: "#D2691E",
  Other: "#A9A9A9",
};

export function FlavorSpectrum({ flavorData }: { flavorData: { [key: string]: number } }) {
  const totalMl = useMemo(() => Object.values(flavorData).reduce((sum, v) => sum + v, 0), [flavorData]);

  if (totalMl === 0) {
    return <Text position={[0, 0, 0]} fontSize={0.3} color="white">No flavor data available</Text>;
  }

  let accumulatedAngle = 0;

  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      {Object.entries(flavorData).map(([category, ml]) => {
        const percentage = ml / totalMl;
        const angle = percentage * Math.PI * 2;
        const color = COLORS[category] || COLORS["Other"];

        const segment = (
          <mesh key={category} rotation={[0, 0, accumulatedAngle]}>
            <torusGeometry args={[1.5, 0.4, 16, 100, angle]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
        );

        const midAngle = accumulatedAngle + angle / 2;
        const textX = Math.cos(midAngle) * 2.3;
        const textY = Math.sin(midAngle) * 2.3;

        accumulatedAngle += angle;

        return (
          <group key={`group-${category}`}>
            {segment}
            <Text position={[textY, -textX, 0]} fontSize={0.15} color="white" rotation={[0, 0, -Math.PI / 2]}>
              {`${category} (${(percentage * 100).toFixed(1)}%)`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}