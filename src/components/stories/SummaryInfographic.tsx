import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils'; // For Tailwind class merging

interface Product {
  name: string;
  liters: number;
  color?: string; // Color is not used in 2D, but kept for type consistency
}

interface SummaryInfographicProps {
  customerName: string;
  year: string;
  totalLiters: number;
  dominantBeerCategory: string;
  top5Products: Product[];
  totalVisits: number;
  isPaused: boolean; // Not directly used in 2D, but kept for consistency
  totalVisits2024: number;
  totalLiters2024: number;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  textColor: string; // Passed as Tailwind class color
  highlightColor: string; // Passed as Tailwind class color
}

// Helper for comparison text and arrow (2D HTML/CSS version)
const ComparisonText = ({ current, previous, year, textColor }: { current: number; previous: number; year: string; textColor: string }) => {
  if (previous === 0) {
    return (
      <p className={cn("text-[1.5vw] md:text-[0.8rem] lg:text-[1rem] font-normal text-center", textColor)}>
        No data for {parseInt(year) - 1}
      </p>
    );
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = percentage >= 0;
  const colorClass = isPositive ? "text-green-500" : "text-red-500"; // Using Tailwind's default green/red for comparison

  return (
    <p className={cn("text-[1.5vw] md:text-[0.8rem] lg:text-[1rem] font-bold text-center", colorClass)}>
      {`${isPositive ? '▲ +' : '▼ '}${percentage.toFixed(1)}% vs. ${parseInt(year) - 1}`}
    </p>
  );
};

// Helper component for each grid block (2D HTML/CSS version)
interface BlockProps {
  bgColor: string; // Tailwind background class
  textColor: string; // Tailwind text class
  children: React.ReactNode;
}

const Block = ({ bgColor, textColor, children }: BlockProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-[1vw] md:p-2 border-2 border-white", bgColor)}>
      {children}
    </div>
  );
};

export const SummaryInfographic = ({
  customerName,
  year,
  totalLiters,
  dominantBeerCategory,
  top5Products,
  totalVisits,
  totalVisits2024,
  totalLiters2024,
  uniqueVarieties2025,
  totalVarietiesInDb,
  mostActiveDay,
  mostActiveMonth,
  textColor,
  highlightColor,
}: SummaryInfographicProps) => {

  const [isTitleTyped, setIsTitleTyped] = useState(false); // Simulate typing for the main title

  useEffect(() => {
    // Simulate a delay for the title to appear, similar to typewriter
    const timer = setTimeout(() => setIsTitleTyped(true), 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [customerName, year]);

  // Get the top 1 product, or a placeholder if none
  const top1Product = top5Products.length > 0 ? top5Products[0] : { name: "N/A", liters: 0 };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background text-foreground p-4 font-sans overflow-auto">
      {/* Main Infographic Title */}
      <div className="mb-4 text-center">
        {isTitleTyped && (
          <>
            <h1 className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black uppercase leading-tight", highlightColor)}>
              {customerName.toUpperCase()}
            </h1>
            <p className={cn("text-[4vw] md:text-[2rem] lg:text-[2.5rem] font-black uppercase leading-tight", textColor)}>
              {year} WRAPPED
            </p>
          </>
        )}
      </div>

      {isTitleTyped && (
        <div className="grid grid-cols-2 grid-rows-3 gap-2 w-[90vw] h-[80vh] max-w-[900px] max-h-[1600px] aspect-[9/16] border-2 border-white">
          {/* Row 1, Column 1: Total Visitas */}
          <Block bgColor="bg-black" textColor="text-white">
            <p className={cn("text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center", textColor)}>
              VISITAS {year}
            </p>
            <p className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center", highlightColor)}>
              {totalVisits}
            </p>
            <ComparisonText current={totalVisits} previous={totalVisits2024} year={year} textColor={textColor} />
          </Block>

          {/* Row 1, Column 2: Total Litros */}
          <Block bgColor="bg-white" textColor="text-black">
            <p className={cn("text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center", textColor)}>
              LITROS CONSUMIDOS
            </p>
            <p className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center", highlightColor)}>
              {totalLiters.toFixed(1)} L
            </p>
            <ComparisonText current={totalLiters} previous={totalLiters2024} year={year} textColor={textColor} />
          </Block>

          {/* Row 2, Column 1: Top 5 Cervezas */}
          <Block bgColor="bg-black" textColor="text-white">
            <p className={cn("text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center mb-1", textColor)}>
              TUS 5 FAVORITAS
            </p>
            {top5Products.slice(0, 5).map((product, idx) => (
              <p
                key={idx}
                className={cn(
                  "text-center leading-tight",
                  idx === 0 ? cn("text-[3.5vw] md:text-[1.5rem] lg:text-[2rem] font-black", highlightColor) : cn("text-[2vw] md:text-[1rem] lg:text-[1.2rem] font-bold", textColor)
                )}
              >
                {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} L)`}
              </p>
            ))}
          </Block>

          {/* Row 2, Column 2: Variedades Probadas */}
          <Block bgColor="bg-white" textColor="text-black">
            <p className={cn("text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center", textColor)}>
              COLECCIONISTA DE SABORES
            </p>
            <p className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center", highlightColor)}>
              {`${uniqueVarieties2025} / ${totalVarietiesInDb}`}
            </p>
            <p className={cn("text-[2vw] md:text-[1rem] lg:text-[1.2rem] font-bold text-center", textColor)}>
              VARIEDADES PROBADAS
            </p>
          </Block>

          {/* Row 3, Column 1: Día Más Activo */}
          <Block bgColor="bg-black" textColor="text-white">
            <p className={cn("text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center", textColor)}>
              DÍA MÁS CHIN CHIN
            </p>
            <p className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center", highlightColor)}>
              {mostActiveDay.toUpperCase()}
            </p>
          </Block>

          {/* Row 3, Column 2: Mes Más Activo */}
          <Block bgColor="bg-white" textColor="text-black">
            <p className={cn("text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center", textColor)}>
              EL MES DE LA SED
            </p>
            <p className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center", highlightColor)}>
              {mostActiveMonth.toUpperCase()}
            </p>
          </Block>
        </div>
      )}
    </div>
  );
};