import React, { useRef, useState, useEffect } from 'react';
import { Text, Box, Image } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { TypewriterText } from '../TypewriterText';

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
}

export const SummaryInfographic = ({
  customerName,
  year,
  totalLiters,
  dominantBeerCategory,
  top5Products,
  totalVisits,
  isPaused,
}: SummaryInfographicProps) => {
  const { viewport } = useThree();
  const BASE_REFERENCE_WIDTH = 12;
  const responsiveScale = Math.min(1, viewport.width / BASE_REFERENCE_WIDTH);

  // Define overall infographic dimensions based on viewport, not fixed ratio
  // Let's aim for a layout that fills the screen but respects padding/margins
  const infographicWidth = viewport.width * 0.8; // Use 80% of viewport width
  const infographicHeight = viewport.height * 0.8; // Use 80% of viewport height

  // Calculate block dimensions for a 2x3 grid
  const blockWidth = infographicWidth / 2;
  const blockHeight = infographicHeight / 3;

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const [isSubTitleTyped, setIsSubTitleTyped] = useState(false);

  useEffect(() => {
    setIsTitleTyped(false);
    setIsSubTitleTyped(false);
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

  return (
    <group position={[0, 0, 0]}>
      {/* Main Infographic Title */}
      <TypewriterText
        text={customerName.toUpperCase()}
        speed={75}
        onComplete={() => setIsTitleTyped(true)}
        isPaused={isPaused}
        position={[0, infographicHeight / 2 + 0.5 * responsiveScale, 0]}
        fontSize={Math.min(viewport.width * 0.06, 0.6) * responsiveScale}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02 * responsiveScale}
        outlineColor="#000000"
        maxWidth={infographicWidth * 0.9}
        textAlign="center"
        letterSpacing={-0.05}
        fontWeight={900}
      />
      {isTitleTyped && (
        <TypewriterText
          text={`${year} WRAPPED`}
          speed={75}
          onComplete={() => setIsSubTitleTyped(true)}
          isPaused={isPaused}
          position={[0, infographicHeight / 2 + 0.1 * responsiveScale, 0]}
          fontSize={Math.min(viewport.width * 0.06, 0.4) * responsiveScale}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01 * responsiveScale}
          outlineColor="#000000"
          maxWidth={infographicWidth * 0.9}
          textAlign="center"
          letterSpacing={-0.05}
          fontWeight={900}
        />
      )}

      {isSubTitleTyped && (
        <group position={[0, -0.5 * responsiveScale, 0]}> {/* Adjust group position to center the grid */}
          {/* Row 1, Column 1: Customer Name */}
          <Block
            position={getBlockPosition(1, 1)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#000000"
            textColor="#FFFFFF"
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.05, 0.3) * responsiveScale}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {customerName.toUpperCase()}
            </Text>
          </Block>

          {/* Row 1, Column 2: Total Visits */}
          <Block
            position={getBlockPosition(1, 2)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#FFFFFF"
            textColor="#000000"
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.1, 0.8) * responsiveScale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              position={[0, 0.2 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {totalVisits}
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.2 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              DÍAS DE LEALTAD
            </Text>
          </Block>

          {/* Row 2, Column 1: Total Liters */}
          <Block
            position={getBlockPosition(2, 1)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#000000"
            textColor="#FFFFFF"
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.1, 0.8) * responsiveScale}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, 0.2 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {totalLiters.toFixed(1)}
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.2 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              LITROS CONSUMIDOS
            </Text>
          </Block>

          {/* Row 2, Column 2: Dominant Beer Category */}
          <Block
            position={getBlockPosition(2, 2)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#FFFFFF"
            textColor="#000000"
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.05, 0.3) * responsiveScale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {dominantBeerCategory.toUpperCase()}
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.3 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              CERVEZA DOMINANTE
            </Text>
          </Block>

          {/* Row 3, Column 1: Top 1 Cerveza */}
          <Block
            position={getBlockPosition(3, 1)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#000000"
            textColor="#FFFFFF"
            responsiveScale={responsiveScale}
          >
            <Text
              fontSize={Math.min(viewport.width * 0.04, 0.25) * responsiveScale}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, 0.2 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {top1Product.name.toUpperCase()}
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.15) * responsiveScale}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.1 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              {top1Product.liters.toFixed(1)} L
            </Text>
            <Text
              fontSize={Math.min(viewport.width * 0.025, 0.12) * responsiveScale}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.3 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={700}
            >
              TU TOP 1
            </Text>
          </Block>

          {/* Row 3, Column 2: Logo + Year */}
          <Block
            position={getBlockPosition(3, 2)}
            width={blockWidth}
            height={blockHeight}
            bgColor="#FFFFFF"
            textColor="#000000"
            responsiveScale={responsiveScale}
          >
            <Image
              url="/Logo.png"
              position={[0, 0.2 * responsiveScale, 0.01]}
              scale-x={blockWidth * 0.5}
              scale-y={blockWidth * 0.5 * (1000 / 1000)}
              scale-z={1}
              transparent
            />
            <Text
              fontSize={Math.min(viewport.width * 0.03, 0.2) * responsiveScale}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              position={[0, -0.3 * responsiveScale, 0]}
              maxWidth={blockWidth * 0.8}
              textAlign="center"
              letterSpacing={-0.05}
              fontWeight={900}
            >
              {year} WRAPPED
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
  textColor: string;
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