import React, { useMemo } from 'react';

export interface TextSegment {
  text: string;
  color: string; // Tailwind CSS class for color, e.g., "text-white"
}

interface TypewriterTextProps {
  segments: TextSegment[];
  fontSize: string; // Tailwind CSS class for font size, e.g., "text-5xl"
  maxWidth?: string; // Tailwind CSS class for max-width, e.g., "max-w-md"
  textAlign?: 'left' | 'center' | 'right'; // Tailwind CSS class for text alignment, e.g., "text-center"
  letterSpacing?: string; // Tailwind CSS class for letter spacing, e.g., "tracking-tight"
  fontWeight?: string; // Tailwind CSS class for font weight, e.g., "font-bold"
  lineHeight?: string; // Tailwind CSS class for line height, e.g., "leading-tight"
  className?: string; // Additional classes for the main container
}

export const TypewriterText = ({
  segments,
  fontSize,
  maxWidth = "max-w-full", // Default to full width, let stories constrain if needed
  textAlign = "text-center",
  letterSpacing = "tracking-normal",
  fontWeight = "font-normal",
  lineHeight = "leading-normal",
  className = "",
}: TypewriterTextProps) => {

  const renderedText = useMemo(() => {
    return segments.map((segment, segmentIndex) => {
      // Split by newline to create paragraphs or line breaks
      const lines = segment.text.split('\n');
      return lines.map((line, lineIndex) => (
        <React.Fragment key={`${segmentIndex}-${lineIndex}`}>
          <span className={`${segment.color}`}>
            {line}
          </span>
          {lineIndex < lines.length - 1 && <br />} {/* Add <br> for newlines within a segment */}
        </React.Fragment>
      ));
    });
  }, [segments]);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${maxWidth} ${letterSpacing} ${fontWeight} ${lineHeight} ${className}`}
    >
      <p className={`${fontSize} ${textAlign}`}> {/* Explicitly apply textAlign to p tag */}
        {renderedText}
      </p>
    </div>
  );
};