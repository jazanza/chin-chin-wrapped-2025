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

export const DominantCategoryAndVarietiesStory = ({
  dominantBeerCategory,
  uniqueVarieties2025,
  totalVarietiesInDb,
  textColor,
  highlightColor,
}: DominantCategoryAndVarietiesStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TUS CERVEZAS FAVORITAS\n(LAS QUE ESTÁS ENVICIADO) SON...", color: textColor },
    { text: `\n${dominantBeerCategory.toUpperCase()}`, color: highlightColor },
    { text: "\n\nY PROBASTE ", color: textColor },
    { text: `${uniqueVarieties2025}`, color: highlightColor },
    { text: " VARIEDADES ÚNICAS. \n(DE ", color: textColor },
    { text: `${totalVarietiesInDb}`, color: highlightColor },
    { text: " DISPONIBLES. VAS POR BUEN CAMINO).", color: textColor },
  ], [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb, textColor, highlightColor]);

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