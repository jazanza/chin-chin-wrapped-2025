import React, { useMemo } from 'react';
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
import { TypewriterText, TextSegment } from '../TypewriterText';
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const MostActiveDayStory = ({ mostActiveDay, textColor, highlightColor }: MostActiveDayStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU DÍA MÁS\nCHIN CHIN FUE...", color: textColor },
    { text: `\n${mostActiveDay.toUpperCase()}`, color: highlightColor },
  ], [mostActiveDay, textColor, highlightColor]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <TypewriterText
        segments={storySegments}
        fontSize="text-[min(10vw,4rem)] md:text-[min(8vw,3rem)] lg:text-[min(7vw,2.5rem)]" // Responsive font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
      />
    </div>
  );
};