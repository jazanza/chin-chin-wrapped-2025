import React, { useMemo } from 'react';
// import { WrappedMeter } from '../WrappedMeter'; // REMOVED
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

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

  const renderedText = useMemo(() => {
    return titleSegments.flatMap((segment, segmentIndex) => {
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
  }, [titleSegments]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4"> {/* Flex column for vertical stacking */}
      {/* AnimatedBackgroundLines REMOVED */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-8`}
      >
        <p className={`text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)] text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={`text-center ${highlightColor} border-2 border-white p-4`}>
        <p className="text-[min(12vw,5rem)] md:text-[min(10vw,4rem)] lg:text-[min(8vw,3rem)] font-black leading-none">
          {totalLiters.toFixed(1)} L
        </p>
      </div>
      {/* WrappedMeter REMOVED, replaced by simple text display */}
    </div>
  );
};