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
        { text: "PARECE QUE NO REGISTRAMOS TU PRIMERA CERVEZA DEL AÑO.", color: textColor, sizeClass: "text-xl" }, // H3
        { text: "\n\n", color: textColor, sizeClass: "" },
        { text: "¡ESPERAMOS QUE EL 2026 SEA DIFERENTE!", color: highlightColor, sizeClass: "text-xl" }, // H3
      ];
    }

    return [
      { text: "TU VIAJE CERVECERO COMENZÓ EL ", color: textColor, sizeClass: "text-4xl" }, // H2
      { text: `${formattedDate.toUpperCase()}`, color: highlightColor, sizeClass: "text-6xl" }, // H1
      { text: "\n\n", color: textColor, sizeClass: "" },
      { text: "TU PRIMERA DEL AÑO FUE:", color: textColor, sizeClass: "text-4xl" }, // H2
      { text: `${firstBeerDetails.name.toUpperCase()}`, color: highlightColor, sizeClass: "text-6xl" }, // H1
      { text: "\n\n", color: textColor, sizeClass: "" },
      { text: `¡UNA EXCELENTE ELECCIÓN QUE MARCÓ EL TONO DE TU AÑO CERVECERO!`, color: textColor, sizeClass: "text-base" }, // H4
    ];
  }, [firstBeerDetails, formattedDate, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return storySegments.flatMap((segment, segmentIndex) => {
      const lines = segment.text.split('\n');
      return lines.flatMap((line, lineIndex) => {
        const elements: React.ReactNode[] = [
          <span key={`${segmentIndex}-${lineIndex}-span`} className={cn(segment.color, segment.sizeClass)}>
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
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};