import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

function Bubbles({ liters }: { liters: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { viewport } = useThree();

  // El número de burbujas es proporcional a los litros, con un límite para el rendimiento.
  const count = Math.min(Math.floor(liters * 100), 20000);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(viewport.width * 2);
      const y = THREE.MathUtils.randFloatSpread(viewport.height * 2);
      const z = THREE.MathUtils.randFloatSpread(10);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count, viewport.width, viewport.height]);

  useFrame(() => {
    if (!pointsRef.current || liters === 0) return;
    const positions = pointsRef.current.geometry.attributes.position.array;

    for (let i = 1; i < positions.length; i += 3) {
      positions[i] += 0.01; // Velocidad de subida
      if (positions[i] > viewport.height / 2) {
        positions[i] = -viewport.height / 2; // Reiniciar abajo
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (liters === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FFD700"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BeerVisualizer({ liters }: { liters: number }) {
  // La intensidad de la luz es proporcional a los litros.
  const lightIntensity = Math.min(liters / 100, 5);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 0, 0]}
        color="#FFA500"
        intensity={lightIntensity}
        distance={20}
      />

      <Bubbles liters={liters} />

      <Text
        position={[0, 0, 0]}
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {`${liters.toFixed(2)} L`}
      </Text>
    </>
  );
}