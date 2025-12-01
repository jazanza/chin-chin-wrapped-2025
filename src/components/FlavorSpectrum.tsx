import { useMemo } from "react";
import { Text } from "@react-three/drei";

const COLORS: { [key: string]: string } = {
  IPA: "#FFC107",
  Lager: "#03A9F4",
  Stout: "#3F51B5",
  Porter: "#795548",
  Pilsner: "#8BC34A",
  Ale: "#FF9800",
  Other: "#9E9E9E",
};

const PieSegment = ({ startAngle, angle, color, radius, height }: { startAngle: number; angle: number; color: string; radius: number; height: number }) => {
  return (
    <mesh rotation={[0, startAngle, 0]}>
      <cylinderGeometry args={[radius, radius, height, 32, 1, false, 0, angle]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export function FlavorSpectrum({ flavorData, ...props }: { flavorData: { [key: string]: number } } & JSX.IntrinsicElements['group']) {
  const totalMl = useMemo(() => Object.values(flavorData).reduce((sum, v) => sum + v, 0), [flavorData]);

  if (totalMl === 0) {
    return (
      <group {...props}>
        <Text position={[0, 0, 0]} fontSize={0.3} color="#333">No flavor data available</Text>
      </group>
    );
  }

  let accumulatedAngle = 0;

  return (
    <group {...props}>
      {Object.entries(flavorData).map(([category, ml]) => {
        const percentage = ml / totalMl;
        const angle = percentage * Math.PI * 2;
        const color = COLORS[category] || COLORS["Other"];

        const segment = (
          <PieSegment key={category} startAngle={accumulatedAngle} angle={angle} color={color} radius={2.5} height={0.5} />
        );

        const midAngle = accumulatedAngle + angle / 2;
        const textRadius = 3.0;
        const textX = Math.cos(midAngle) * textRadius;
        const textZ = Math.sin(midAngle) * textRadius;

        accumulatedAngle += angle;

        return (
          <group key={`group-${category}`}>
            {segment}
            <Text position={[textX, 0.5, textZ]} fontSize={0.2} color="#333" rotation={[-Math.PI / 2, 0, 0]}>
              {`${category} (${(percentage * 100).toFixed(0)}%)`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}