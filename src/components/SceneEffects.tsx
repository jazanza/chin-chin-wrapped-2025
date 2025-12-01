import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import React from "react";

export const SceneEffects = () => {
  const { gl, size } = useThree();

  // No renderizar EffectComposer si gl o size no están definidos o si las dimensiones son cero.
  if (!gl || !size || size.width === 0 || size.height === 0) {
    return null;
  }

  return (
    <EffectComposer gl={gl} size={size} skipRender> {/* Añadido skipRender */}
      <Bloom
        mipmapBlur
        luminanceThreshold={1} // Ajustado a 1 como se sugirió
        luminanceSmoothing={0.025}
        intensity={1.5}
      />
    </EffectComposer>
  );
};