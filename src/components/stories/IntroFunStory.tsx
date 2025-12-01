import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber'; // Import useFrame
import { TypewriterText } from '../TypewriterText';
import { AnimatedBackgroundLines } from './WelcomeStory'; // Reusing background lines from WelcomeStory
import * as THREE from 'three'; // Import THREE for Vector3

interface IntroFunStoryProps {
  totalVisits: number;
  isPaused: boolean;
  onStoryFinished: () => void; // New callback for when the story is fully displayed
}

const HIGHLIGHT_YELLOW = "#FFFF00"; // Define a bright yellow color

export const IntroFunStory = ({ totalVisits, isPaused, onStoryFinished }: IntroFunStoryProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  const [lineIndex, setLineIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const groupRef = useRef<THREE.Group>(null!); // Ref for the main group to apply effects

  const lines = useCallback(() => [
    { text: "¡GRACIAS POR ACOMPAÑARNOS ESTE 2025!", highlight: false },
    { text: "PARA NOSOTROS, CADA VISITA TUYA ES UN MOTIVO DE ALEGRÍA.", highlight: false },
    { text: "POR LAS CERVEZAS QUE COMPARTIMOS,", highlight: true }, // Highlight this line
    { text: "LOS NUEVOS AMIGOS QUE HICISTE,", highlight: true }, // Highlight this line
    { text: `Y POR ESOS ${totalVisits} DÍAS INOLVIDABLES CON NOSOTROS.`, highlight: true }, // Highlight this line
    { text: "(ESPERAMOS QUE NO HAYAS BORRADO CASSETTE... ¡O SÍ! 😜)", highlight: false },
    { text: "GRACIAS POR ELEGIRNOS COMO TU BARRA DE CERVEZAS FAVORITA.", highlight: false },
    { text: "AHORA, TE PRESENTAMOS TU CHIN CHIN 2025 WRAPPED. ¡COMPÁRTELO EN REDES!", highlight: false }
  ], [totalVisits]);

  useEffect(() => {
    setLineIndex(0); // Reset line index when component mounts or totalVisits changes
    // Clear any pending timeouts if the story is reset
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [totalVisits]);

  const handleLineComplete = useCallback(() => {
    if (lineIndex < lines().length - 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setLineIndex((prev) => prev + 1);
      }, 750); // Increased pause between lines
    } else {
      // This is the last line, call onStoryFinished after its pause
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onStoryFinished();
      }, 750); // Final pause before advancing to next story
    }
  }, [lineIndex, lines, onStoryFinished]);

  const baseFontSize = Math.min(viewport.width * 0.06, 0.6) * responsiveScale; // Increased base font size
  const lineHeightOffset = 0.7 * responsiveScale; // Increased vertical spacing between lines

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      // Subtle rotation on Z-axis
      groupRef.current.rotation.z = Math.sin(time * 0.1) * 0.02; // Max 2 degrees rotation
      // Subtle wiggle on X and Y position
      groupRef.current.position.x = Math.sin(time * 0.5) * 0.05 * responsiveScale;
      groupRef.current.position.y = Math.cos(time * 0.4) * 0.05 * responsiveScale;
    }
  });

  return (
    <group ref={groupRef}> {/* Apply ref to the main group */}
      <AnimatedBackgroundLines />
      {lines().map((line, index) => (
        <React.Fragment key={index}>
          {index <= lineIndex && (
            <TypewriterText
              text={line.text}
              speed={75} // Increased typewriter speed
              onComplete={index === lineIndex ? handleLineComplete : undefined}
              isPaused={isPaused || index < lineIndex} // Pause if overall story is paused, or if it's a previous line
              position={[0, 2.5 * responsiveScale - index * lineHeightOffset, 0]} // Adjusted starting position
              fontSize={baseFontSize}
              color={line.highlight ? HIGHLIGHT_YELLOW : "#FFFFFF"} // Apply highlight color
              anchorX="center"
              anchorY="middle"
              // Removed outlineWidth and outlineColor
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