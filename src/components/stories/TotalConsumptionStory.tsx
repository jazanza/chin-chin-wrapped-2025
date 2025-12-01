import React, { useMemo } from 'react';
// import { WrappedMeter } from '../WrappedMeter'; // REMOVED
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
import { TypewriterText, TextSegment } from '../TypewriterText';
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface TotalConsumptionStoryProps {
  totalLiters: number;
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const TotalConsumptionStory = ({ totalLiters, textColor, highlightColor }: TotalConsumptionStoryProps) => {
  const titleSegments: TextSegment[] = useMemo(() => [
    { text: "TU CONSUMO\nTOTAL", color: textColor },
  ], [textColor]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <TypewriterText
        segments={titleSegments}
        fontSize="text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)]" // Adjusted font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
        className="mb-8" // Add margin bottom
      />
      <div className={`text-center ${highlightColor} border-2 border-white p-4`}>
        <p className="text-[min(12vw,5rem)] md:text-[min(10vw,4rem)] lg:text-[min(8vw,3rem)] font-black leading-none">
          {totalLiters.toFixed(1)} L
        </p>
      </div>
      {/* WrappedMeter REMOVED, replaced by simple text display */}
    </div>
  );
};