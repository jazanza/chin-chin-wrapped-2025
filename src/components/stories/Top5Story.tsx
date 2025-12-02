import React, { useMemo } from 'react';

interface Product {
  name: string;
  liters: number;
  // color: string; // Not used in 2D
}

interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface Top5StoryProps {
  top10Products: Product[]; // Changed from top3Products to top10Products
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const Top5Story = ({ top10Products, textColor, highlightColor }: Top5StoryProps) => { // Changed prop name
  const titleSegments: TextSegment[] = useMemo(() => {
    const segments: TextSegment[] = [];
    if (top10Products && top10Products.length > 0) {
      const top1Name = top10Products[0].name;
      segments.push({ text: `TU RELACIÓN MÁS SERIA ESTE AÑO FUE CON LA: ${top1Name.toUpperCase()}.`, color: highlightColor });
      segments.push({ text: "\n", color: textColor }); // Add a line break
    } else {
      segments.push({ text: "Aún no sabes lo que es bueno. Mira lo que se está perdiendo.", color: textColor });
      segments.push({ text: "\n", color: textColor }); // Add a line break
    }
    segments.push({ text: "10 RAZONES POR LAS VIENES A CHIN CHIN", color: highlightColor });
    return segments;
  }, [top10Products, textColor, highlightColor]);

  const renderedText = useMemo(() => {
    return titleSegments.flatMap((segment, segmentIndex) => {
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
  }, [titleSegments]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4"> {/* Flex column for vertical stacking */}
      <div
        className={`flex flex-col items-center justify-center p-4 max-w-md tracking-tight font-black leading-tight mb-8`}
      >
        <p className={`text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)] text-center`}>
          {renderedText}
        </p>
      </div>
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md space-y-1 p-4 border-2 border-white"> {/* Adjusted space-y for more items */}
        {top10Products.slice(0, 10).map((product, idx) => ( // Changed slice to 10
          <p key={idx} className={`text-center ${textColor} ${idx === 0 ? 'text-[min(3.5vw,1.4rem)] md:text-[min(3vw,1.2rem)] lg:text-[min(2.5vw,1.1rem)] font-black' : 'text-[min(2.5vw,1.1rem)] md:text-[min(2vw,1rem)] lg:text-[min(1.8vw,0.9rem)] font-bold'}`}> {/* Adjusted font sizes */}
            {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} LITROS BEBIDOS)`}
          </p>
        ))}
      </div>
    </div>
  );
};