import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export function VarietyBalance({ varietyMetrics, ...props }: { varietyMetrics: { totalLiters: number; uniqueProducts: number } } & JSX.IntrinsicElements['group']) {
  const balanceRef = useRef<THREE.Group>(null!);
  const { totalLiters, uniqueProducts } = varietyMetrics;

  const volumeWeight = totalLiters * 0.1;
  const varietyWeight = uniqueProducts * 1.0;
  const totalWeight = volumeWeight + varietyWeight;
  const targetRotation = totalWeight > 0 ? (varietyWeight - volumeWeight) / totalWeight * (Math.PI / 8) : 0;

  useFrame(() => {
    if (balanceRef.current) {
      balanceRef.current.rotation.z = THREE.MathUtils.lerp(balanceRef.current.rotation.z, targetRotation, 0.05);
    }
  });

  return (
    <group position={[0, -1, 0]} {...props}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.2, 16]} />
        <meshStandardMaterial color="darkgray" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2, 8]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* Beam */}
      <group ref={balanceRef} position={[0, 2.1, 0]}>
        <mesh rotation-z={Math.PI / 2}>
          <boxGeometry args={[4, 0.1, 0.5]} />
          <meshStandardMaterial color="silver" />
        </mesh>

        {/* Left Pan (Volume) */}
        <group position={[-2, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#2196F3" />
          </mesh>
          <Text position={[0, -0.8, 0]} fontSize={0.2} color="#333">Volume</Text>
          <Text position={[0, -1.1, 0]} fontSize={0.15} color="#333">{`${totalLiters.toFixed(1)} L`}</Text>
        </group>

        {/* Right Pan (Variety) */}
        <group position={[2, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#4CAF50" />
          </mesh>
          <Text position={[0, -0.8, 0]} fontSize={0.2} color="#333">Variety</Text>
          <Text position={[0, -1.1, 0]} fontSize={0.15} color="#333">{`${uniqueProducts} Products`}</Text>
        </group>
      </group>
    </group>
  );
}