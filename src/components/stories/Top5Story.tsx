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
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <TypewriterText
        segments={titleSegments}
        fontSize="text-[min(10vw,4rem)] md:text-[min(8vw,3rem)] lg:text-[min(7vw,2.5rem)]" // Responsive font size
        maxWidth="max-w-md"
        textAlign="text-center"
        letterSpacing="tracking-tight"
        fontWeight="font-black"
        lineHeight="leading-tight"
        className="mb-8" // Add margin bottom to separate from the list
      />
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md space-y-2 p-4 border-2 border-white">
        {top5Products.slice(0, 5).map((product, idx) => (
          <p key={idx} className={`text-center ${textColor} ${idx === 0 ? 'text-2xl md:text-3xl lg:text-4xl font-black' : 'text-lg md:text-xl lg:text-2xl font-bold'}`}>
            {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} L)`}
          </p>
        ))}
      </div>
    </div>
  );
};