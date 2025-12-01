import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo } from "react";

export const SceneEffects = () => {
  const { gl, size } = useThree();

  // Siguiendo el diagnóstico del usuario: esta es la guardia crucial.
  // No renderizamos el EffectComposer hasta que el contexto WebGL (gl) y
  // un tamaño de lienzo válido (width > 0, height > 0) estén disponibles.
  // Esto previene el intento de crear buffers de renderizado con tamaño 0x0, que es la causa del error.
  if (!gl || size.width === 0 || size.height === 0) {
    return null;
  }

  // Usamos una 'key' única basada en el tamaño. Esto fuerza a React a crear una
  // nueva instancia del EffectComposer si el tamaño del lienzo cambia,
  // asegurando que los buffers internos se re-inicialicen correctamente.
  // Es una práctica robusta para la estabilidad en R3F.
  const key = useMemo(() => `${size.width}-${size.height}`, [size]);

  return (
    <EffectComposer key={key}>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.025}
        intensity={1.5}
      />
    </EffectComposer>
  );
};