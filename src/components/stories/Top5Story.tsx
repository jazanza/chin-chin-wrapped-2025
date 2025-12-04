import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Product {
  name: string;
  liters: number;
  // color: string; // Not used in 2D
}

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
  sizeClass: string; // NEW: Tailwind CSS class for font size
  nowrap?: boolean; // NEW: Optional property to prevent wrapping
}

interface Top5StoryProps {
  top10Products: Product[]; // Changed from top3Products to top10Products
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const Top5Story = ({ top10Products, textColor, highlightColor }: Top5StoryProps) => { // Changed prop name
  const mainTitleSegments: TextSegment[] = useMemo(() => {
    const segments: TextSegment[] = [];
    if (top10Products && top10Products.length > 0) {
      const top1Name = top10Products[0].name;
      segments.push({ text: `CERVEZA FAVORITA:`, color: textColor, sizeClass: "text-3xl md:text-4xl", nowrap: true }); // H2 - Added nowrap, ajustado
      segments.push({ text: `\n${top1Name.toUpperCase()}`, color: highlightColor, sizeClass: "text-5xl md:text-6xl" }); // H1, ajustado
    } else {
      segments.push({ text: "Mira lo que te estás perdiendo.", color: textColor, sizeClass: "text-3xl md:text-4xl" }); // H2, ajustado
    }
    return segments;
  }, [top10Products, textColor, highlightColor]);

  const renderedMainText = useMemo(() => {
    return mainTitleSegments.flatMap((segment, segmentIndex) => {
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
  }, [mainTitleSegments]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4"> {/* Flex column for vertical stacking */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-xs md:max-w-md tracking-tight font-black leading-tight mb-8`} // Ajustado max-w
      >
        <p className={`text-center`}>
          {renderedMainText}
        </p>
      </div>
      
      {/* Moved "TU TOP 10:" closer to the list */}
      <p className={cn("text-lg md:text-xl font-black text-center mb-4", highlightColor)}> {/* H3, ajustado */}
        TU TOP 10:
      </p>

      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2 border-white"> {/* Adjusted space-y for more items */}
        {top10Products.slice(0, 10).map((product, idx) => ( // Changed slice to 10
          <p key={idx} className={cn("text-center", textColor, idx === 0 ? 'text-lg md:text-xl font-black' : 'text-xs md:text-sm font-bold')}> {/* H3 for first, Cuerpo for others, ajustado */}
            {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} LITROS TOMADOS)`}
          </p>
        ))}
      </div>
    </div>
  );
};