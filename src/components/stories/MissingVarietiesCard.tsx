import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MissingVarietiesCardProps {
  missingVarieties: string[];
  textColor: string;
  highlightColor: string;
}

const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const MissingVarietiesCard = ({ missingVarieties, textColor, highlightColor }: MissingVarietiesCardProps) => {
  const missingCount = missingVarieties.length;

  const wittyTitle = useMemo(() => {
    if (missingCount === 0) return ""; // Should not render if 0, but for safety
    if (missingCount === 3) {
      const missingName = missingVarieties[0];
      return `¡SOLO TE QUEDA UNAS! ${missingName.toUpperCase()}. NO TIENES EXCUSAS.`;
    }
    // Assuming total varieties is around 100.
    // If missingCount > 50, it means more than half are missing.
    if (missingCount > 50) { 
      return `¡TOMAR MÁS CERVEZAS!`;
    }
    // Default for < 50% missing (or between 2 and 50)
    return `SOLO ${missingCount} CERVEZAS PARA CONVERTIRTE EN LEYENDA.`;
  }, [missingCount, missingVarieties]);

  const randomSuggestions = useMemo(() => {
    if (missingCount === 0) return [];
    const shuffled = shuffleArray(missingVarieties);
    return shuffled.slice(0, Math.min(3, missingCount)); // Get up to 3 random suggestions
  }, [missingVarieties, missingCount]);

  if (missingCount === 0) {
    return null; // Don't render if no missing varieties
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div className={cn("flex flex-col items-center justify-center p-4 max-w-xs md:max-w-md tracking-tight font-black leading-tight mb-8", textColor)}> {/* Ajustado max-w */}
        <p className={cn("text-3xl md:text-4xl text-center", highlightColor)}> {/* H2, ajustado */}
          TU MISIÓN DEL 2026:
        </p>
        <p className={cn("text-5xl md:text-6xl text-center mt-4", textColor)}> {/* H1, ajustado */}
          {wittyTitle}
        </p>
      </div>

      {randomSuggestions.length > 0 && (
        <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black")}>
          <p className={cn("text-lg md:text-xl font-bold mb-2 text-center", highlightColor)}> {/* H4, ajustado */}
            DEBERÍAS PROBAR:
          </p>
          {randomSuggestions.map((beerName, idx) => (
            <p key={idx} className={cn("text-sm md:text-base text-center", textColor)}> {/* H4, ajustado */}
              {beerName.toUpperCase()}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};