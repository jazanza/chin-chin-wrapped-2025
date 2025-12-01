import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import "./LiquidMaterial";

interface RankedBeer {
  name: string;
  liters: number;
  color: string;
}

const DataBubble = ({ beer, liquidHeight, viewportWidth, maxLiters, index }: {
  beer: RankedBeer;
  liquidHeight: number;
  viewportWidth: number;
  maxLiters: number;
  index: number;
}) => {
  const ref = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const bottomY = -viewport.height / 2;

  const size = useMemo(() => {
    if (maxLiters === 0) return 0.2;
    return 0.2 + (beer.liters / maxLiters) * (0.6 - 0.2);
  }, [beer.liters, maxLiters]);

  const [initialPosition] = useState(() => new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(viewportWidth * 0.8),
    bottomY + THREE.MathUtils.randFloat(0, liquidHeight > 1 ? liquidHeight * 0.5 : 0.5),
    THREE.MathUtils.randFloatSpread(0.5)
  ));

  useFrame(({ clock }) => {
    if (ref.current && liquidHeight > 0) {
      ref.current.position.y += 0.008;
      const time = clock.getElapsedTime();
      ref.current.position.x = initialPosition.x + Math.sin(time * 0.4 + initialPosition.x) * 0.3;

      const topOfLiquid = bottomY + liquidHeight;
      if (ref.current.position.y > topOfLiquid + 1) {
        ref.current.position.y = bottomY - 1;
        ref.current.position.x = THREE.MathUtils.randFloatSpread(viewportWidth * 0.8);
      }
    }
  });

  const geometryType = index % 3;

  return (
    <mesh ref={ref} position={initialPosition} scale={[size, size, size]}>
      {geometryType === 0 && <icosahedronGeometry args={[1, 0]} />}
      {geometryType === 1 && <torusGeometry args={[0.8, 0.3, 16, 100]} />}
      {geometryType === 2 && <boxGeometry args={[1.2, 1.2, 1.2]} />}
      
      <meshStandardMaterial
        color={beer.color}
        transparent
        opacity={0.85}
        emissive={beer.color}
        emissiveIntensity={0.6 + size * 0.5}
        roughness={0.2}
        metalness={0.1}
      />
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {beer.name}
      </Text>
    </mesh>
  );
};

function AestheticBubbles({ liquidHeight, viewportWidth }: { liquidHeight: number; viewportWidth: number }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { viewport } = useThree();
  const bottomY = -viewport.height / 2;

  const count = Math.min(Math.floor(liquidHeight * 150), 3000);

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
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
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
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function BeerVisualizer({ liters, rankedBeers, ...props }: { liters: number; rankedBeers: RankedBeer[] } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const liquidRef = useRef<THREE.Mesh>(null!);
  const liquidMaterialRef = useRef<any>(null!);
  const textRef = useRef<any>(null!);
  const animatedHeight = useRef(0);

  const MAX_LITERS_FOR_SCALE = 1000;
  const targetHeight = (liters / MAX_LITERS_FOR_SCALE) * (viewport.height * 0.8);
  const bottomY = -viewport.height / 2;

  useFrame(({ clock }) => {
    animatedHeight.current = THREE.MathUtils.lerp(animatedHeight.current, targetHeight, 0.05);
    
    if (liquidRef.current) {
      liquidRef.current.scale.y = animatedHeight.current;
      liquidRef.current.position.y = bottomY + (animatedHeight.current / 2);
    }

    if (liquidMaterialRef.current) {
      liquidMaterialRef.current.uTime = clock.getElapsedTime();
    }

    if (textRef.current) {
      const topOfLiquid = bottomY + animatedHeight.current;
      textRef.current.position.y = topOfLiquid + 0.3;
    }
  });
  
  useEffect(() => {
    if (liters === 0) {
      animatedHeight.current = 0;
    }
  }, [liters]);

  const maxLitersForBubbles = useMemo(() => {
    return rankedBeers.length > 0 ? Math.max(...rankedBeers.map(b => b.liters)) : 1;
  }, [rankedBeers]);

  return (
    <group {...props}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      <mesh ref={liquidRef} position={[0, bottomY, 0]} scale-y={0}>
        <planeGeometry args={[viewport.width, 1, 64, 64]} />
        <liquidMaterial ref={liquidMaterialRef} transparent />
      </mesh>

      <AestheticBubbles liquidHeight={animatedHeight.current} viewportWidth={viewport.width} />

      {animatedHeight.current > 0.1 && rankedBeers.map((beer, index) => (
        <DataBubble
          key={beer.name}
          beer={beer}
          liquidHeight={animatedHeight.current}
          viewportWidth={viewport.width}
          maxLiters={maxLitersForBubbles}
          index={index}
        />
      ))}

      <Text
        ref={textRef}
        position={[0, bottomY + 0.3, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`${liters.toFixed(2)} L`}
      </Text>
    </group>
  );
}