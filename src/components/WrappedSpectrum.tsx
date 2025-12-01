import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

// Brutalist: All colors are white, distinction is purely geometric/textual
const COLORS: { [key: string]: string } = {
  IPA: "#FFFFFF",
  Lager: "#FFFFFF",
  Stout: "#FFFFFF",
  Porter: "#FFFFFF",
  Pilsner: "#FFFFFF",
  Ale: "#FFFFFF",
  Other: "#FFFFFF",
  "N/A": "#A9A9A9", // Gray for no data
};

const PARTICLE_COUNT_PER_SEGMENT = 1000;
const INNER_RADIUS = 0.8;
const OUTER_RADIUS = 1.2;
const BASE_TEXT_FONT_SIZE_LARGE = 0.3;
const BASE_TEXT_FONT_SIZE_SMALL = 0.15;

const FlavorSegment = ({ startAngle, angle, color }: { startAngle: number; angle: number; color: string }) => {
  const points = useMemo(() => {
    const p = new Float32Array(PARTICLE_COUNT_PER_SEGMENT * 3);
    for (let i = 0; i < PARTICLE_COUNT_PER_SEGMENT; i++) {
      const currentAngle = startAngle + Math.random() * angle;
      const radius = INNER_RADIUS + Math.random() * (OUTER_RADIUS - INNER_RADIUS);
      p[i * 3] = Math.cos(currentAngle) * radius;
      p[i * 3 + 1] = Math.sin(currentAngle) * radius;
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
    return p;
  }, [startAngle, angle]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT_PER_SEGMENT} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color={color} />
    </points>
  );
};

export function WrappedSpectrum({ flavorData, ...props }: { flavorData: { [key: string]: number } } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 12); // Adjust base reference width as needed

  const totalLiters = useMemo(() => Object.values(flavorData).reduce((sum, v) => sum + v, 0), [flavorData]);

  if (totalLiters === 0) {
    return (
      <group {...props} scale={responsiveScale}>
        <Text position={[0, 0, 0]} fontSize={BASE_TEXT_FONT_SIZE_LARGE * responsiveScale} color="white">No data</Text>
        <Text position={[0, -0.5, 0]} fontSize={BASE_TEXT_FONT_SIZE_SMALL * responsiveScale} color="white">Dominante</Text>
      </group>
    );
  }

  let accumulatedAngle = 0;

  return (
    <group {...props} scale={responsiveScale}>
      <Text
        position={[0, OUTER_RADIUS + 0.8, 0]}
        fontSize={BASE_TEXT_FONT_SIZE_LARGE * responsiveScale}
        color="white"
        anchorX="center"
        anchorY="middle"
        // Removed outlineWidth and outlineColor
      >
        Dominante
      </Text>
      {Object.entries(flavorData).map(([category, ml]) => {
        const percentage = ml / totalLiters;
        const angle = percentage * Math.PI * 2;
        const color = COLORS[category] || COLORS["Other"];

        const segment = (
          <FlavorSegment key={category} startAngle={accumulatedAngle} angle={angle} color={color} />
        );

        const midAngle = accumulatedAngle + angle / 2;
        const textRadius = OUTER_RADIUS + 0.3;
        const textX = Math.cos(midAngle) * textRadius;
        const textY = Math.sin(midAngle) * textRadius;

        accumulatedAngle += angle;

        return (
          <group key={`group-${category}`}>
            {segment}
            <Text position={[textX, textY, 0]} fontSize={BASE_TEXT_FONT_SIZE_SMALL * responsiveScale} color="white">
              {`${category} (${(percentage * 100).toFixed(1)}%)`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}