import React, { useMemo } from 'react';
// import { WrappedTop5 } from '../WrappedTop5'; // REMOVED
// import { Text } from '@react-three/drei'; // REMOVED
// import { useThree } from '@react-three/fiber'; // REMOVED
import { TypewriterText, TextSegment } from '../TypewriterText';

interface Product {
  name: string;
  liters: number;
  // color: string; // Not used in 2D
}

interface Top5StoryProps {
  top5Products: Product[];
  // isPaused: boolean; // REMOVED
  textColor: string; // Tailwind CSS class
  highlightColor: string; // Tailwind CSS class
}

export const Top5Story = ({ top5Products, textColor, highlightColor }: Top5StoryProps) => {
  const titleSegments: TextSegment[] = useMemo(() => [
    { text: "TU TOP 5\nDE CERVEZAS", color: highlightColor }, // Changed to highlight for impact
  ], [highlightColor]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4"> {/* Flex column for vertical stacking */}
      <TypewriterText
        segments={titleSegments}
        fontSize="text-[min(8vw,3rem)] md:text-[min(6vw,2.5rem)] lg:text-[min(5vw,2rem)]" // Adjusted font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
        className="mb-8" // Add margin bottom to separate from the list
      />
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md space-y-2 p-4 border-2 border-white">
        {top5Products.slice(0, 5).map((product, idx) => (
          <p key={idx} className={`text-center ${textColor} ${idx === 0 ? 'text-[min(4vw,1.5rem)] md:text-[min(3.5vw,1.4rem)] lg:text-[min(3vw,1.2rem)] font-black' : 'text-[min(3vw,1.2rem)] md:text-[min(2.5vw,1.1rem)] lg:text-[min(2vw,1rem)] font-bold'}`}>
            {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} L)`}
          </p>
        ))}
      </div>
    </div>
  );
};