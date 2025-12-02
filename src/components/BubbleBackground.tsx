"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface BubbleBackgroundProps {
  backgroundColor: string; // e.g., "bg-black", "bg-white"
}

const BubbleBackground = ({ backgroundColor }: BubbleBackgroundProps) => {
  const bubbleColorClass = useMemo(() => {
    // Determinar el color de la burbuja basado en el color de fondo
    if (backgroundColor.includes("bg-black")) {
      return "bg-white";
    } else if (backgroundColor.includes("bg-white")) {
      return "bg-black";
    }
    return "bg-white"; // Color por defecto si no coincide
  }, [backgroundColor]);

  const bubbles = useMemo(() => {
    const numBubbles = 30; // 20-30 elementos
    const generatedBubbles = [];

    for (let i = 0; i < numBubbles; i++) {
      const size = Math.random() * (75 - 25) + 25; // Tamaño aleatorio entre 25px y 75px
      const left = Math.random() * 100; // Posición horizontal aleatoria (0% a 100%)
      const duration = Math.random() * (18 - 10) + 10; // Duración de animación aleatoria (10s a 18s)
      const delay = Math.random() * (10 - 0) + 0; // Retardo de inicio aleatorio (0s a 10s)
      const opacity = Math.random() * (0.3 - 0.1) + 0.1; // Opacidad aleatoria (0.1 a 0.3)

      generatedBubbles.push(
        <div
          key={i}
          className={cn(
            "absolute rounded-full pointer-events-none",
            bubbleColorClass
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}vw`, // Usar vw para posicionamiento horizontal
            bottom: `-${size}px`, // Empezar desde debajo de la pantalla
            opacity: opacity,
            filter: `blur(1px)`, // Mantener blur
            animation: `bubble-up ${duration}s infinite ease-in-out ${delay}s`,
            zIndex: 1, // Detrás del contenido de la historia y el overlay
          }}
        />
      );
    }
    return generatedBubbles;
  }, [bubbleColorClass]); // Regenerar burbujas si el color de fondo cambia

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles}
    </div>
  );
};

export default BubbleBackground;