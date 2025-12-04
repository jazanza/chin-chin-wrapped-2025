import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FirstBeerOfTheYearStoryProps {
  firstBeerDetails: {
    name: string;
    date: string; // YYYY-MM-DD format
    quantity: number;
    imageUrl: string | null; // NEW: Add imageUrl
  } | null;
  textColor: string;
  highlightColor: string;
}

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Added for explicit size control
  nowrap?: boolean; // NEW: Optional property to prevent wrapping
}

export const FirstBeerOfTheYearStory = ({ firstBeerDetails, textColor, highlightColor }: FirstBeerOfTheYearStoryProps) => {
  const formattedDate = useMemo(() => {
    if (!firstBeerDetails?.date) return "N/A";
    const date = new Date(firstBeerDetails.date);
    return date.toLocaleDateString('es-AR', { month: 'long', day: 'numeric' });
  }, [firstBeerDetails]);

  const storySegments: TextSegment[] = useMemo(() => {
    if (!firstBeerDetails) {
      return [
        { text: "PARECE QUE NO REGISTRAMOS TU PRIMERA CERVEZA DEL AÑO.", color: textColor, sizeClass: "text-lg md:text-xl" }, // H3, ajustado
        { text: "\n\n", color: textColor, sizeClass: "" },
        { text: "¡ESPERAMOS QUE EL 2026 SEA DIFERENTE!", color: highlightColor, sizeClass: "text-lg md:text-xl" }, // H3, ajustado
      ];
    }

    return [
      { text: "PRIMER VISITA:", color: textColor, sizeClass: "text-3xl md:text-4xl", nowrap: true }, // H2 - Added nowrap, ajustado
      { text: `\n${formattedDate.toUpperCase()}`, color: highlightColor, sizeClass: "text-5xl md:text-6xl" }, // H1 - Added \n here, ajustado
      { text: "\n\n", color: textColor, sizeClass: "" },
      { text: "PRIMER CERVEZA:", color: textColor, sizeClass: "text-3xl md:text-4xl", nowrap: true }, // H2 - Added nowrap, ajustado
      { text: `\n${firstBeerDetails.name.toUpperCase()}`, color: highlightColor, sizeClass: "text-5xl md:text-6xl" }, // H1 - Added \n here, ajustado
    ];
  }, [firstBeerDetails, formattedDate, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return storySegments.flatMap((segment, segmentIndex) => {
      const lines = segment.text.split('\n');
      return lines.flatMap((line, lineIndex) => {
        const elements: React.ReactNode[] = [
          <span key={`${segmentIndex}-${lineIndex}-span`} className={cn(segment.color, segment.sizeClass, segment.nowrap && 'whitespace-nowrap')}>
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
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 h-full w-full">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-xl tracking-tight font-black leading-normal`} // Ajustado max-w
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
      {firstBeerDetails?.imageUrl && (
        <div className="py-4 bg-white rounded-lg flex items-center justify-center aspect-square w-36 h-36 md:w-48 md:h-48 mt-4 border-2 border-black"> {/* Added border-2 border-black */}
          <img
            src={firstBeerDetails.imageUrl}
            alt={firstBeerDetails.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {/* Description text moved below the image */}
      {firstBeerDetails && (
        <p className={cn("text-sm md:text-base text-center mt-4", textColor)}> {/* H4, ajustado */}
          ¡UNA EXCELENTE CERVEZA QUE MARCÓ TU 2025!
        </p>
      )}
    </div>
  );
};