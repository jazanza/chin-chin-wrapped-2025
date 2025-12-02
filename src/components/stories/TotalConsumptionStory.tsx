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
  totalLiters2024: number; // Added for comparison
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

const getVolumeReactionText = (liters: number): string => {
  if (liters >= 200) return "Felicidades, eres oficialmente un cuerpo de agua. ¡La barra te saluda!";
  if (liters >= 100) return "Con eso llenas una bañera. Te estás tomando esto muy en serio.";
  if (liters >= 50) return "Suficiente para hidratar un desierto pequeño. Y sí, es un cumplido.";
  if (liters > 0) return "Eso es menos de lo que bebió tu vecino. ¿Estás seguro de que este es tu Wrapped?";
  return "Parece que aún no has descubierto tu potencial cervecero."; // Fallback for 0 liters
};

export const TotalConsumptionStory = ({ totalLiters, totalLiters2024, textColor, highlightColor }: TotalConsumptionStoryProps) => {
  const titleSegments: TextSegment[] = useMemo(() => [
    { text: "TU HÍGADO PROCESÓ UN\nVOLUMEN TOTAL DE...", color: textColor },
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

  const volumeReaction = useMemo(() => getVolumeReactionText(totalLiters), [totalLiters]);

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
      <div className={`text-center ${highlightColor} border-2 border-white p-4 mb-4`}> {/* Added mb-4 for spacing */}
        <p className="text-[min(12vw,5rem)] md:text-[min(10vw,4rem)] lg:text-[min(8vw,3rem)] font-black leading-none">
          {totalLiters.toFixed(1)} LITROS.
        </p>
        <p className={`text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold text-center ${textColor}`}>
          {volumeReaction}
        </p>
      </div>
      <ComparisonText
        current={totalLiters}
        previous={totalLiters2024}
        year="2025" // Assuming current year is 2025
        textColor={textColor}
      />
      {/* WrappedMeter REMOVED, replaced by simple text display */}
    </div>
  );
};