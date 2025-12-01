import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CameraAnimator } from "./CameraAnimator";

type ViewMode = "meter" | "ranking" | "balance" | "loyalty" | "spectrum";

export function ResponsiveCamera({ viewMode }: { viewMode: ViewMode }) {
  const { camera, viewport } = useThree();

  useEffect(() => {
    // Ajusta la posición Z de la cámara para mantener una escala visual consistente.
    // Si el aspecto es menor a 1 (pantalla vertical), la cámara se aleja más.
    const baseZ = 7; // Posición Z original
    // Calcula un factor de ajuste: si el aspecto es 0.5 (vertical), el factor es 2.
    const aspectFactor = viewport.aspect < 1 ? (1 / viewport.aspect) : 1;
    // Multiplica la posición Z base por el factor, con un mínimo de 1 para no acercarse demasiado.
    // El 0.8 es un multiplicador para ajustar la sensibilidad del alejamiento.
    camera.position.z = baseZ * Math.max(1, aspectFactor * 0.8);
    camera.updateProjectionMatrix();
  }, [viewport.aspect, camera]);

  return <CameraAnimator viewMode={viewMode} />;
}