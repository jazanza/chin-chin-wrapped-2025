import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Added for explicit size control
}

interface MostActiveDayStoryProps {
  mostActiveDay: string;
  dailyVisits: { day: string; count: number }[]; // New prop for daily visits
  textColor: string;
  highlightColor: string;
  mostPopularCommunityDay: string; // NEW: community's most popular day
}

// Nueva función para generar frases ingeniosas específicas del día
const getDaySpecificWittyRemark = (day: string) => {
    switch (day) {
        case 'Martes':
            return { title: "¡ANTI-FIN DE SEMANA! 🍺", remark: "El martes es el nuevo viernes para ti. Eres un verdadero pionero que evita las multitudes." };
        case 'Miércoles':
            return { title: "¡ROMPE MITADES! 🎯", remark: "Mitad de semana es mejor que fin de semana. Celebras los pequeños logros y nos visitas cuando más lo necesitas." };
        case 'Jueves':
            return { title: "¡PRE-FIN DE SEMANA! 🚀", remark: "Te anticipas a todos. Eres el insider que prueba las cervezas antes de que se agoten el viernes." };
        case 'Viernes':
            return { title: "¡SAN VIERNES! 🎉", remark: "El fin de semana comienza y tú garganta lo sabe." };
        case 'Sábado':
            return { title: "¡DÍA DE PLACER! 🏆", remark: "El sábado es tu campo de juego. Coincides con la mayoría, porque ese día Chin Chin es el lugar para estar." };
        case 'Domingo':
            return { title: "¡CIERRE DE ORO! 🧘", remark: "Tu ritual de domingo es perfecto. Cierras la semana con la mejor compañía y el mejor lúpulo." };
        default: // Esto cubrirá 'Lunes' o cualquier valor inesperado
            return { title: "DÍA MISTERIOSO 👻", remark: "Tuviste un día activo que nadie esperaba..." };
    }
};

const CommunityDayComparisonText = ({ mostActiveDay, mostPopularCommunityDay, textColor, highlightColor }: { mostActiveDay: string; mostPopularCommunityDay: string; textColor: string; highlightColor: string }) => {
  if (mostActiveDay === "N/A") {
    return (
      <p className={cn("text-base font-bold text-center", textColor)}> {/* H4 */}
        No hay suficientes datos para determinar tu día más activo.
      </p>
    );
  }

  const { title, remark } = getDaySpecificWittyRemark(mostActiveDay);
  let comparisonPhrase = "";

  if (mostActiveDay === mostPopularCommunityDay) {
    comparisonPhrase = `Coincides con el resto de clientes, seguro ya reconoces algunas caras.`;
  } else {
    comparisonPhrase = `Mientras la mayoría prefiere el ${mostPopularCommunityDay}, tú marcas tu propio estilo.`;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-4">
      <p className={cn("text-xl font-black text-center", highlightColor)}> {/* H3 */}
        {title}
      </p>
      <p className={cn("text-base font-bold text-center", textColor)}> {/* H4 */}
        {remark} {comparisonPhrase}
      </p>
    </div>
  );
};

export const MostActiveDayStory = ({ mostActiveDay, dailyVisits, textColor, highlightColor, mostPopularCommunityDay }: MostActiveDayStoryProps) => {
  // Eliminada la línea 'const { title: dayTitle } = useMemo(() => getDaySpecificWittyRemark(mostActiveDay), [mostActiveDay]);'

  const mainStoryTextSegments: TextSegment[] = useMemo(() => {
    if (mostActiveDay === "N/A") {
      return [
        { text: "NO HAY DATOS SUFICIENTES PARA TU DÍA MÁS ACTIVO.", color: textColor, sizeClass: "text-4xl" }, // H2
      ];
    }
    return [
      // 1. Título genérico:
      { text: "EL DÍA QUE MÁS\nNOS VISITASTE FUE EL:", color: textColor, sizeClass: "text-4xl" }, // H2
      // 2. El día activo resaltado:
      { text: `\n${mostActiveDay.toUpperCase()}`, color: highlightColor, sizeClass: "text-6xl" }, // H1
    ];
  }, [mostActiveDay, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return mainStoryTextSegments.flatMap((segment, segmentIndex) => {
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
  }, [mainStoryTextSegments]);

  // Filter and sort daily visits, excluding Monday
  const filteredDailyVisits = useMemo(() => {
    const order = ["Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const visitsMap = new Map(dailyVisits.map(d => [d.day, d.count]));
    
    return order.map(day => ({
      day,
      count: visitsMap.get(day) || 0
    }));
  }, [dailyVisits]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-8`}
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
      <div className={cn("w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2", textColor === "text-white" ? "border-white" : "border-black")}>
        <p className={cn("text-xl font-bold mb-2 text-center", highlightColor)}> {/* H3 */}
          Los Días Que Más Viniste:
        </p>
        {filteredDailyVisits.length > 0 ? (
          filteredDailyVisits.map((data, idx) => (
            <p key={idx} className={cn("text-base text-center", textColor)}> {/* H4 */}
              {`${data.day}: ${data.count} Visitas`}
            </p>
          ))
        ) : (
          <p className={cn("text-base text-center", textColor)}> {/* H4 */}
            Parece que fuiste a Chin Chin... 0 días. ¡Error de sistema!
          </p>
        )}
      </div>
      <CommunityDayComparisonText
        mostActiveDay={mostActiveDay}
        mostPopularCommunityDay={mostPopularCommunityDay}
        textColor={textColor}
        highlightColor={highlightColor}
      />
    </div>
  );
};