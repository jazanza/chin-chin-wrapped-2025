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
  customerName: string;
  totalCommunityClients: number; // NEW
  totalCommunityLiters: number; // NEW
}

export const IntroFunStory = ({ totalVisits, textColor, highlightColor, customerName, totalCommunityClients, totalCommunityLiters }: IntroFunStoryProps) => {
  const firstName = useMemo(() => {
    return customerName ? customerName.split(' ')[0] : '';
  }, [customerName]);

  const introSegments: TextSegment[] = useMemo(() => [
    { text: `${firstName.toUpperCase()}, ¡GRACIAS POR ACOMPAÑARNOS ESTE 2025!`, color: highlightColor, sizeClass: "text-4xl" },
    { text: `\n\nGracias a ti y a los ${totalCommunityClients} aficionados a las cervezas importadas.`, color: textColor, sizeClass: "text-xl" },
    { text: `\n\nEntre todos tomaron ${Math.round(totalCommunityLiters)} litros de alegría cervecera.`, color: textColor, sizeClass: "text-xl" },
    { text: `\n\nCELEBREMOS POR LOS NUEVOS AMIGOS QUE HICISTE (Y QUIZÁS NO RECUERDAS) Y POR ESOS ${totalVisits} DÍAS QUE TE AHORRASTE LA SESIÓN DE TERAPIA GRACIAS A CHIN CHIN.`, color: highlightColor, sizeClass: "text-xl" },
    { text: "\n\nAhora si, descubre TUS logros cerveceros del 2025.", color: textColor, sizeClass: "text-xl" }
  ], [totalVisits, textColor, highlightColor, firstName, totalCommunityClients, totalCommunityLiters]);

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