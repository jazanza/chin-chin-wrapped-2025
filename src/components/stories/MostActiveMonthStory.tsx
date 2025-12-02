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

// Nueva función auxiliar para frases divertidas específicas por mes
const getSeasonalWittyRemark = (month: string) => {
    switch (month) {
        case 'Enero':
            return "Eres el anticuerpo del Dry January. ¡Mientras el mundo hace dieta, tú pides la pinta más grande!";
        case 'Febrero':
            return "Febrero es el mes corto... ¡Pero no para tu agenda de visitas! Nos encanta esa dedicación.";
        case 'Marzo':
            return "Marzo es la nueva primavera cervecera para ti. Despertaste justo a tiempo, antes de que llegara el frío.";
        case 'Abril':
            return "Abril: Mes de bromas, pero tu hábito de visitarnos es 100% serio. ¡Tu fidelidad no es una broma!";
        case 'Mayo':
            return "Mayo es el mes del 'Ni frío ni calor'. Perfecto para beber, y tú lo entendiste antes que la multitud.";
        case 'Junio':
            return "Junio: La calma antes de la tormenta de julio. Disfrutaste de las mejores cervezas antes de las vacaciones de invierno.";
        case 'Septiembre':
            return "¡Te anticipaste a Múnich! Septiembre es tu Oktoberfest personal. Ojalá tuvieras un Lederhosen para cada visita.";
        case 'Octubre':
            return "¡El verdadero espíritu del Oktoberfest! Tu pico de visitas en Octubre es una tradición global, aunque sea solo para ti.";
        case 'Noviembre':
            return "Noviembre: El mes ideal para el 'pre-calentamiento'. Te preparaste para las fiestas sin las prisas de Diciembre.";
        
        // Meses de alta actividad (Julio, Agosto, Diciembre) no necesitan esta frase, pues usan la lógica de "popular".
        default:
            return "Marcaste un ritmo único que no sigue las estaciones. Siempre es buen momento para una Chin Chin.";
    }
};

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
    // ✨ NUEVA LÓGICA: Meses Menos Comunes (Pionero con frase divertida)
    const seasonalRemark = getSeasonalWittyRemark(mostActiveMonth);
    wittyPhrase = `Ignoraste las tendencias. ${seasonalRemark} Nos visitaste en ${mostActiveMonth} con un propósito especial.`;
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