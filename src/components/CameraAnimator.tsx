import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo } from "react"; // Ensure useMemo is imported

type ViewMode = "meter" | "ranking" | "balance" | "loyalty" | "spectrum" | "wrapped"; // Add 'wrapped'

const CAMERA_PRESETS: { [key in ViewMode]: { position: THREE.Vector3; lookAt: THREE.Vector3 } } = {
  meter: {
    position: new THREE.Vector3(0, 0, 8),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  ranking: {
    position: new THREE.Vector3(0, 2, 10),
    lookAt: new THREE.Vector3(0, 1, 0),
  },
  balance: {
    position: new THREE.Vector3(5, 1, 0),
    lookAt: new THREE.Vector3(0, 1, 0),
  },
  loyalty: {
    position: new THREE.Vector3(0, 3, 8),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  spectrum: {
    position: new THREE.Vector3(0, 0, 5),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  wrapped: { // New preset for the WrappedDashboard
    position: new THREE.Vector3(0, 0, 8), // Adjusted for a good overview of all three components
    lookAt: new THREE.Vector3(0, -0.5, 0),
  },
};

export function CameraAnimator({ viewMode }: { viewMode: ViewMode }) {
  const { camera } = useThree();
  const currentLookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const preset = CAMERA_PRESETS[viewMode];
    const targetPosition = preset.position.clone();
    const targetLookAt = preset.lookAt.clone();

    if (viewMode === 'loyalty') {
      const time = clock.getElapsedTime() * 0.08;
      targetPosition.x = 8 * Math.cos(time);
      targetPosition.z = 8 * Math.sin(time);
      targetPosition.y = 3 + Math.sin(time * 0.5);
    }

    // Decreased lerp factor for smoother transitions
    camera.position.lerp(targetPosition, 0.05);

    // Lerp lookAt as well for a slightly less jarring rotation change
    currentLookAt.lerp(targetLookAt, 0.05);
    camera.lookAt(currentLookAt);
  });

  return null;
}