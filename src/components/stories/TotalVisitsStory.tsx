import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface TotalVisitsStoryProps {
  customerName: string;
  year: string;
  totalVisits: number;
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
  visitsPercentile: number; // NEW: customer's percentile for visits
}

const CommunityVisitsComparisonText = ({ totalVisits, visitsPercentile, textColor, highlightColor }: { totalVisits: number; visitsPercentile: number; textColor: string; highlightColor: string }) => {
  if (visitsPercentile === 0) {
    return (
      <p className={cn("text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)] font-bold text-center", textColor)}>
        No hay suficientes datos de la comunidad para comparar tus visitas.
      </p>
    );
  }

  let wittyPhrase = "";
  if (visitsPercentile >= 95) { // Top 5%
    wittyPhrase = `¡Felicidades! Eres oficialmente uno de nuestros clientes más fieles, superando al ${visitsPercentile.toFixed(0)}% de la comunidad.`;
  } else if (visitsPercentile >= 75) {
    wittyPhrase = `¡Estás en el top 25% de nuestros clientes más frecuentes! Un verdadero habitué.`;
  } else if (visitsPercentile >= 50) {
    wittyPhrase = `Tus visitas te ubican en la mitad superior de nuestros clientes. ¡Nos encanta verte!`;
  } else {
    wittyPhrase = `Tus visitas te ubican por debajo de la mitad de nuestros clientes. ¡Te esperamos más seguido!`;
  }

  return (
    <p className={cn("text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold text-center", textColor)}>
      {wittyPhrase}
    </p>
  );
};

// Definir esta función FUERA del componente TotalVisitsStory
const getVisitsIntroText = (count: number) => {
  if (count >= 80) return { top: "¡Por favor, te necesitamos en la nómina!", bottom: "\nA esta altura, tu GPS nos tiene como 'Casa'. Nos visitaste:" };
  if (count >= 50) return { top: "¡Alarma! ¡Declarado residente no oficial!", bottom: "\nPasaste más tiempo aquí que en tu casa. Nos visitaste:" };
  if (count >= 25) return { top: "¡Atención, tenemos a un habitué!", bottom: "\nTu hogar tiene competencia, porque en Chin Chin te vimos:" };
  if (count >= 10) return { top: "¡Parece que Chin Chin te gustó!", bottom: "\nNos visitaste más de una vez. En concreto:" };
  
  // 0 - 9 visitas: Usar la frase fija que aprobaste si no cumple el rango alto
  return { top: `¡INTERESANTE!`, bottom: `\nNOS VISITASTE:` };
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, textColor, highlightColor, visitsPercentile }: TotalVisitsStoryProps) => {
  
  // 1. Obtener las frases dinámicas:
  const { top: dynamicTopPhrase, bottom: dynamicBottomPhrase } = getVisitsIntroText(totalVisits);

  const storySegments: TextSegment[] = useMemo(() => [
    // 2. Usar las frases dinámicas:
    { text: dynamicTopPhrase, color: highlightColor },
    { text: dynamicBottomPhrase, color: textColor },
    { text: `\n${totalVisits}`, color: highlightColor },
    { text: " VECES!", color: textColor },
  ], [totalVisits, textColor, highlightColor, dynamicTopPhrase, dynamicBottomPhrase]); // Agregar las nuevas dependencias

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
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-4`}
      >
        <p className={`text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)] text-center`}>
          {renderedText}
        </p>
      </div>
      <CommunityVisitsComparisonText
        totalVisits={totalVisits}
        visitsPercentile={visitsPercentile}
        textColor={textColor}
        highlightColor={highlightColor}
      />
    </div>
  );
};