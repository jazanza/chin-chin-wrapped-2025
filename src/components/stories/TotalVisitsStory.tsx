import React, { useMemo } from 'react';
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

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
  // Modificación: No renderizar si el valor 'previous' es nulo, indefinido o menor o igual a cero.
  if (previous == null || previous <= 0) { 
    return null; 
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = percentage >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500"; // Using Tailwind's default green/red

  return (
    <p className={`text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)] font-bold text-center ${colorClass}`}>
      {`${isPositive ? '▲ +' : '▼ -'}${percentage.toFixed(1)}% VS. ${parseInt(year) - 1}`}
    </p>
  );
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, totalVisits2024, textColor, highlightColor }: TotalVisitsStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: `¡VAYA, ${customerName.toUpperCase()}!`, color: highlightColor },
    { text: "\nTU HOGAR ESTUVO VACÍO... PORQUE NOS VISITASTE:", color: textColor },
    { text: `\n${totalVisits}`, color: highlightColor },
    { text: " VECES!", color: textColor },
  ], [customerName, totalVisits, textColor, highlightColor]);

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
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-4`}
      >
        <p className={`text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)] text-center`}>
          {renderedText}
        </p>
      </div>
      <ComparisonText
        current={totalVisits}
        previous={totalVisits2024}
        year={year}
        textColor={textColor}
      />
    </div>
  );
};