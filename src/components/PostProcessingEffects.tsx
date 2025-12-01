import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing"; // Removed Bloom
import { useMemo } from "react";

export const PostProcessingEffects = () => {
  const { size } = useThree();

  if (size.width === 0 || size.height === 0) {
    return null;
  }

  const key = useMemo(() => `${size.width}-${size.height}`, [size]);

  return (
    <EffectComposer key={key}>
      {/* Bloom effect removed for flat aesthetic */}
    </EffectComposer>
  );
};