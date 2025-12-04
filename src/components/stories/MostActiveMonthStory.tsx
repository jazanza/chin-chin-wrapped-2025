import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Added for explicit size control
  nowrap?: boolean; // NEW: Optional property to prevent wrapping
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
            return "Eres el anticuerpo del Dry January. ¡Mientras el mundo hace dieta líquida, tú pides la cerveza más grande!";
        case 'Febrero':
            return "Febrero es el mes corto... ¡Pero no para tu agenda cervcera! Nos encanta esa dedicación.";
        case 'Marzo':
            return "¡Marzo activa tu temporada cervecera y arranca con la energía de San Patricio.";
        case 'Abril':
            return "Abril: Mes de la Ley de Pureza Bávara. Tu compromiso con la tradición es al 100%.";
        case 'Mayo':
            return "¡Mayo huele a lúpulo! Te anticipaste a los meses de sol para disfrutar de tus cervezas.";
        case 'Junio':
            return "Junio: La calma antes de la tormenta de julio. Disfrutaste de las mejores cervezas antes de las vacaciones de invierno.";
        case 'Septiembre':
            return "¡Te anticipaste a Múnich! Septiembre es tu Oktoberfest personal.";
        case 'Octubre':
            return "¡Tienes el gen del Oktoberfest! Tu pico de visitas en este mes es una tradición global.";
        case 'Noviembre':
            return "Noviembre: El mes ideal para el 'pre-calentamiento'. Te preparaste para las fiestas sin el apuro de Diciembre.";
        
        // Meses de alta actividad (Julio, Agosto, Diciembre) no necesitan esta frase, pues usan la lógica de "popular".
        default:
            return "Marcaste un ritmo único que no sigue las estaciones. Siempre es buen momento para Chin Chin.";
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
    wittyPhrase = `Te uniste a la fiesta. ¡${mostActiveMonth} es nuestro mes con más visitas! No nos sorprende.`;
  } else if (popularMonths.includes(mostActiveMonth)) {
    // Si es un mes popular, pero NO el más popular de la comunidad
    wittyPhrase = `Disfrutaste de Chin Chin en ${mostActiveMonth}, el mes popular entre todos, pero siempre con estilo único.`;
  } else {
    // ✨ NUEVA LÓGICA: Meses Menos Comunes (Pionero con frase divertida)
    const seasonalRemark = getSeasonalWittyRemark(mostActiveMonth);
    wittyPhrase = `Ignoraste las tendencias. ${seasonalRemark} Nos visitaste en ${mostActiveMonth} con un propósito especial.`;
  }

  return (
    <p className={cn("text-sm md:text-base font-bold text-center", textColor)}> {/* H4, ajustado */}
      {wittyPhrase}
    </p>
  );
};

export const MostActiveMonthStory = ({ mostActiveMonth, monthlyVisits, textColor, highlightColor, mostPopularCommunityMonth }: MostActiveMonthStoryProps) => {
  const storySegments: TextSegment[] = useMemo(() => [
    { text: "TU MES DE MÁS VISITAS:", color: textColor, sizeClass: "text-3xl md:text-4xl", nowrap: true }, // H2 - Added nowrap, ajustado
    { text: `\n${mostActiveMonth.toUpperCase()}`, color: highlightColor, sizeClass: "text-5xl md:text-6xl" }, // H1, ajustado
  ], [mostActiveMonth, textColor, highlightColor]);

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
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-md tracking-tight font-black leading-tight mb-8`} // Ajustado max-w
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black")}>
        <p className={cn("text-lg md:text-xl font-bold mb-2 text-center", highlightColor)}> {/* H3, ajustado */}
          Tu Calendario de Visitas
        </p>
        {monthlyVisits.length > 0 ? (
          monthlyVisits.map((data, idx) => (
            <p key={idx} className={cn("text-sm md:text-base text-center", textColor)}> {/* H4, ajustado */}
              {`${data.month}: ${data.count} Visitas`}
            </p>
          ))
        ) : (
          <p className={cn("text-sm md:text-base text-center", textColor)}> {/* H4, ajustado */}
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