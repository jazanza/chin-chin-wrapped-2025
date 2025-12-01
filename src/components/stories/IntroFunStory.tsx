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
    { text: "¡GRACIAS POR", color: textColor },
    { text: "\nACOMPAÑARNOS", color: textColor },
    { text: "\nESTE ", color: textColor },
    { text: "2025!", color: highlightColor },
    
    { text: "\n\nPARA NOSOTROS,", color: textColor },
    { text: "\nCADA VISITA TUYA", color: textColor },
    { text: "\nES UN MOTIVO DE ALEGRÍA.", color: textColor },
    
    { text: "\n\nPOR LAS CERVEZAS", color: highlightColor },
    { text: "\nQUE COMPARTIMOS,", color: highlightColor },
    { text: "\nLOS NUEVOS AMIGOS", color: highlightColor },
    { text: "\nQUE HICISTE,", color: highlightColor },
    { text: `\nY POR ESOS ${totalVisits}`, color: highlightColor },
    { text: "\nDÍAS INOLVIDABLES", color: highlightColor },
    { text: "\nCON NOSOTROS.", color: highlightColor },
    
    { text: "\n\n(ESPERAMOS QUE NO HAYAS", color: textColor },
    { text: "\nBORRADO CASSETTE...", color: textColor },
    { text: "\n¡O SÍ! 😜)", color: textColor },
    
    { text: "\n\nGRACIAS POR ELEGIRNOS", color: textColor },
    { text: "\nCOMO TU BARRA DE CERVEZAS", color: textColor },
    { text: "\nFAVORITA.", color: textColor },
    
    { text: "\n\nAHORA, TE PRESENTAMOS", color: textColor },
    { text: "\nTU CHIN CHIN 2025 WRAPPED.", color: highlightColor },
    { text: "\n¡COMPÁRTELO EN REDES!", color: textColor }
  ], [totalVisits, textColor, highlightColor]);

  // Maximize font size while respecting screen width
  const baseFontSize = Math.min(viewport.width * 0.06, 0.6) * responsiveScale;
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
        position={[0, 0, 0]} // Centered
        fontSize={baseFontSize}
        anchorX="center"
        anchorY="middle"
        maxWidth={maxTextWidth} // Use max width for wrapping
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={700}
        lineHeight={1.2}
      />
    </group>
  );
};