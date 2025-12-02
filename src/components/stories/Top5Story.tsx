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
      segments.push({ text: `TU RELACIÓN MÁS SERIA ESTE AÑO FUE CON LA ${top1Name.toUpperCase()}.`, color: highlightColor });
      segments.push({ text: "\n", color: textColor }); // Add a line break
    } else {
      segments.push({ text: "Aún no sabes lo que es bueno. Mira lo que se está perdiendo.", color: textColor });
      segments.push({ text: "\n", color: textColor }); // Add a line break
    }
    segments.push({ text: "LAS 10 RAZONES POR LAS QUE CASI VIVES AQUÍ", color: highlightColor });
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
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md space-y-2 p-4 border-2 border-white">
        {top10Products.slice(0, 5).map((product, idx) => ( // Slice to 5 from top10Products
          <p key={idx} className={`text-center ${textColor} ${idx === 0 ? 'text-[min(4vw,1.5rem)] md:text-[min(3.5vw,1.4rem)] lg:text-[min(3vw,1.2rem)] font-black' : 'text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold'}`}>
            {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} L BEBIDOS)`}
          </p>
        ))}
      </div>
    </div>
  );
};