import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FirstBeerOfTheYearStoryProps {
  firstBeerDetails: {
    name: string;
    date: string; // YYYY-MM-DD format
    quantity: number;
  } | null;
  textColor: string;
  highlightColor: string;
}

export const FirstBeerOfTheYearStory = ({ firstBeerDetails, textColor, highlightColor }: FirstBeerOfTheYearStoryProps) => {
  const formattedDate = useMemo(() => {
    if (!firstBeerDetails?.date) return "N/A";
    const date = new Date(firstBeerDetails.date);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [firstBeerDetails]);

  const storySegments = useMemo(() => {
    if (!firstBeerDetails) {
      return [
        { text: "PARECE QUE NO REGISTRAMOS TU PRIMERA CERVEZA DEL AÑO.", color: textColor },
        { text: "\n\n", color: textColor },
        { text: "¡ESPERAMOS QUE EL 2026 SEA DIFERENTE!", color: highlightColor },
      ];
    }

    return [
      { text: "TU VIAJE CERVECERO COMENZÓ EL ", color: textColor },
      { text: `${formattedDate.toUpperCase()}`, color: highlightColor },
      { text: "\n\n", color: textColor },
      { text: "TU PRIMERA VARIEDAD DE 2025 FUE LA ", color: textColor },
      { text: `${firstBeerDetails.name.toUpperCase()}`, color: highlightColor },
      { text: "\n\n", color: textColor },
      { text: `¡UNA ELECCIÓN DE ${firstBeerDetails.name.toUpperCase()} MARCÓ EL INICIO DE TU GRAN AÑO!`, color: textColor },
    ];
  }, [firstBeerDetails, formattedDate, textColor, highlightColor]);

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
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-2xl tracking-tight font-black leading-normal`}
      >
        <p className={`text-[min(5vw,2rem)] md:text-[min(4vw,1.8rem)] lg:text-[min(3vw,1.5rem)] text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};