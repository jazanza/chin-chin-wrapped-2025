import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines';
import * as THREE from 'three';

interface IntroFunStoryProps {
  totalVisits: number;
  isPaused: boolean;
  onStoryFinished: () => void;
  textColor: string;
  highlightColor: string;
}

export const IntroFunStory = ({ totalVisits, isPaused, onStoryFinished, textColor, highlightColor }: IntroFunStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const groupRef = useRef<THREE.Group>(null!);

  const introSegments: TextSegment[] = useMemo(() => [
    { text: "¡GRACIAS POR\nACOMPAÑARNOS\nESTE 2025!", color: textColor },
    { text: "\n\nPARA NOSOTROS,\nCADA VISITA TUYA\nES UN MOTIVO DE ALEGRÍA.", color: textColor },
    { text: `\n\nPOR LAS CERVEZAS\nQUE COMPARTIMOS,\nLOS NUEVOS AMIGOS\nQUE HICISTE,\nY POR ESOS ${totalVisits}\nDÍAS INOLVIDABLES\nCON NOSOTROS.`, color: highlightColor },
    { text: "\n\n(ESPERAMOS QUE NO HAYAS\nBORRADO CASSETTE... ¡O SÍ!)", color: textColor },
    { text: "\n\nGRACIAS POR ELEGIRNOS\nCOMO TU BARRA DE CERVEZAS\nFAVORITA.", color: textColor },
    { text: "\n\nAHORA, TE PRESENTAMOS\nTU CHIN CHIN 2025 WRAPPED.\n¡COMPÁRTELO EN REDES!", color: textColor }
  ], [totalVisits, textColor, highlightColor]);

  // Aumentar el tamaño de fuente base para mayor legibilidad
  const baseFontSize = Math.min(viewport.width * 0.15, 1.0) * responsiveScale; // Multiplicador aumentado de 0.06 a 0.15, max de 0.6 a 1.0
  const maxTextWidth = viewport.width * 0.8;

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      groupRef.current.rotation.z = Math.sin(time * 0.1) * 0.02;
      groupRef.current.position.x = Math.sin(time * 0.5) * 0.05 * responsiveScale;
      groupRef.current.position.y = Math.cos(time * 0.4) * 0.05 * responsiveScale;
    }
  });

  return (
    <group ref={groupRef}>
      <AnimatedBackgroundLines />
      <TypewriterText
        segments={introSegments}
        speed={75}
        onComplete={onStoryFinished}
        isPaused={isPaused}
        position={[0, 0, 0]}
        fontSize={baseFontSize}
        anchorX="center"
        anchorY="middle"
        maxWidth={maxTextWidth}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={700}
        lineHeight={1.2}
      />
    </group>
  );
};