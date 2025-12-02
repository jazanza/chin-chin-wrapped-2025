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
  mostFrequentBeerName: string; // This prop is no longer used in this component's text logic
}

const CommunityVisitsComparisonText = ({ totalVisits, visitsPercentile, textColor, highlightColor }: { totalVisits: number; visitsPercentile: number; textColor: string; highlightColor: string }) => {
  let wittyPhrase = "";

  if (visitsPercentile === 0) {
    wittyPhrase = "No hay suficientes datos de la comunidad para comparar tus visitas.";
  } else if (visitsPercentile >= 95 && totalVisits >= 75) {
      wittyPhrase = `¡NIVEL LEYENDA! Eres un súper-habitué, con ${totalVisits} visitas. Eres nuestro cliente más fiel.`;
  } else if (visitsPercentile >= 95 && totalVisits >= 50) {
      wittyPhrase = `¡FELICIDADES! Eres oficialmente uno de nuestros clientes más fieles. Estás en el Top 5%, superando al ${visitsPercentile.toFixed(0)}% de la comunidad.`;
  } else if (visitsPercentile >= 75 && totalVisits >= 30) {
      wittyPhrase = `¡Estás en el Top 25% de clientes más frecuentes! Claramente, el hábito te llama de vuelta.`;
  } else if (visitsPercentile >= 50 && totalVisits >= 10) {
      wittyPhrase = `Tus visitas te ubican en la mitad superior de nuestros clientes. ¡Chin Chin te está gustando!`;
  } else { // Cualquier otro caso (Baja Actividad/Bajo Percentil)
      wittyPhrase = `Tus ${totalVisits} visitas te ubican por debajo de la mitad de nuestros clientes. ¡Te esperamos más seguido!`;
  }

  return (
    <p className={cn("text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold text-center", textColor)}>
      {wittyPhrase}
    </p>
  );
};

// Definir esta función FUERA del componente TotalVisitsStory
const getVisitsIntroText = (count: number) => {
  // Umbrales aumentados para un ranking más estricto
  if (count >= 75) return { top: "¡Por favor, te necesitamos en la nómina!", bottom: "\nA esta altura, tu GPS nos tiene como 'Casa'." };
  if (count >= 50) return { top: "¡Alarma! ¡Declarado residente no oficial!", bottom: "\nPasaste más tiempo aquí que en tu casa." };
  if (count >= 30) return { top: "¡Atención, tenemos a un habitué!", bottom: "\nTu hogar tiene competencia." };
  if (count >= 15) return { top: "¡Parece que Chin Chin te gustó!", bottom: "\nYa tienes tu ruta marcada." };
  if (count >= 5) return { top: "¡Vemos Potencial!", bottom: "\nTu búsqueda te trajo estas veces." };
  
  // 0-4 visitas
  return { top: "¡INTERESANTE!", bottom: "\nPARECE QUE ESTÁS EMPEZANDO TU CAMINO." };
};

export const TotalVisitsStory = ({ customerName, year, totalVisits, textColor, highlightColor, visitsPercentile, mostFrequentBeerName }: TotalVisitsStoryProps) => {
  
  // 1. Obtener las frases dinámicas:
  const { top: dynamicTopPhrase, bottom: dynamicBottomPhrase } = getVisitsIntroText(totalVisits); // Removed mostFrequentBeerName

  const storySegments: TextSegment[] = useMemo(() => [
    // 2. Usar las frases dinámicas:
    { text: dynamicTopPhrase, color: highlightColor },
    { text: dynamicBottomPhrase, color: textColor },
    { text: `\n${totalVisits}`, color: highlightColor },
    { text: " VECES!", color: textColor },
  ], [totalVisits, textColor, highlightColor, dynamicTopPhrase, dynamicBottomPhrase]);

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
        // mostFrequentBeerName is no longer passed here
      />
    </div>
  );
};