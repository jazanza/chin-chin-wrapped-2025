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
  const roundedVisitsPercentile = Math.round(visitsPercentile); // Redondeamos el percentil aquí

  if (roundedVisitsPercentile === 0) {
    wittyPhrase = "No hay suficientes datos.";
  } else if (totalVisits > 100) { // Más de 100 visitas
    wittyPhrase = `🥇¡NIVEL LEYENDA!🥇 Con ${totalVisits} visitas, eres nuestros Fan #1, superando al 99% de la comunidad.`;
  } else if (totalVisits >= 91) { // Entre 91 y 100 visitas
    wittyPhrase = `¡IMPRESIONATE! Con ${totalVisits} visitas, estás a un paso de la triple cifra.`;
  } else if (totalVisits >= 75) { // Entre 75 y 90 visitas
    wittyPhrase = `¡TOP 3! Con ${totalVisits} visitas, eres uno de nuestros clientes más frecuentes.`;
  } else if (totalVisits >= 50) { // Entre 50 y 74 visitas
    wittyPhrase = `¡Un verdadero habitué! Con ${totalVisits} visitas, demuestras una gran lealtad a Chin Chin.`;
  } else if (totalVisits >= 30) { // Entre 30 y 49 visitas
    wittyPhrase = `¡Buen ritmo! Con ${totalVisits} visitas, ya eres parte de la familia Chin Chin.`;
  } else if (totalVisits >= 15) { // Entre 15 y 29 visitas
    wittyPhrase = `¡Vas por buen camino! Con ${totalVisits} visitas, estás descubriendo tu lugar en Chin Chin.`;
  } else if (totalVisits >= 5) { // Entre 5 y 14 visitas
    wittyPhrase = `¡Bienvenido al club! Con ${totalVisits} visitas, ya eres parte de la experiencia Chin Chin.`;
  } else { // Menos de 5 visitas
    if (roundedVisitsPercentile >= 50) {
      wittyPhrase = `Tus ${totalVisits} visitas te ubican en la mitad superior de nuestros clientes. ¡Chin Chin te gusta!`;
    } else {
      wittyPhrase = `Tus ${totalVisits} visitas te ubican por debajo de la mitad de nuestros clientes. ¡Queremos verte más seguido!`;
    }
  }

  return (
    <p className={cn("text-sm md:text-base font-bold text-center", textColor)}> {/* H4, ajustado */}
      {wittyPhrase}
    </p>
  );
};

const getVisitsIntroText = (count: number) => {
  if (count > 100) return { top: "¡ERES UNA LEYENDA!", bottom: "\nMás de 100 visitas" };
  if (count >= 75) return { top: "A esta altura, tu GPS nos tiene como 'Casa'", bottom: "\n¡Eres Leyenda!" };
  if (count >= 50) return { top: "Pasaste más tiempo aquí que en tu casa.", bottom: "\n¡Declarado residente no oficial!" };
  if (count >= 30) return { top: "¡Tenemos a un habitué!", bottom: "\nTu casa tiene competencia." };
  if (count >= 15) return { top: "¡Parece que Chin Chin te gustó!", bottom: "\nYa tienes tu destino cervecero asegurado." };
  if (count >= 5) return { top: "¡Te vemos potencial!", bottom: "\nSigue viniendo." };
  
  return { top: "¡INTERESANTE!", bottom: "\nPARECE QUE ESTÁS EMPEZANDO TU CAMINO." };
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, textColor, highlightColor, visitsPercentile }: TotalVisitsStoryProps) => {
  
  const { top: dynamicTopPhrase, bottom: dynamicBottomPhrase } = getVisitsIntroText(totalVisits);

  const storySegments: TextSegment[] = useMemo(() => [
    { text: "NOS VISITASTE:", color: textColor, sizeClass: "text-3xl md:text-4xl" }, // H2, ajustado
    { text: `\n${totalVisits}`, color: highlightColor, sizeClass: "text-5xl md:text-6xl" }, // H1, ajustado
    { text: " VECES", color: textColor, sizeClass: "text-5xl md:text-6xl" }, // H1, ajustado
    { text: `\n\n${dynamicTopPhrase.toUpperCase()}`, color: highlightColor, sizeClass: "text-3xl md:text-4xl" }, // H2, ajustado
    { text: `\n${dynamicBottomPhrase.toUpperCase()}`, color: textColor, sizeClass: "text-3xl md:text-4xl" }, // H2, ajustado
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
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-md tracking-tight font-black leading-tight mb-4`} // Ajustado max-w
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