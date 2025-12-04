import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Added for explicit size control
}

interface TotalConsumptionStoryProps {
  totalLiters: number;
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
  litersPercentile: number; // NEW: customer's percentile for liters
  mostFrequentBeerName: string; // NEW: Most frequent beer name
}

const CommunityLitersComparisonText = ({ totalLiters, litersPercentile, textColor, highlightColor, mostFrequentBeerName }: { totalLiters: number; litersPercentile: number; textColor: string; highlightColor: string; mostFrequentBeerName: string }) => {
  const upperBeerName = mostFrequentBeerName.toUpperCase();
  let wittyPhrase = "";

  if (litersPercentile === 0) {
    wittyPhrase = "No hay suficientes datos.";
  } else if (litersPercentile >= 95 && totalLiters >= 150) {
      wittyPhrase = `¡NIVEL TITÁN! Consumiste ${totalLiters.toFixed(1)} litros. 
      Podrías llenar una piscina.`;
  } else if (litersPercentile >= 95 && totalLiters >= 100) {
      wittyPhrase = `¡Eres parte del Top 5% de consumidores! superando al ${litersPercentile.toFixed(0)}% de la comunidad.`;
  } else if (litersPercentile >= 75 && totalLiters >= 50) {
    wittyPhrase = `¡Estás en el Top 25% de consumidores!
    Demuestras un buen ritmo cervecero.`;
  } else if (litersPercentile >= 50 && totalLiters >= 20) {
    wittyPhrase = `Tu consumo te ubica en la mitad superior de nuestros clientes. 
    ¡Claramente, disfrutas las cervezas!`;
  } else { // Cualquier otro caso (Baja Actividad/Bajo Percentil)
    wittyPhrase = `Tienes un consumo moderado de ${totalLiters.toFixed(1)} litros.
    ¡Aún tienes tiempo para probar más cervezas!`;
  }

  return (
    <p className={cn("text-sm md:text-base font-bold text-center", textColor)}> {/* H4, ajustado */}
      {wittyPhrase}
    </p>
  );
};

// Removed getLitersReaction as it's replaced by CommunityLitersComparisonText

export const TotalConsumptionStory = ({ totalLiters, textColor, highlightColor, litersPercentile, mostFrequentBeerName }: TotalConsumptionStoryProps) => {
  const titleSegments: TextSegment[] = useMemo(() => [
    { text: "TU HÍGADO PROCESÓ\nUN TOTAL DE:", color: textColor, sizeClass: "text-3xl md:text-4xl" }, // H2, ajustado
  ], [textColor]);

  const renderedText = useMemo(() => {
    return titleSegments.flatMap((segment, segmentIndex) => {
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
  }, [titleSegments]);

  // The volumeReaction is now handled by CommunityLitersComparisonText
  // const volumeReaction = useMemo(() => getLitersReaction(totalLiters), [totalLiters]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4"> {/* Flex column for vertical stacking */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-md tracking-tight font-black leading-tight mb-8`} // Ajustado max-w
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={`text-center ${highlightColor} border-2 border-white p-4 mb-4`}> {/* Added mb-4 for spacing */}
        <p className="text-5xl md:text-6xl font-black leading-none"> {/* H1, ajustado */}
          {totalLiters.toFixed(1)} LITROS
        </p>
      </div>
      {/* CommunityLitersComparisonText moved outside the box */}
      <CommunityLitersComparisonText
        totalLiters={totalLiters}
        litersPercentile={litersPercentile}
        textColor={textColor}
        highlightColor={highlightColor}
        mostFrequentBeerName={mostFrequentBeerName}
      />
    </div>
  );
};