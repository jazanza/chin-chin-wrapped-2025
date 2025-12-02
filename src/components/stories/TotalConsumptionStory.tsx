import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface TotalConsumptionStoryProps {
  totalLiters: number;
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
  litersPercentile: number; // NEW: customer's percentile for liters
}

const CommunityComparisonText = ({ litersPercentile, textColor, highlightColor }: { litersPercentile: number; textColor: string; highlightColor: string }) => {
  if (litersPercentile === 0) {
    return (
      <p className={cn("text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)] font-bold text-center", textColor)}>
        No hay suficientes datos de la comunidad para comparar tu consumo.
      </p>
    );
  }

  const topPercentage = 100 - litersPercentile;
  let wittyPhrase = "";

  if (topPercentage <= 5) {
    wittyPhrase = `¡Eres nuestro Campeón Cervecero! Solo el ${topPercentage.toFixed(0)}% de nuestros clientes bebe más que tú.`;
  } else if (topPercentage <= 25) {
    wittyPhrase = `¡Estás en el top 25% de nuestros clientes! Un verdadero fan.`;
  } else if (topPercentage <= 50) {
    wittyPhrase = `Tu consumo te ubica en la mitad superior de nuestros clientes. ¡Sigue así!`;
  } else {
    wittyPhrase = `Tu consumo te ubica por debajo de la mitad de nuestros clientes. ¡Necesitas más visitas a Chin Chin!`;
  }

  return (
    <p className={cn("text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold text-center", textColor)}>
      {wittyPhrase}
    </p>
  );
};

const getLitersReaction = (liters: number): string => {
  if (liters >= 100) return "¡Alerta! Tu cuerpo ya no está compuesto de agua, sino de la más puras cervezas.";
  if (liters >= 50) return "Tu compromiso es notable. Eres oficialmente una celebridad de Chin Chin";
  if (liters >= 20) return "Bien hecho, eres un contribuyente serio al PIB cervecero. Buen trabajo.";
  if (liters >= 10) return "Parece que has estado ahorrando. ¡Necesitas más práctica y más visitas a Chin Chin!";
  // 0 - 9.9 Litros
  return "¿Seguro que no te confundiste de Wrapped? No mentira, sabemos que lo harás mejor el 2026.";
};

export const TotalConsumptionStory = ({ totalLiters, textColor, highlightColor, litersPercentile }: TotalConsumptionStoryProps) => {
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

  const volumeReaction = useMemo(() => getLitersReaction(totalLiters), [totalLiters]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4"> {/* Flex column for vertical stacking */}
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
      <CommunityComparisonText
        litersPercentile={litersPercentile}
        textColor={textColor}
        highlightColor={highlightColor}
      />
    </div>
  );
};