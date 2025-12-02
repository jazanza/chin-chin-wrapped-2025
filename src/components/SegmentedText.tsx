import React, { useMemo } from 'react';

export interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface SegmentedTextProps {
  segments: TextSegment[];
  fontSize: string; // Tailwind CSS class for font size, e.g., "text-5xl"
  maxWidth?: string; // Tailwind CSS class for max-width, e.g., "max-w-md"
  textAlign?: 'left' | 'center' | 'right'; // Tailwind CSS class for text alignment, e.g., "text-center"
  letterSpacing?: string; // Tailwind CSS class for letter spacing, e.g., "tracking-tight"
  fontWeight?: string; // Tailwind CSS class for font weight, e.g., "font-bold"
  lineHeight?: string; // Tailwind CSS class for line height, e.g., "leading-tight"
  className?: string; // Additional classes for the main container
}

export const SegmentedText = ({
  segments,
  fontSize,
  maxWidth = "max-w-full", // Default to full width, let stories constrain if needed
  textAlign = "text-center",
  letterSpacing = "tracking-normal",
  fontWeight = "font-normal",
  lineHeight = "leading-normal",
  className = "",
}: SegmentedTextProps) => {

  const renderedText = useMemo(() => {
    return segments.flatMap((segment, segmentIndex) => {
      const lines = segment.text.split('\n');
      return lines.flatMap((line, lineIndex) => {
        const elements: React.ReactNode[] = [
          <span key={`${segmentIndex}-${lineIndex}-span`} className={`${segment.color}`}>
            {line}
          </span>
        ];
        // Add <br> only if it's not the last line of the current segment
        if (lineIndex < lines.length - 1) {
          elements.push(<br key={`${segmentIndex}-${lineIndex}-br`} />);
        }
        return elements;
      });
    });
  }, [segments]);

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${maxWidth} ${letterSpacing} ${fontWeight} ${lineHeight} ${className}`}
    >
      <p className={`${fontSize} ${textAlign}`}>
        {renderedText}
      </p>
    </div>
  );
};