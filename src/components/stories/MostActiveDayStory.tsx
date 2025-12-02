import React, { useMemo } from 'react';
import { SegmentedText, TextSegment } from '../SegmentedText';
import { cn } from '@/lib/utils';

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  dailyVisits: { day: string; count: number }[]; // New prop for daily visits
  textColor: string;
  highlightColor: string;
}

export const MostActiveDayStory = ({ mostActiveDay, dailyVisits, textColor, highlightColor }: MostActiveDayStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU DÍA MÁS\nCHIN CHIN FUE...", color: textColor },
    { text: `\n${mostActiveDay.toUpperCase()}`, color: highlightColor },
  ], [mostActiveDay, textColor, highlightColor]);

  // Filter and format daily visits as requested
  const fridayVisits = dailyVisits.find(d => d.day === "Viernes")?.count || 0;
  const otherDaysVisits = dailyVisits
    .filter(d => d.day !== "Viernes" && d.day !== "Lunes")
    .reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <SegmentedText
        segments={storySegments}
        fontSize="text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)]" // Adjusted font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
        className="mb-8" // Add margin bottom to separate from the list
      />
      <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black")}>
        <p className={cn("text-center text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold mb-2", highlightColor)}>
          Frecuencia de Visitas:
        </p>
        <p className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
          {`Viernes: ${fridayVisits} visitas`}
        </p>
        <p className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
          {`Otros días (excepto Lunes): ${otherDaysVisits} visitas`}
        </p>
        {dailyVisits.length === 0 && (
          <p className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
            No hay datos de visitas diarias.
          </p>
        )}
      </div>
    </div>
  );
};