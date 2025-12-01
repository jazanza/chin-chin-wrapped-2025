import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Text, Box, Image } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { TypewriterText, TextSegment } from '../TypewriterText';

interface Product {
  name: string;
  liters: number;
  color: string;
}

interface SummaryInfographicProps {
  customerName: string;
  year: string;
  totalLiters: number;
  dominantBeerCategory: string;
  top5Products: Product[];
  totalVisits: number;
  isPaused: boolean;
  // New props for infographic
  totalVisits2024: number;
  totalLiters2024: number;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  textColor: string;
  highlightColor: string;
}

// Helper for comparison text and arrow
const ComparisonText = ({ current, previous, responsiveScale, year, textColor, position }: { current: number; previous: number; responsiveScale: number; year: string; textColor: string; position: [number, number, number] }) => {
  const { viewport } = useThree(); // Access viewport for responsive font sizing

  if (previous === 0) {
    return (
      <group position={position}>
        <Text
          fontSize={Math.min(viewport.width * 0.02, 0.1) * responsiveScale}
          color={textColor} // Use textColor for "No data"
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.03]}
          maxWidth={viewport.width * 0.8} // Use viewport width for max width
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={400}
        >
          No data for {parseInt(year) - 1}
        </Text>
      </group>
    );
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = percentage >= 0;
  const color = isPositive ? "#00FF00" : "#FF0000"; // Green for up, Red for down

  return (
    <group position={position}>
      <Text
        fontSize={Math.min(viewport.width * 0.02, 0.1) * responsiveScale}
        color={color}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
        maxWidth={viewport.width * 0.8}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={700}
      >
        {`${isPositive ? '▲ +' : '▼ '}${percentage.toFixed(1)}% vs. ${parseInt(year) - 1}`}
      </Text>
    </group>
  );
};


export const SummaryInfographic = ({
  customerName,
  year,
  totalLiters,
  dominantBeerCategory,
  top5Products,
  totalVisits,
  isPaused,
  // New props
  totalVisits2024,
  totalLiters2024,
  uniqueVarieties2025,
  totalVarietiesInDb,
  mostActiveDay,
  mostActiveMonth,
  textColor,
  highlightColor,
}: SummaryInfographicProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  // Define overall infographic dimensions based on viewport, not fixed ratio
  const infographicWidth = viewport.width * 0.8; // Use 80% of viewport width
  const infographicHeight = viewport.height * 0.8; // Use 80% of viewport height

  // Calculate block dimensions for a 2x3 grid
  const blockWidth = infographicWidth / 2;
  const blockHeight = infographicHeight / 3;

  const [isTitleTyped, setIsTitleTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
  }, [customerName, year]);

  // Helper to get block position - Explicitly returning a tuple [number, number, number]
  const getBlockPosition = (row: number, col: number): [number, number, number] => {
    // Calculate x relative to the center of the infographicWidth
    const x = (col === 1 ? -blockWidth / 2 : blockWidth / 2) - infographicWidth / 4;
    // Calculate y relative to the center of the infographicHeight
    const y = (row === 1 ? infographicHeight / 3 : row === 2 ? 0 : -infographicHeight / 3) + infographicHeight / 6;
    return [x, y, 0];
  };

  // Get the top 1 product, or a placeholder if none
  const top1Product = top5Products.length > 0 ? top5Products[0] : { name: "N/A", liters: 0 };

  const mainTitleSegments: TextSegment[] = useMemo(() => [
    { text: customerName.toUpperCase(), color: highlightColor },
    { text: `\n${year} WRAPPED`, color: textColor },
  ], [customerName, year, textColor, highlightColor]);

  return (
    <group position={[0, 0, 0]}>
      {/* Main Infographic Title */}
      <TypewriterText
        segments={mainTitleSegments}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, infographicHeight / 2 + 0.3 * responsiveScale, 0]} // Adjust position for combined title
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        anchorX="center"
        anchorY="middle"
        maxWidth={infographicWidth * 0.9}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
        lineHeight={1.2}
      />

      {isTitleTyped && (
        <group position={[0, -0.5 * responsiveScale, 0]}> {/* Adjust group position to center the grid */}
          {/* Row 1, Column 1: Total Visitas */}
          <Block
            position={getBlockPosition(1, 1)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#000000" // Fixed for infographic
            textColor={textColor}
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, 0.3 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              VISITAS {year}
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.08, 0.6) * responsiveScale}
              color={highlightColor} // Highlighted
              anchorX="center"
              anchorY="middle"
              position={[0, 0.05 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {totalVisits}
            </Text>
            <ComparisonText current={totalVisits} previous={totalVisits2024} responsiveScale={responsiveScale} year={year} textColor={textColor} position={[0, -0.4 * responsiveScale, 0.03]} />
          </Block>

          {/* Row 1, Column 2: Total Litros */}
          <Block
            position={getBlockPosition(1, 2)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#FFFFFF" // Fixed for infographic
            textColor={textColor}
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, 0.3 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              LITROS CONSUMIDOS
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.08, 0.6) * responsiveScale}
              color={highlightColor} // Highlighted
              anchorX="center"
              anchorY="middle"
              position={[0, 0.05 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {totalLiters.toFixed(1)} L
            </Text>
            <ComparisonText current={totalLiters} previous={totalLiters2024} responsiveScale={responsiveScale} year={year} textColor={textColor} position={[0, -0.4 * responsiveScale, 0.03]} />
          </Block>

          {/* Row 2, Column 1: Top 5 Cervezas */}
          <Block
            position={getBlockPosition(2, 1)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#000000" // Fixed for infographic
            textColor={textColor}
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, 0.4 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              TUS 5 FAVORITAS
            </Text>
            {top5Products.slice(0, 5).map((product, idx) => (
              <Text
                key={idx}
                fontSize={idx === 0 ? Math.min(viewport.width * 0.04, 0.25) * responsiveScale : Math.min(viewport.width * 0.025, 0.12) * responsiveScale}
                color={idx === 0 ? highlightColor : textColor} // Highlight top product
                anchorX="center"
                anchorY="middle"
                position={[0, 0.2 * responsiveScale - idx * 0.15 * responsiveScale, 0.03]}
                maxWidth={blockWidth * 0.8}
                textAlign="center"
                letterSpacing={-0.05}
                fontWeight={idx === 0 ? 900 : 700}
              >
                {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} L)`}
              </Text>
            ))}
          </Block>

          {/* Row 2, Column 2: Variedades Probadas */}
          <Block
            position={getBlockPosition(2, 2)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#FFFFFF" // Fixed for infographic
            textColor={textColor}
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, 0.3 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              COLECCIONISTA DE SABORES
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.08, 0.6) * responsiveScale}
              color={highlightColor} // Highlighted
              anchorX="center"
              anchorY="middle"
              position={[0, 0 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {`${uniqueVarieties2025} / ${totalVarietiesInDb}`}
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.025, 0.12) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, -0.2 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              VARIEDADES PROBADAS
            </Text>
          </Block>

          {/* Row 3, Column 1: Día Más Activo */}
          <Block
            position={getBlockPosition(3, 1)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#000000" // Fixed for infographic
            textColor={textColor}
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, 0.3 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              DÍA MÁS CHIN CHIN
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.08, 0.6) * responsiveScale}
              color={highlightColor} // Highlighted
              anchorX="center"
              anchorY="middle"
              position={[0, 0 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {mostActiveDay.toUpperCase()}
            </Text>
          </Block>

          {/* Row 3, Column 2: Mes Más Activo */}
          <Block
            position={getBlockPosition(3, 2)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#FFFFFF" // Fixed for infographic
            textColor={textColor}
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              position={[0, 0.3 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              EL MES DE LA SED
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.08, 0.6) * responsiveScale}
              color={highlightColor} // Highlighted
              anchorX="center"
              anchorY="middle"
              position={[0, 0 * responsiveScale, 0.03]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {mostActiveMonth.toUpperCase()}
            </Text>
          </Block>
        </group>
      )}
    </group>
  );
};

// Helper component for each grid block
interface BlockProps {
  position: [number, number, number];
  width: number;
  height: number;
  bgColor: string;
  textColor: string; // Passed for consistency, though fixed for infographic blocks
  responsiveScale: number;
  children: React.ReactNode;
}

const Block = ({ position, width, height, bgColor, children }: BlockProps) => {
  return (
    <group position={position}>
      <Box args={[width, height, 0.05]}>
        <meshBasicMaterial color={bgColor} />
      </Box>
      {children}
    </group>
  );
};