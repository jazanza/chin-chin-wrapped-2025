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
}

export const IntroFunStory = ({ totalVisits, textColor, highlightColor, customerName }: IntroFunStoryProps) => {
  const firstName = useMemo(() => {
    // Asegura que customerName no sea nulo/vacío y devuelve el primer elemento (nombre).
    return customerName ? customerName.split(' ')[0] : '';
  }, [customerName]);

  const introSegments: TextSegment[] = useMemo(() => [
    { text: `¡GRACIAS POR ACOMPAÑARNOS ESTE 2025, ${firstName.toUpperCase()}!`, color: highlightColor, sizeClass: "text-4xl" }, // H2
    { text: "\n\n", color: textColor, sizeClass: "" },
    { text: "PARA NOSOTROS, CADA VEZ QUE NOS VISITA ES UNA ALEGRÍA.", color: textColor, sizeClass: "text-xl" }, // H3
    { text: "\n\n", color: textColor, sizeClass: "" },
    { text: `POR CADA CERVEZA COMPARTIDA, POR LOS NUEVOS AMIGOS QUE HICISTE EN LA BARRA (Y QUIZÁS NO RECUERDAS) Y POR ESOS ${totalVisits} DÍAS QUE TE AHORRASTE LA SESIÓN DE TERAPIA GRACIAS A CHIN CHIN.`, color: highlightColor, sizeClass: "text-xl" }, // H3
    { text: "\n\n", color: textColor, sizeClass: "" },
    { text: "GRACIAS POR ELEGIRNOS. ESTE ES TU ¡CHIN CHIN WRAPPED 2025!", color: textColor, sizeClass: "text-4xl" } // H2
  ], [totalVisits, textColor, highlightColor, firstName]); // Add firstName to dependencies

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