import { useThree } from "@react-three/fiber";
import { useEffect } from "react"; // useEffect is used here
import { CameraAnimator } from "./CameraAnimator"; // Correctly import CameraAnimator

type ViewMode = "meter" | "ranking" | "balance" | "loyalty" | "spectrum" | "wrapped"; // Define ViewMode here for clarity, or import from CameraAnimator if preferred

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