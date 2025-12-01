import React, { useMemo } from 'react';
import { TypewriterText, TextSegment } from '../TypewriterText';
// import { AnimatedBackgroundLines } from '@/components/AnimatedBackgroundLines'; // REMOVED

interface IntroFunStoryProps {
  totalVisits: number;
  // isPaused: boolean; // REMOVED
  // onStoryFinished: () => void; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const IntroFunStory = ({ totalVisits, textColor, highlightColor }: IntroFunStoryProps) => {
  const introSegments: TextSegment[] = useMemo(() => [
    { text: "¡GRACIAS POR\nACOMPAÑARNOS\nESTE 2025!", color: highlightColor }, // Changed to highlight for impact
    { text: "\n\nPARA NOSOTROS,\nCADA VISITA TUYA\nES UN MOTIVO DE ALEGRÍA.", color: textColor },
    { text: `\n\nPOR LAS CERVEZAS\nQUE COMPARTIMOS,\nLOS NUEVOS AMIGOS\nQUE HICISTE,\nY POR ESOS ${totalVisits}\nDÍAS INOLVIDABLES\nCON NOSOTROS.`, color: highlightColor },
    { text: "\n\n(ESPERAMOS QUE NO HAYAS\nBORRADO CASSETTE... ¡O SÍ!)", color: textColor },
    { text: "\n\nGRACIAS POR ELEGIRNOS\nCOMO TU BARRA DE CERVEZAS\nFAVORITA.", color: textColor },
    { text: "\n\nAHORA, TE PRESENTAMOS\nTU CHIN CHIN 2025 WRAPPED.\n¡COMPÁRTELO EN REDES!", color: textColor }
  ], [totalVisits, textColor, highlightColor]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      {/* AnimatedBackgroundLines REMOVED */}
      <TypewriterText
        segments={introSegments}
        fontSize="text-[min(6vw,2.5rem)] md:text-[min(4.5vw,2rem)] lg:text-[min(3.5vw,1.8rem)]" // Adjusted font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
      />
    </div>
  );
};