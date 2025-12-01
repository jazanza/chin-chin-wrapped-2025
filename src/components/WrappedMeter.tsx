import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 15000;
const MAX_LITERS_FOR_SCALE = 15000; // Max liters for visual scaling

export function WrappedMeter({ totalLiters, ...props }: { totalLiters: number } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null!);
  const textRef = useRef<any>(null!);

  const maxHeight = viewport.height * 0.8;
  const bottomY = -maxHeight / 2;
  const dynamicCylinderRadius = viewport.width * 0.15;

  const [positions, initialColors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = bottomY + (i / PARTICLE_COUNT) * maxHeight;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * dynamicCylinderRadius;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      color.setHSL((y - bottomY) / maxHeight, 1.0, 0.5);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [maxHeight, bottomY, dynamicCylinderRadius]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    const targetParticleCount = Math.floor((totalLiters / MAX_LITERS_FOR_SCALE) * PARTICLE_COUNT);
    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    geometry.setDrawRange(0, targetParticleCount);

    const time = clock.getElapsedTime();
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colors = geometry.attributes.color as THREE.BufferAttribute;
    const color = new THREE.Color();

    for (let i = 0; i < targetParticleCount; i++) {
      const y = positions[i * 3 + 1];
      const waveX = Math.sin(y * 2 + time) * 0.05;
      const waveZ = Math.cos(y * 2 + time) * 0.05;
      const waveY = Math.sin(positions[i * 3] * 0.5 + time) * 0.05;
      posAttr.setXYZ(i, positions[i * 3] + waveX, y + waveY, positions[i * 3 + 2] + waveZ);
      const hue = (time * 0.1 + (y - bottomY) / maxHeight * 0.1) % 1;
      color.setHSL(hue, 1.0, 0.5);
      colors.setXYZ(i, color.r, color.g, color.b);
    }
    posAttr.needsUpdate = true;
    colors.needsUpdate = true;

    if (textRef.current) {
      textRef.current.text = `${totalLiters.toFixed(2)} L`;
      textRef.current.fontSize = Math.min(1, viewport.width * 0.08);
      textRef.current.position.y = (bottomY + (totalLiters / MAX_LITERS_FOR_SCALE) * maxHeight) + 0.5;
    }
  });

  return (
    <group {...props}>
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
        Total Consumido
      </Text>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={initialColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} vertexColors={true} transparent={true} opacity={0.7} />
      </points>
    </group>
  );
}