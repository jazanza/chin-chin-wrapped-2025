import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { MONTH_NAMES } from '@/hooks/useDb'; // Import MONTH_NAMES

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
            return "Mientras el mundo hace Dry January (dieta líquida), tú pides la cerveza más grande!";
        case 'Febrero':
            return "Un mes cort, pero no para tu agenda cervcera, nos encanta tu dedicación.";
        case 'Marzo':
            return "¡Tu temporada cervecera arranca con la energía de San Patricio.";
        case 'Abril':
            return "Mes de la Ley de Pureza Bávara. Tu compromiso con la tradición es al 100%.";
        case 'Mayo':
            return "¡Huele a lúpulo! Te anticipaste a los meses de sol para disfrutar de tus cervezas.";
        case 'Junio':
            return "Tu paladar está madurando. Disfrutaste de la calma antes de que se active el verano";
        case 'Septiembre':
            return "¡Te anticipaste a Múnich! Septiembre es tu Oktoberfest personal.";
        case 'Octubre':
            return "¡Tienes el gen del Oktoberfest! Tu pico de visitas en este mes es una tradición.";
        case 'Noviembre':
            return "El mes ideal para el pre-calentamiento navideño.";
        
        // Meses de alta actividad (Julio, Agosto, Diciembre) no necesitan esta frase, pues usan la lógica de "popular".
        default:
            return "Marcaste un ritmo único que no sigue estaciones o modas. Siempre es buen momento para Chin Chin.";
    }
};

const CommunityMonthComparisonText = ({ mostActiveMonth, mostPopularCommunityMonth, textColor, highlightColor }: { mostActiveMonth: string; mostPopularCommunityMonth: string; textColor: string; highlightColor: string }) => {
  let wittyPhrase = "";
  // Definir meses populares (ejemplo, ajustar según datos reales si es necesario)
  const popularMonths = ['Diciembre', 'Julio', 'Agosto']; // Suponiendo meses de alta actividad

  if (mostActiveMonth === "N/A") {
    wittyPhrase = "No hay suficientes datos.";
  } else if (mostActiveMonth === mostPopularCommunityMonth) {
    // Si coincide con el mes más popular de la comunidad
    wittyPhrase = `Te uniste a la fiesta en ${mostActiveMonth}, ¡nuestro mes con más visitas!`;
  } else if (popularMonths.includes(mostActiveMonth)) {
    // Si es un mes popular, pero NO el más popular de la comunidad
    wittyPhrase = `Disfrutaste de Chin Chin en ${mostActiveMonth}, un mes popular, pero siempre con tu estilo único.`;
  } else {
    // ✨ NUEVA LÓGICA: Meses Menos Comunes (Pionero con frase divertida)
    const seasonalRemark = getSeasonalWittyRemark(mostActiveMonth);
    wittyPhrase = `Ignoraste las tendencias. ${seasonalRemark} Nos visitaste en ${mostActiveMonth}.`;
  }

  return (
    <p className={cn("text-sm md:text-base font-bold text-center", textColor, "pb-5")}> {/* H4, ajustado, added pb-5 */}
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

  const sortedMonthlyVisits = useMemo(() => {
    // Ensure all 12 months are present, even if count is 0
    const fullMonths = MONTH_NAMES.map(monthName => {
      const existing = monthlyVisits.find(mv => mv.month === monthName);
      return { month: monthName, count: existing ? existing.count : 0 };
    });
    return fullMonths;
  }, [monthlyVisits]);

  const firstHalfMonths = sortedMonthlyVisits.slice(0, 6);
  const secondHalfMonths = sortedMonthlyVisits.slice(6);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 h-full w-full">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-md tracking-tight font-black leading-tight mb-4`} // Ajustado max-w y mb-8 a mb-4
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black", "mb-4")}> {/* Añadido mb-4 */}
        <p className={cn("text-lg md:text-xl font-bold mb-2 text-center", highlightColor)}> {/* H3, ajustado */}
          Tu Calendario de Visitas
        </p>
        <div className="grid grid-cols-2 gap-x-4"> {/* Two columns for months */}
          <div className="flex flex-col space-y-1">
            {firstHalfMonths.map((data, idx) => (
              <p key={idx} className={cn("text-sm md:text-base text-left", textColor)}> {/* H4, ajustado */}
                {`${data.month}: ${data.count} Visitas`}
              </p>
            ))}
          </div>
          <div className="flex flex-col space-y-1">
            {secondHalfMonths.map((data, idx) => (
              <p key={idx} className={cn("text-sm md:text-base text-left", textColor)}> {/* H4, ajustado */}
                {`${data.month}: ${data.count} Visitas`}
              </p>
            ))}
          </div>
        </div>
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