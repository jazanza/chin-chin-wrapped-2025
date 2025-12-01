import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import "./LiquidMaterial"; // Importar el material para que se registre

function Bubbles({ liquidHeight, viewportWidth }: { liquidHeight: number; viewportWidth: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { viewport } = useThree();
  const bottomY = -viewport.height / 2;

  const count = Math.min(Math.floor(liquidHeight * 200), 5000);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(viewportWidth);
      const y = THREE.MathUtils.randFloat(bottomY, bottomY + liquidHeight);
      const z = THREE.MathUtils.randFloatSpread(1);
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count, liquidHeight, viewportWidth, bottomY]);

  useFrame(() => {
    if (!pointsRef.current || liquidHeight === 0) return;
    const positions = pointsRef.current.geometry.attributes.position.array;
    const topY = bottomY + liquidHeight;

    for (let i = 1; i < positions.length; i += 3) {
      positions[i] += 0.01;
      if (positions[i] > topY) {
        positions[i] = bottomY;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (liquidHeight === 0) return null;

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
        size={0.03}
        color="#FFFFFF"
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BeerVisualizer({ liters }: { liters: number }) {
  const { viewport } = useThree();
  const liquidRef = useRef<THREE.Mesh>(null!);
  const liquidMaterialRef = useRef<any>(null!);
  const textRef = useRef<any>(null!);
  const animatedHeight = useRef(0);

  const MAX_LITERS_FOR_SCALE = 1000;
  const targetHeight = (liters / MAX_LITERS_FOR_SCALE) * (viewport.height * 0.8);

  useFrame(({ clock }) => {
    animatedHeight.current = THREE.MathUtils.lerp(animatedHeight.current, targetHeight, 0.05);
    
    if (liquidRef.current) {
      liquidRef.current.scale.y = animatedHeight.current;
    }

    if (liquidMaterialRef.current) {
      // Actualizar el tiempo en el shader para animar las olas
      liquidMaterialRef.current.uTime = clock.getElapsedTime();
    }

    if (textRef.current) {
      const topOfLiquid = -viewport.height / 2 + animatedHeight.current;
      textRef.current.position.y = topOfLiquid + 0.3;
    }
  });
  
  useEffect(() => {
    if (liters === 0) {
      animatedHeight.current = 0;
    }
  }, [liters]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      <mesh ref={liquidRef} position={[0, -viewport.height / 2, 0]} scale-y={0}>
        {/* Aumentamos los segmentos para que las olas se vean suaves */}
        <planeGeometry args={[viewport.width, 1, 64, 64]} />
        <liquidMaterial ref={liquidMaterialRef} transparent />
      </mesh>

      <Bubbles liquidHeight={animatedHeight.current} viewportWidth={viewport.width} />

      <Text
        ref={textRef}
        position={[0, -viewport.height / 2 + 0.3, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`${liters.toFixed(2)} L`}
      </Text>
    </>
  );
}