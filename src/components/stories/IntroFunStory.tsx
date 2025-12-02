import React, { useMemo } from 'react';
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface IntroFunStoryProps {
  totalVisits: number;
  // isPaused: boolean; // REMOVED
  // onStoryFinished: () => void; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const IntroFunStory = ({ totalVisits, textColor, highlightColor }: IntroFunStoryProps) => {
  const introSegments: TextSegment[] = useMemo(() => [
    { text: "¡GRACIAS POR ACOMPAÑARNOS ESTE 2025!", color: highlightColor },
    { text: " PARA NOSOTROS, CADA VISITA NO ES UN MOTIVO, SINO LA RAZÓN DE NUESTRA ALEGRÍA.", color: textColor },
    { text: ` POR CADA CERVEZA COMPARTIDA, POR LOS NUEVOS AMIGOS QUE HICISTE (Y QUIZÁS NO RECUERDAS) Y POR ESOS ${totalVisits} DÍAS QUE TE AHORRASTE EL TERAPEUTA EN CHIN CHIN.`, color: highlightColor },
    { text: " GRACIAS POR ELEGIRNOS. AHORA, A LO QUE VINIMOS. ESTE ES TU ¡CHIN CHIN WRAPPED 2025!", color: textColor }
  ], [totalVisits, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return introSegments.flatMap((segment, segmentIndex) => {
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
  }, [introSegments]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-2xl tracking-tight font-black leading-tight`}
      >
        <p className={`text-[min(5vw,2rem)] md:text-[min(4vw,1.8rem)] lg:text-[min(3vw,1.5rem)] text-center`}>
          {renderedText}
        </p>
      </div>
    </div>
  );
};