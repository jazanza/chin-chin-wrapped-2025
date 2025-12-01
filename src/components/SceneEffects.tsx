import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import React from "react";

export const SceneEffects = () => {
  const { gl, size } = useThree();
  return (
    <EffectComposer gl={gl} size={size}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.8}
        luminanceSmoothing={0.025}
        intensity={1.5}
      />
    </EffectComposer>
  );
};