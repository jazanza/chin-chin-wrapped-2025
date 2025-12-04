import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Añadido para control explícito del tamaño
}

interface DominantCategoryAndVarietiesStoryProps {
  dominantBeerCategory: string;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

// Definir esta función fuera del componente:
const getVarietyComment = (uniqueCount: number, totalCount: number): string => {
  if (totalCount === 0) return "¡Un universo de cervezas te espera!";

  const percentage = (uniqueCount / totalCount) * 100;

  if (percentage === 100) {
    return "¡LO LOGRASTE! Ya puedes seguir bebiendo sin presión.";
  }
  if (percentage >= 75) {
    return "¡Tu currículum cervecero es envidiable!";
  }
  if (percentage >= 50) {
    return "Ya casi no tenemos secretos para ti, ¡Felicidades!";
  }
  if (percentage >= 30) {
    return "Mitad de camino al nirvana cervecero, ¡sigue así!";
  }
  if (percentage >= 11) {
    return "¿Qué esperas para probar algo diferente?";
  }
  // 0% - 10%
  return "Estás en el kinder garden de las cervezas, ¡a experimentar!";
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
    { text: "TUS FAVORITAS SON LAS:", color: textColor, sizeClass: "text-3xl md:text-4xl" }, // H2, ajustado
    { text: `\n${dominantBeerCategory.toUpperCase()}`, color: highlightColor, sizeClass: "text-5xl md:text-6xl" }, // H1, ajustado
    { text: `\n\nESTE AÑO PROBASTE ${uniqueVarieties2025} DE ${totalVarietiesInDb} VARIEDADES.`, color: textColor, sizeClass: "text-3xl md:text-4xl" }, // H2, ajustado
    { text: ` ${dynamicComment}.`, color: textColor, sizeClass: "text-sm md:text-base" }, // H4, ajustado
  ], [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb, textColor, highlightColor, dynamicComment]); 

  const renderedText = useMemo(() => {
    return storySegments.flatMap((segment, segmentIndex) => {
      const lines = segment.text.split('\n');
      return lines.flatMap((line, lineIndex) => {
        const elements: React.ReactNode[] = [
          <span key={`${segmentIndex}-${lineIndex}-span`} className={cn(segment.color, segment.sizeClass)}>
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
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-xl tracking-tight font-black leading-tight`} // Ajustado max-w
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};