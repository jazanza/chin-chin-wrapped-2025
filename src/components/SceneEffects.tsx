import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import React from "react";

export const SceneEffects = () => {
  const { gl, size } = useThree();

  // Usamos un tamaño de fallback si size no está listo, aunque la verificación de gl debería ser suficiente.
  const width = size?.width || 800;
  const height = size?.height || 600;
  const dpr = gl?.getPixelRatio() || 1;

  // Si el contexto GL no está disponible, no renderizamos.
  if (!gl) {
    return null;
  }

  return (
    <EffectComposer dpr={dpr} width={width} height={height} skipRender>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.025}
        intensity={1.5}
      />
    </EffectComposer>
  );
};