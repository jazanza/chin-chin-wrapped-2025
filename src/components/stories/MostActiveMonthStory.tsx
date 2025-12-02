import React, { useMemo } from 'react';
import { SegmentedText, TextSegment } from '../SegmentedText';
import { cn } from '@/lib/utils';

interface MostActiveMonthStoryProps {
  mostActiveMonth: string;
  monthlyVisits: { month: string; count: number }[]; // New prop for monthly visits
  textColor: string;
  highlightColor: string;
}

export const MostActiveMonthStory = ({ mostActiveMonth, monthlyVisits, textColor, highlightColor }: MostActiveMonthStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "EL MES DE\nLA SED FUE...", color: textColor },
    { text: `\n${mostActiveMonth.toUpperCase()}`, color: highlightColor },
  ], [mostActiveMonth, textColor, highlightColor]);

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
          Visitas por Mes:
        </p>
        {monthlyVisits.length > 0 ? (
          monthlyVisits.map((data, idx) => (
            <p key={idx} className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
              {`${data.month}: ${data.count} visitas`}
            </p>
          ))
        ) : (
          <p className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
            No hay datos de visitas mensuales.
          </p>
        )}
      </div>
    </div>
  );
};