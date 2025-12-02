import React, { useMemo } from 'react';
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
import { SegmentedText, TextSegment } from '../SegmentedText';
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface TotalVisitsStoryProps {
  customerName: string;
  year: string;
  totalVisits: number;
  totalVisits2024: number;
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

const ComparisonText = ({ current, previous, year, textColor }: { current: number; previous: number; year: string; textColor: string }) => {
  if (previous === 0) {
    return (
      <p className={`text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)] font-normal text-center ${textColor}`}>
        No data for {parseInt(year) - 1}
      </p>
    );
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = percentage >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500"; // Using Tailwind's default green/red

  return (
    <p className={`text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)] font-bold text-center ${colorClass}`}>
      {`${isPositive ? '▲ +' : '▼ '}${percentage.toFixed(1)}% vs. ${parseInt(year) - 1}`}
    </p>
  );
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, totalVisits2024, textColor, highlightColor }: TotalVisitsStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: `¡${customerName.toUpperCase()},`, color: highlightColor },
    { text: "\nNOS VISITASTE...", color: textColor },
    { text: `\n${totalVisits}`, color: highlightColor },
    { text: " VECES!", color: textColor },
  ], [customerName, totalVisits, textColor, highlightColor]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <SegmentedText
        segments={storySegments}
        fontSize="text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)]" // Adjusted font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
        className="mb-4" // Add margin bottom to separate from comparison text
      />
      <ComparisonText
        current={totalVisits}
        previous={totalVisits2024}
        year={year}
        textColor={textColor}
      />
    </div>
  );
};