import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Added for explicit size control
}

interface OutroStoryProps {
  customerName: string;
  totalLiters: number;
  totalVisits: number;
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const OutroStory = ({ customerName, totalLiters, totalVisits, textColor, highlightColor }: OutroStoryProps) => {
  const firstName = useMemo(() => {
    return customerName ? customerName.split(' ')[0] : '';
  }, [customerName]);

  const formattedLiters = useMemo(() => totalLiters.toFixed(1), [totalLiters]);

  const outroSegments: TextSegment[] = useMemo(() => [
    { text: `${firstName.toUpperCase()}, TU TRAVESÍA CERVECERA DE 2025 HA TERMINADO, CERRAMOS EL AÑO CON UN RÉCORD ABSOLUTO.\n\n`, color: textColor, sizeClass: "text-lg md:text-xl" }, // Ajustado
    { text: `TE RETAMOS A QUE EN 2026 SUPERES TUS ${formattedLiters} LITROS Y NOS DEMUESTRES QUE ${totalVisits} VISITAS NO ES TU TECHO MÁXIMO.\n\n`, color: highlightColor, sizeClass: "text-lg md:text-xl" }, // Ajustado
    { text: `¡CHIN CHIN POR UN 2026 LLENO DE BUENAS CERVEZAS Y MOMENTOS!\n\n`, color: textColor, sizeClass: "text-lg md:text-xl" }, // Ajustado
    { text: `SÁCALE CAPTURA A LA PRÓXIMA IMÁGEN, SÚBELO A TUS REDES Y ETIQUÉTANOS PARA HACER OFICIAL TU HAZAÑA CERVECERA.`, color: highlightColor, sizeClass: "text-lg md:text-xl" } // Ajustado
  ], [firstName, formattedLiters, totalVisits, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return outroSegments.flatMap((segment, segmentIndex) => {
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
  }, [outroSegments]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-sm md:max-w-xl tracking-tight font-black leading-normal`} // Ajustado max-w
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};