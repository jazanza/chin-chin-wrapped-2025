import { useThree, extend } from "@react-three/fiber";
import { EffectComposer, Bloom, RGBShift } from "@react-three/postprocessing";
import { RenderPass } from "three-stdlib";
import { useMemo } from "react";
import * as THREE from 'three';

extend({ RenderPass });

export const SceneEffects = () => {
  const { gl, scene, camera, size } = useThree();

  if (!gl || !scene || !camera || size.width === 0 || size.height === 0) {
    return null;
  }

  const key = useMemo(() => `${size.width}-${size.height}`, [size]);

  return (
    <EffectComposer key={key}>
      <renderPass attach="passes" args={[scene, camera]} />
      <Bloom
        mipmapBlur
        luminanceThreshold={0.1} // Lower threshold to make more things bloom
        luminanceSmoothing={0.025}
        intensity={2.0} // Higher intensity
      />
      <RGBShift
        offset={new THREE.Vector2(0.001, 0.001)} // Subtle shift
      />
    </EffectComposer>
  );
};