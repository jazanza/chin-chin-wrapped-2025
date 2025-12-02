import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface MostActiveMonthStoryProps {
  mostActiveMonth: string;
  monthlyVisits: { month: string; count: number }[]; // New prop for monthly visits
  textColor: string;
  highlightColor: string;
  mostPopularCommunityMonth: string; // NEW: community's most popular month
}

const CommunityMonthComparisonText = ({ mostActiveMonth, mostPopularCommunityMonth, textColor, highlightColor }: { mostActiveMonth: string; mostPopularCommunityMonth: string; textColor: string; highlightColor: string }) => {
  let wittyPhrase = "";
  // Definir meses populares (ejemplo, ajustar según datos reales si es necesario)
  const popularMonths = ['Diciembre', 'Julio', 'Agosto']; // Suponiendo meses de alta actividad

  if (mostActiveMonth === "N/A") {
    wittyPhrase = "No hay suficientes datos para determinar tu mes más activo.";
  } else if (mostActiveMonth === mostPopularCommunityMonth) {
    // Si coincide con el mes más popular de la comunidad
    wittyPhrase = `Te uniste a la fiesta. ¡${mostActiveMonth} es nuestro mes más visitado! No nos sorprende.`;
  } else if (popularMonths.includes(mostActiveMonth)) {
    // Si es un mes popular, pero NO el más popular de la comunidad
    wittyPhrase = `Disfrutaste de Chin Chin en ${mostActiveMonth}, un mes popular, pero con tu propio estilo.`;
  } else {
    // Si es un mes menos común para la comunidad
    wittyPhrase = `Ignoraste las tendencias y nos visitaste en ${mostActiveMonth}. ¡Eres un pionero de la temporada!`;
  }

  return (
    <p className={cn("text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold text-center", textColor)}>
      {wittyPhrase}
    </p>
  );
};

export const MostActiveMonthStory = ({ mostActiveMonth, monthlyVisits, textColor, highlightColor, mostPopularCommunityMonth }: MostActiveMonthStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "EL MES QUE MÁS\nNOS NECESITASTE FUE...", color: textColor },
    { text: `\n${mostActiveMonth.toUpperCase()}`, color: highlightColor },
  ], [mostActiveMonth, textColor, highlightColor]);

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
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-8`}
      >
        <p className={`text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)] text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black")}>
        <p className={cn("text-center text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold mb-2", highlightColor)}>
          Tu Calendario de Visitas
        </p>
        {monthlyVisits.length > 0 ? (
          monthlyVisits.map((data, idx) => (
            <p key={idx} className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
              {`${data.month}: ${data.count} VISITAS`}
            </p>
          ))
        ) : (
          <p className={cn("text-center text-[min(2.5vw,1rem)] md:text-[min(2vw,0.9rem)] lg:text-[min(1.5vw,0.8rem)]", textColor)}>
            Aún no conoces tu potencial cervecero. (No hay datos).
          </p>
        )}
      </div>
      <CommunityMonthComparisonText
        mostActiveMonth={mostActiveMonth}
        mostPopularCommunityMonth={mostPopularCommunityMonth}
        textColor={textColor}
        highlightColor={highlightColor}
      />
    </div>
  );
};