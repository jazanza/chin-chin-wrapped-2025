import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CameraAnimator, ViewMode } from "./CameraAnimator"; // Import ViewMode from CameraAnimator

export function ResponsiveCamera({ viewMode }: { viewMode: ViewMode }) {
  const { camera, viewport } = useThree();

  useEffect(() => {
    const baseZ = 7;
    const aspectFactor = viewport.aspect < 1 ? (1 / viewport.aspect) : 1;
    camera.position.z = baseZ * Math.max(1, aspectFactor * 0.8);
    camera.updateProjectionMatrix();
  }, [viewport.aspect, camera]);

  return <CameraAnimator viewMode={viewMode} />;
}