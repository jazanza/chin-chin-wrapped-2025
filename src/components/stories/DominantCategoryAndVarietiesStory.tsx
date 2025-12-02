import React, { useMemo } from 'react';
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface DominantCategoryAndVarietiesStoryProps {
  dominantBeerCategory: string;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

// Definir esta función fuera del componente:
const getVarietyComment = (uniqueCount: number, totalCount: number): string => {
  if (totalCount === 0) return "¡El universo cervecero te espera!";

  const percentage = (uniqueCount / totalCount) * 100;

  if (percentage === 100) {
    return "¡LO LOGRASTE! Ahora ya puedes seguir bebiendo en paz.";
  }
  if (percentage >= 76) {
    return "Tu currículum cervecero es envidiable. Eres una amenaza para los de la barra.";
  }
  if (percentage >= 51) {
    return "Ya casi no tenemos secretos para ti. ¡Felicidades!";
  }
  if (percentage >= 31) {
    return "Mitad de camino al nirvana cervecero. ¡Sigue así!";
  }
  if (percentage >= 11) {
    return "Parece que aún no te convencemos de probar algo diferente. ¿Qué esperas?";
  }
  // 0% - 10%
  return "Estás en el kinder garden de las cervezas. Hay que animarse a experimentar";
};

export const DominantCategoryAndVarietiesStory = ({
  dominantBeerCategory,
  uniqueVarieties2025,
  totalVarietiesInDb,
  textColor,
  highlightColor,
}: DominantCategoryAndVarietiesStoryProps) => {
  
  // 1. Obtener la frase dinámica:
  const dynamicComment = getVarietyComment(uniqueVarieties2025, totalVarietiesInDb);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "ESTÁS ENVICIADO CON LAS...", color: textColor },
    { text: `\n${dominantBeerCategory.toUpperCase()}`, color: highlightColor },
    { text: "\n\nY PROBASTE ", color: textColor },
    { text: `${uniqueVarieties2025}`, color: highlightColor },
    { text: " VARIEDADES ÚNICAS. \n(DE ", color: textColor },
    { text: `${totalVarietiesInDb}`, color: highlightColor },
    // 2. Insertar la frase dinámica aquí:
    { text: ` DISPONIBLES. ${dynamicComment}).`, color: textColor }, 
  ], [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb, textColor, highlightColor, dynamicComment]); 

  const renderedText = useMemo(() => {
    return storySegments.flatMap((segment, segmentIndex) => {
      const lines = segment.text.split('\n');
      return lines.flatMap((line, lineIndex) => {
        const elements: React.ReactNode[] = [
          <span key={`${segmentIndex}-${lineIndex}-span`} className={`${segment.color}`}>
            {line}
          </span>
        ];
        if (lineIndex < lines.length - 1) {
          elements.push(<br key={`${segmentIndex}-${lineIndex}-br`} />);
        }
        return elements;
      });
    });
  }, [storySegments]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-2xl tracking-tight font-black leading-tight`}
      >
        <p className={`text-[min(6vw,2.5rem)] md:text-[min(4.5vw,2rem)] lg:text-[min(3.5vw,1.8rem)] text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};