import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // NEW: Tailwind CSS class for font size
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
  let wittyPhrase = "";

  if (visitsPercentile === 0) {
    wittyPhrase = "No hay suficientes datos de la comunidad para comparar tus visitas.";
  } else if (visitsPercentile >= 95 && totalVisits >= 75) {
      wittyPhrase = `¡ERES LEYENDA! Un verdadero súper-recontra-fan, con ${totalVisits} visitas, eres definitivamente nuestro cliente #1.`;
  } else if (visitsPercentile >= 95 && totalVisits >= 50) {
      wittyPhrase = `¡FELICIDADES! Eres oficialmente uno de nuestros clientes más fieles. Estás en el Top 5%, superando al ${visitsPercentile.toFixed(0)}% de la comunidad.`;
  } else if (visitsPercentile >= 75 && totalVisits >= 30) {
      wittyPhrase = `¡Estás en el Top 25% de clientes más frecuentes! Claramente, debes seguir viniendo.`;
  } else if (visitsPercentile >= 50 && totalVisits >= 10) {
      wittyPhrase = `Tus visitas te ubican en la mitad superior de nuestros clientes. ¡Chin Chin te está gustando!`;
  } else { // Cualquier otro caso (Baja Actividad/Bajo Percentil)
      wittyPhrase = `Tus ${totalVisits} visitas te ubican por debajo de la mitad de nuestros clientes. ¡Queremos verte más seguido!`;
  }

  return (
    <p className={cn("text-base font-bold text-center", textColor)}> {/* H4 */}
      {wittyPhrase}
    </p>
  );
};

const getVisitsIntroText = (count: number) => {
  if (count >= 75) return { top: "¡Por favor, te necesitamos en la nómina!", bottom: "\nA esta altura, tu GPS nos tiene como 'Casa'." };
  if (count >= 50) return { top: "¡Alarma! ¡Declarado residente no oficial!", bottom: "\nPasaste más tiempo aquí que en tu casa." };
  if (count >= 30) return { top: "¡Tenemos a un habitué!", bottom: "\nTu casa tiene competencia." };
  if (count >= 15) return { top: "¡Parece que Chin Chin te gustó!", bottom: "\nYa tienes tu destino cervecero asegurado." };
  if (count >= 5) return { top: "¡Te vemos potencial!", bottom: "\nTu búsqueda te trajo varias veces." };
  
  return { top: "¡INTERESANTE!", bottom: "\nPARECE QUE ESTÁS EMPEZANDO TU CAMINO." };
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, textColor, highlightColor, visitsPercentile }: TotalVisitsStoryProps) => {
  
  const { top: dynamicTopPhrase, bottom: dynamicBottomPhrase } = getVisitsIntroText(totalVisits);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "NOS VISITASTE:", color: textColor, sizeClass: "text-4xl" }, // H2
    { text: `\n${totalVisits}`, color: highlightColor, sizeClass: "text-6xl" }, // H1
    { text: " VECES", color: textColor, sizeClass: "text-6xl" }, // H1
    { text: `\n\n${dynamicTopPhrase.toUpperCase()}`, color: highlightColor, sizeClass: "text-4xl" }, // H2
    { text: `\n${dynamicBottomPhrase.toUpperCase()}`, color: textColor, sizeClass: "text-4xl" }, // H2
  ], [totalVisits, textColor, highlightColor, dynamicTopPhrase, dynamicBottomPhrase]);

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
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-4`}
      >
        <p className={`text-center`}>
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