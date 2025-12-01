import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// Partículas reducidas para mejor rendimiento y estética de burbujas grandes.
const PARTICLE_COUNT = 25000;
// Mantener constantes rígidas por preferencia del usuario, pero se recomienda calcularlas dinámicamente.
const CYLINDER_RADIUS = 3.0;
const MAX_LITERS_FOR_SCALE = 500;

export function BeerVisualizer({ liters, visible, ...props }: { liters: number; visible: boolean } & JSX.IntrinsicElements['group']) {
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null!);
  const textRef = useRef<any>(null!);
  const animatedLiters = useRef(0);

  // La altura máxima está basada en el viewport para ocupar gran parte de la pantalla.
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
      
      // Coordenadas cilíndricas: X, Y (altura), Z
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // Color inicial (degradado arcoíris/HSL)
      color.setHSL((y - bottomY) / maxHeight, 1.0, 0.5);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [maxHeight, bottomY]);

  useEffect(() => {
    if (visible) {
      // Reiniciar la animación al inicio
      animatedLiters.current = 0;
    }
  }, [visible, liters]);

  useFrame(({ clock }) => {
    if (!visible || !pointsRef.current) return;

    // 2. Animación de llenado más lenta (duración de 20+ segundos)
    // Reducido de 0.05 a 0.01 para un llenado muy gradual.
    animatedLiters.current = THREE.MathUtils.lerp(animatedLiters.current, liters, 0.01); 
    const targetParticleCount = Math.floor((animatedLiters.current / MAX_LITERS_FOR_SCALE) * PARTICLE_COUNT);

    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    geometry