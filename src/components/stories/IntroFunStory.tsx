import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // Added for explicit size control
}

interface IntroFunStoryProps {
  totalVisits: number;
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
  customerName: string; // Add customerName prop
  totalCustomers: number; // NEW
  totalLitres: number;    // NEW
}

export const IntroFunStory = ({ totalVisits, textColor, highlightColor, customerName, totalCustomers, totalLitres }: IntroFunStoryProps) => {
  const firstName = useMemo(() => {
    // Asegura que customerName no sea nulo/vacío y devuelve el primer elemento (nombre).
    return customerName ? customerName.split(' ')[0] : '';
  }, [customerName]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0
  }), []);

  const formattedCustomers = useMemo(() => numberFormatter.format(totalCustomers), [totalCustomers, numberFormatter]);
  const formattedLitres = useMemo(() => numberFormatter.format(totalLitres), [totalLitres, numberFormatter]);

  const introSegments: TextSegment[] = useMemo(() => [
    { text: `${firstName.toUpperCase()}, ¡GRACIAS POR ACOMPAÑARNOS ESTE 2025!\n\n`, color: highlightColor, sizeClass: "text-xl" },
    { text: `TÚ Y LOS ${formattedCustomers} FANS DE CHIN CHIN, SE TOMARON ${formattedLitres} LITROS DE PURA ALEGRÍA CERVECERA.\n\n`, color: textColor, sizeClass: "text-xl" },
    { text: `CELEBREMOS POR LOS NUEVOS AMIGOS QUE HICISTE EN LA BARRA (Y QUIZÁS NO RECUERDAS) Y POR ESOS ${totalVisits} DÍAS QUE TE AHORRASTE LA SESIÓN DE TERAPIA GRACIAS A NOSOTROS.\n\n`, color: highlightColor, sizeClass: "text-xl" },
    { text: `AHORA SÍ, DESCUBRE TUS LOGROS CERVECEROS DEL AÑO.`, color: textColor, sizeClass: "text-xl" }
  ], [firstName, formattedCustomers, formattedLitres, totalVisits, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return introSegments.flatMap((segment, segmentIndex) => {
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
  }, [introSegments]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-2xl tracking-tight font-black leading-normal`}
      >
        <p className={`text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};