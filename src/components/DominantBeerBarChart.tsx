import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text, Box } from "@react-three/drei";
import * as THREE from "three";

interface CategoryVolume {
  category: string;
  liters: number;
  color: string;
  isDominant: boolean;
}

const MAX_BAR_HEIGHT = 2.5;
const BAR_WIDTH = 0.6;
const BAR_GAP = 0.2;
const BASE_TEXT_FONT_SIZE = 0.15;

export function DominantBeerBarChart({ categoryVolumes, dominantBeerCategory, ...props }: { categoryVolumes: { [key: string]: number }; dominantBeerCategory: string } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const responsiveScale = Math.min(1, viewport.width / 12);

  const processedData: CategoryVolume[] = useMemo(() => {
    const totalLiters = Object.values(categoryVolumes).reduce((sum, v) => sum + v, 0);
    if (totalLiters === 0) return [];

    // Use new accent colors for bars, alternating
    const accentColors = ["#00FF66", "#FF008A", "#FF9A00", "#00E6FF"]; // neon-green, neon-magenta, neon-orange, neon-cyan
    let colorIndex = 0;

    return Object.entries(categoryVolumes).map(([category, liters]) => {
      const color = category === dominantBeerCategory ? "#00FF66" : accentColors[colorIndex % accentColors.length]; // Dominant is neon-green
      if (category !== dominantBeerCategory) {
        colorIndex++;
      }
      return {
        category,
        liters,
        color,
        isDominant: category === dominantBeerCategory,
      };
    }).sort((a, b) => b.liters - a.liters); // Sort by liters descending
  }, [categoryVolumes, dominantBeerCategory]);

  const maxLiters = Math.max(...processedData.map(d => d.liters), 1);

  if (processedData.length === 0) {
    return (
      <group {...props} scale={responsiveScale}>
        <Text position={[0, 0, 0]} fontSize={BASE_TEXT_FONT_SIZE * 2 * responsiveScale} color="white">
          No data available
        </Text>
      </group>
    );
  }

  return (
    <group {...props} scale={responsiveScale}>
      {processedData.map((data, index) => (
        <Bar
          key={data.category}
          data={data}
          index={index}
          maxLiters={maxLiters}
          totalBars={processedData.length}
          responsiveScale={responsiveScale}
        />
      ))}
    </group>
  );
}

const Bar = ({ data, index, maxLiters, totalBars, responsiveScale }: { data: CategoryVolume; index: number; maxLiters: number; totalBars: number; responsiveScale: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const animatedHeight = useRef(0);
  const targetHeight = (data.liters / maxLiters) * MAX_BAR_HEIGHT;

  const totalWidth = totalBars * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
  const startX = -totalWidth / 2;
  const positionX = startX + index * (BAR_WIDTH + BAR_GAP) + BAR_WIDTH / 2;

  // Convert hex color strings to THREE.Color objects
  const barColor = useMemo(() => new THREE.Color(data.color), [data.color]);
  const emissiveColor = useMemo(() => data.isDominant ? new THREE.Color(data.color) : new THREE.Color(0x000000), [data.isDominant, data.color]);

  useFrame(() => {
    animatedHeight.current = THREE.MathUtils.lerp(animatedHeight.current, targetHeight, 0.05);
    if (meshRef.current) {
      meshRef.current.scale.y = animatedHeight.current;
      meshRef.current.position.y = animatedHeight.current / 2;
    }
  });

  return (
    <group position={[positionX, 0, 0]}>
      <Box ref={meshRef} args={[BAR_WIDTH, 1, BAR_WIDTH * 0.5]} scale-y={0.01}> {/* Initial scale-y 0.01 for animation */}
        <meshStandardMaterial color={barColor} emissive={emissiveColor} emissiveIntensity={data.isDominant ? 1.5 : 0} />
      </Box>
      <Text
        position={[0, MAX_BAR_HEIGHT + 0.2, 0]}
        fontSize={BASE_TEXT_FONT_SIZE * responsiveScale}
        color="white"
        anchorX="center"
        maxWidth={BAR_WIDTH * 1.5}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
        fontWeight={700} // Apply strong font weight
      >
        {data.category}
      </Text>
      <Text
        position={[0, MAX_BAR_HEIGHT + 0.05, 0]}
        fontSize={BASE_TEXT_FONT_SIZE * 0.8 * responsiveScale}
        color="gray"
        anchorX="center"
        maxWidth={BAR_WIDTH * 1.5}
        textAlign="center"
        letterSpacing={-0.05} // Apply negative letter spacing
        fontWeight={400} // Apply normal font weight
      >
        {`${data.liters.toFixed(1)} L`}
      </Text>
    </group>
  );
};