"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface BubbleBackgroundProps {
  backgroundColor: string; // e.g., "bg-black", "bg-white"
  bubbleColorClass: string; // NEW: e.g., "bg-black", "bg-white"
}

const BubbleBackground = ({ backgroundColor, bubbleColorClass }: BubbleBackgroundProps) => {
  // La lógica para determinar bubbleColorClass ahora se maneja en WrappedDashboard.tsx
  // y se pasa directamente como prop.

  const bubbles = useMemo(() => {
    const numBubbles = 30; // 20-30 elementos
    const generatedBubbles = [];

    for (let i = 0; i < numBubbles; i++) {
      // Tamaño aleatorio entre 25px y 75px, luego reducido en un 15%
      const minSize = 25 * 0.85; // ~21.25px
      const maxSize = 75 * 0.85; // ~63.75px
      const size = Math.random() * (maxSize - minSize) + minSize; 
      
      const left = Math.random() * 100; // Posición horizontal aleatoria (0% a 100%)
      const duration = Math.random() * (18 - 10) + 10; // Duración de animación aleatoria (10s a 18s)
      const delay = Math.random() * (10 - 0) + 0; // Retardo de inicio aleatorio (0s a 10s)
      const opacity = Math.random() * (0.3 - 0.1) + 0.1; // Opacidad aleatoria (0.1 a 0.3)

      generatedBubbles.push(
        <div
          key={i}
          className={cn(
            "absolute rounded-full pointer-events-none",
            bubbleColorClass // Usar la prop directamente
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
  }, [bubbleColorClass]); // Regenerar burbujas si el color de la burbuja cambia

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles}
    </div>
  );
};

export default BubbleBackground;