import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  dailyVisits: { day: string; count: number }[]; // New prop for daily visits
  textColor: string;
  highlightColor: string;
}

export const MostActiveDayStory = ({ mostActiveDay, dailyVisits, textColor, highlightColor }: MostActiveDayStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU DÍA FAVORITO\nPARA VISITARNOS FUE...", color: textColor },
    { text: `\n${mostActiveDay.toUpperCase()}`, color: highlightColor },
  ], [mostActiveDay, textColor, highlightColor]);

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

  // Filter and sort daily visits, excluding Monday
  const filteredDailyVisits = useMemo(() => {
    const order = ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const visitsMap = new Map(dailyVisits.map(d => [d.day, d.count]));
    
    return order.map(day => ({
      day,
      count: visitsMap.get(day) || 0
    }));
  }, [dailyVisits]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-8`}
      >
        <p className={`text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)] text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black")}>
        <p className={cn("text-center text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold mb-2", highlightColor)}>
          Los Días Que Viniste Más:
        </p>
        {filteredDailyVisits.length > 0 ? (
          filteredDailyVisits.map((data, idx) => (
            <p key={idx} className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
              {`${data.day}: ${data.count} VISITAS`}
            </p>
          ))
        ) : (
          <p className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
            Parece que fuiste a Chin Chin... 0 días. ¡Error de sistema!
          </p>
        )}
      </div>
    </div>
  );
};