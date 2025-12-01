import { EffectComposer, Bloom } from "@react-three/postprocessing";

export const SceneEffects = () => {
  // La solución definitiva es la simplicidad.
  // Renderizamos el EffectComposer y sus hijos de forma incondicional.
  // La librería está diseñada para manejar su propia inicialización y cambios de tamaño.
  // Toda la lógica anterior para "prevenir" errores era, irónicamente, la causa de los mismos.
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.025}
        intensity={1.5}
      />
    </EffectComposer>
  );
};