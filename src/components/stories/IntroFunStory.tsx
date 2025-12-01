import React, { useState, useEffect, useCallback } from 'react';
import { Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText';
import { AnimatedBackgroundLines } from './WelcomeStory'; // Reusing background lines from WelcomeStory

interface IntroFunStoryProps {
  totalVisits: number;
  isPaused: boolean;
}

export const IntroFunStory = ({ totalVisits, isPaused }: IntroFunStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [lineIndex, setLineIndex] = useState(0);

  const lines = useCallback(() => [
    "¡GRACIAS POR ACOMPAÑARNOS ESTE 2025!",
    "PARA NOSOTROS, CADA VISITA TUYA ES UN MOTIVO DE ALEGRÍA.",
    "POR LAS CERVEZAS QUE COMPARTIMOS,",
    "LOS NUEVOS AMIGOS QUE HICISTE,",
    `Y POR ESOS ${totalVisits} DÍAS INOLVIDABLES CON NOSOTROS.`,
    "(ESPERAMOS QUE NO HAYAS BORRADO CASSETTE... ¡O SÍ! 😜)",
    "GRACIAS POR ELEGIRNOS COMO TU BARRA DE CERVEZAS FAVORITA.",
    "AHORA, TE PRESENTAMOS TU CHIN CHIN 2025 WRAPPED. ¡COMPÁRTELO EN REDES!"
  ], [totalVisits]);

  useEffect(() => {
    setLineIndex(0); // Reset line index when component mounts or totalVisits changes
  }, [totalVisits]);

  const handleLineComplete = useCallback(() => {
    if (lineIndex < lines().length - 1) {
      setTimeout(() => {
        setLineIndex((prev) => prev + 1);
      }, 750); // Increased pause between lines
    }
  }, [lineIndex, lines]);

  const baseFontSize = Math.min(viewport.width * 0.04, 0.3) * responsiveScale;
  const lineHeightOffset = 0.5 * responsiveScale; // Vertical spacing between lines

  return (
    <group>
      <AnimatedBackgroundLines />
      {lines().map((line, index) => (
        <React.Fragment key={index}>
          {index <= lineIndex && (
            <TypewriterText
              text={line}
              speed={75} // Increased typewriter speed
              onComplete={index === lineIndex ? handleLineComplete : undefined}
              isPaused={isPaused || index < lineIndex} // Pause if overall story is paused, or if it's a previous line
              position={[0, 2 * responsiveScale - index * lineHeightOffset, 0]}
              fontSize={baseFontSize}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02 * responsiveScale}
              outlineColor="#000000"
              maxWidth={viewport.width * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            />
          )}
        </React.Fragment>
      ))}
    </group>
  );
};