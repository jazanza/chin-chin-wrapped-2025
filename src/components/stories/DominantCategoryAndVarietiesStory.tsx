import React, { useMemo } from 'react';
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
import { SegmentedText, TextSegment } from '../SegmentedText';
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

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
    { text: "TU CATEGORÍA\nDOMINANTE ES...", color: textColor },
    { text: `\n${dominantBeerCategory.toUpperCase()}`, color: highlightColor },
    { text: "\n\nY PROBASTE ", color: textColor },
    { text: `${uniqueVarieties2025}`, color: highlightColor },
    { text: " DE ", color: textColor },
    { text: `${totalVarietiesInDb}`, color: highlightColor },
    { text: " VARIEDADES!", color: textColor },
  ], [dominantBeerCategory, uniqueVarieties2025, totalVarietiesInDb, textColor, highlightColor]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <SegmentedText
        segments={storySegments}
        fontSize="text-[min(6vw,2.5rem)] md:text-[min(4.5vw,2rem)] lg:text-[min(3.5vw,1.8rem)]" // Adjusted font size
        maxWidth="max-w-2xl" // Increased max-width for better readability
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
      />
    </div>
  );
};