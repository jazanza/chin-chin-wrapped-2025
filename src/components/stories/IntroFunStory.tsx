import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText'; // Import TextSegment
import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // Updated import path
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

  const [lineIndex, setLineIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const groupRef = useRef<THREE.Group>(null!);

  const lines = useCallback(() => [
    { text: "¡GRACIAS POR ACOMPAÑARNOS ESTE 2025!", highlight: false },
    { text: "PARA NOSOTROS, CADA VISITA TUYA ES UN MOTIVO DE ALEGRÍA.", highlight: false },
    { text: "POR LAS CERVEZAS QUE COMPARTIMOS,", highlight: true },
    { text: "LOS NUEVOS AMIGOS QUE HICISTE,", highlight: true },
    { text: `Y POR ESOS ${totalVisits} DÍAS INOLVIDABLES CON NOSOTROS.`, highlight: true },
    { text: "(ESPERAMOS QUE NO HAYAS BORRADO CASSETTE... ¡O SÍ! 😜)", highlight: false },
    { text: "GRACIAS POR ELEGIRNOS COMO TU BARRA DE CERVEZAS FAVORITA.", highlight: false },
    { text: "AHORA, TE PRESENTAMOS TU CHIN CHIN 2025 WRAPPED. ¡COMPÁRTELO EN REDES!", highlight: false }
  ], [totalVisits]);

  useEffect(() => {
    setLineIndex(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [totalVisits]);

  const handleLineComplete = useCallback(() => {
    if (lineIndex < lines().length - 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setLineIndex((prev) => prev + 1);
      }, 750);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onStoryFinished();
      }, 750);
    }
  }, [lineIndex, lines, onStoryFinished]);

  const baseFontSize = Math.min(viewport.width * 0.06, 0.6) * responsiveScale;
  const lineHeightOffset = 0.7 * responsiveScale;

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
      {lines().map((line, index) => {
        const segments: TextSegment[] = [{ text: line.text, color: line.highlight ? highlightColor : textColor }];
        return (
          <React.Fragment key={index}>
            {index <= lineIndex && (
              <TypewriterText
                segments={segments}
                speed={75}
                onComplete={index === lineIndex ? handleLineComplete : undefined}
                isPaused={isPaused || index < lineIndex}
                position={[0, 2.5 * responsiveScale - index * lineHeightOffset, 0]}
                fontSize={baseFontSize}
                anchorX="center"
                anchorY="middle"
                maxWidth={viewport.width * 0.8}
                textAlign="center"
                letterSpacing={-0.05}
                fontWeight={700}
              />
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
};