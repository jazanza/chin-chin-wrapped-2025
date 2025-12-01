import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 100000;
const CYLINDER_RADIUS = 5.0;
const MAX_LITERS_FOR_SCALE = 1000;

export function BeerVisualizer({ liters, visible, ...props }: { liters: number; visible: boolean } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null!);
  const textGroupRef = useRef<THREE.Group>(null!);
  const numberTextRef = useRef<any>(null!);
  const animatedLiters = useRef(0);

  const maxHeight = viewport.height * 1.2;
  const bottomY = -maxHeight / 2;

  const [positions, initialColors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const color = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = bottomY + (i / PARTICLE_COUNT) * maxHeight;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * CYLINDER_RADIUS;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      color.setHSL((y - bottomY) / maxHeight, 1.0, 0.5);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [maxHeight, bottomY]);

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.beginPath();
      context.arc(64, 64, 60, 0, 2 * Math.PI);
      context.fillStyle = 'white';
      context.fill();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => {
    if (visible) {
      animatedLiters.current = 0;
    }
  }, [visible, liters]);

  useFrame(({ clock }) => {
    if (!visible || !pointsRef.current) return;

    animatedLiters.current = THREE.MathUtils.lerp(animatedLiters.current, liters, 0.0085); // 15% más lento
    const targetParticleCount = Math.floor((animatedLiters.current / MAX_LITERS_FOR_SCALE) * PARTICLE_COUNT);

    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    geometry.setDrawRange(0, targetParticleCount);

    const time = clock.getElapsedTime() * 0.425; // 15% más lento
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const colors = geometry.attributes.color as THREE.BufferAttribute;
    const color = new THREE.Color();

    for (let i = 0; i < targetParticleCount; i++) {
      const y = positions[i * 3 + 1];
      const waveX = Math.sin(y * 2 + time) * 0.2;
      const waveZ = Math.cos(y * 2 + time) * 0.2;
      const waveY = Math.sin(positions[i * 3] * 0.5 + time) * 0.1;
      posAttr.setXYZ(i, positions[i * 3] + waveX, y + waveY, positions[i * 3 + 2] + waveZ);
      const hue = (time * 0.1 + (y - bottomY) / maxHeight * 0.1) % 1;
      color.setHSL(hue, 1.0, 0.5);
      colors.setXYZ(i, color.r, color.g, color.b);
    }
    posAttr.needsUpdate = true;
    colors.needsUpdate = true;

    if (textGroupRef.current && numberTextRef.current) {
      const topOfLiquid = bottomY + (targetParticleCount / PARTICLE_COUNT) * maxHeight;
      textGroupRef.current.position.y = topOfLiquid + 2.5;
      numberTextRef.current.text = `${animatedLiters.current.toFixed(0)}`;
    }
  });

  return (
    <group {...props} visible={visible}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={initialColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={15.0}
          sizeAttenuation={false}
          vertexColors={true}
          transparent={true}
          opacity={0.7}
          map={circleTexture}
          alphaTest={0.5}
        />
      </points>

      <group ref={textGroupRef} position={[0, bottomY + 0.3, 0]}>
        <Text
          ref={numberTextRef}
          position={[0, 0, 0]}
          fontSize={2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/inter/v12/Uu9eNuAP25E6QpS9g5Y.woff"
        >
          {`0`}
        </Text>
        <Text
          position={[0, -1.2, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/inter/v12/Uu9eNuAP25E6QpS9g5Y.woff"
        >
          Litros
        </Text>
      </group>
    </group>
  );
}