import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export function CameraAnimator() {
  const { camera } = useThree();
  const radius = 7; // Distancia de la cámara al centro

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 0.08; // Velocidad de la órbita

    // Mover la cámara en un círculo lento y elegante
    camera.position.x = radius * Math.cos(time);
    camera.position.z = radius * Math.sin(time);
    
    // Añadir un suave movimiento vertical
    camera.position.y = 2 + Math.sin(time * 0.5) * 1.5;

    // Mantener la cámara siempre enfocada en el centro de la escena
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  });

  return null; // Este componente no renderiza nada, solo controla la cámara
}