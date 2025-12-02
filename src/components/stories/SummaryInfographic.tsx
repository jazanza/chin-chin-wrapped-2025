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
  top10Products: Product[]; // Changed from top3Products to top10Products
  totalVisits: number;
  isPaused: boolean; // Not directly used in 2D, but kept for consistency
  // REMOVED: totalVisits2024: number;
  // REMOVED: totalLiters2024: number;
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  textColor: string; // Passed as Tailwind class color
  highlightColor: string; // Passed as Tailwind class color
  dynamicTitle: string; // NEW: Dynamic title for the customer
}

// REMOVED: ComparisonText component

// Helper component for each grid block (2D HTML/CSS version)
interface BlockProps {
  bgColor: string; // Tailwind background class
  children: React.ReactNode;
}

const Block = ({ bgColor, children }: BlockProps) => {
  // Determine text color based on background color for brutalist contrast
  const textColorClass = bgColor === "bg-black" ? "text-white" : "text-black";
  return (
    <div className={cn("flex flex-col items-center justify-center p-[1vw] md:p-2 border-2 border-white", bgColor, textColorClass)}>
      {children}
    </div>
  );
};

// Función Helper para calcular el nivel de cerveza
const getBeerLevel = (uniqueVarietiesCount: number): string => {
  if (uniqueVarietiesCount >= 80) return "LEYENDA ABSOLUTA (¡ES HORA DE DEJAR TU CV!)";
  if (uniqueVarietiesCount >= 60) return "Maestro Cervecero (El que Nos Enseña)";
  if (uniqueVarietiesCount >= 40) return "Coleccionista de Sabores (Conocedor de la Barra)";
  if (uniqueVarietiesCount >= 20) return "Explorador de Cervezas (El que Pide Sugerencias)";
  if (uniqueVarietiesCount >= 10) return "Curioso del Lúpulo (Recién Bautizado)";
  return "Novato en la Barra";
};

export const SummaryInfographic = ({
  customerName,
  year,
  totalLiters,
  dominantBeerCategory,
  top10Products, // Changed from top3Products to top10Products
  totalVisits,
  // REMOVED: totalVisits2024,
  // REMOVED: totalLiters2024,
  uniqueVarieties2025,
  totalVarietiesInDb,
  mostActiveDay,
  mostActiveMonth,
  textColor, // Keep for main title, but ignore for blocks
  highlightColor, // Keep for main title, but ignore for blocks
  dynamicTitle, // NEW
}: SummaryInfographicProps) => {

  const [isTitleTyped, setIsTitleTyped] = useState(false); // Simulate typing for the main title

  useEffect(() => {
    // Simulate a delay for the title to appear, similar to typewriter
    const timer = setTimeout(() => setIsTitleTyped(true), 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [customerName, year]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background text-foreground p-4 font-sans overflow-auto">
      {/* Main Infographic Title */}
      <div className="mb-4 text-center">
        {isTitleTyped && (
          <>
            <h1 className={cn("text-[6vw] md:text-[3rem] lg:text-[4rem] font-black uppercase leading-tight", highlightColor)}>
              {dynamicTitle.toUpperCase()} {/* Use dynamicTitle here */}
            </h1>
            <p className={cn("text-[4vw] md:text-[2rem] lg:text-[2.5rem] font-black uppercase leading-tight", textColor)}>
              {customerName.toUpperCase()} WRAPPED {year}
            </p>
          </>
        )}
      </div>

      {isTitleTyped && (
        <div className="grid grid-cols-2 grid-rows-3 gap-2 w-[90vw] h-[80vh] max-w-[900px] max-h-[1600px] aspect-[9/16] border-2 border-white">
          {/* Row 1, Column 1: Total Visitas */}
          <Block bgColor="bg-black">
            <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center">
              CANTIDAD DE VISITAS ESTE {year}
            </p>
            <p className="text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center">
              {totalVisits}
            </p>
            {/* REMOVED: <ComparisonText current={totalVisits} previous={totalVisits2024} year={year} /> */}
          </Block>

          {/* Row 1, Column 2: Total Litros */}
          <Block bgColor="bg-white">
            <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center">
              LITROS PROCESADOS
            </p>
            <p className="text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center">
              {totalLiters.toFixed(1)} L
            </p>
            {/* REMOVED: <ComparisonText current={totalLiters} previous={totalLiters2024} year={year} /> */}
          </Block>

          {/* Row 2, Column 1: Top 3 Cervezas */}
          <Block bgColor="bg-black">
            <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center mb-1">
              EL TRÍO FAVORITO
            </p>
            {top10Products.slice(0, 3).map((product, idx) => ( // Slice to 3 from top10Products
              <p
                key={idx}
                className={cn(
                  "text-center leading-tight",
                  idx === 0 ? "text-[3.5vw] md:text-[1.5rem] lg:text-[2rem] font-black" : "text-[2vw] md:text-[1rem] lg:text-[1.2rem] font-bold"
                )}
              >
                {`${idx + 1}. ${product.name.toUpperCase()} (${product.liters.toFixed(1)} L)`}
              </p>
            ))}
          </Block>

          {/* Row 2, Column 2: Variedades Probadas (Ahora con Nivel Dinámico) */}
          <Block bgColor="bg-white">
            <div className="flex flex-col items-center justify-center p-[1vw] md:p-2 h-full text-center">
                {/* Título Dinámico del Nivel */}
                <h2 className="text-[4vw] md:text-[2rem] lg:text-[2.5rem] font-black leading-tight mb-2">
                    {getBeerLevel(uniqueVarieties2025)}
                </h2>
                
                {/* Métrica de Soporte */}
                <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold">
                    {uniqueVarieties2025} VARIEDADES PROBADAS
                </p>
                
                {/* Comparación (Total disponible) */}
                <p className="text-[1.5vw] md:text-[0.8rem] lg:text-[1rem] mt-1">
                    de un total de {totalVarietiesInDb} DISPONIBLES.
                </p>
            </div>
          </Block>

          {/* Row 3, Column 1: Día Más Activo */}
          <Block bgColor="bg-black">
            <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center">
              EL DÍA QUE TIENES MÁS SED
            </p>
            <p className="text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center">
              {mostActiveDay.toUpperCase()}
            </p>
          </Block>

          {/* Row 3, Column 2: Logo */}
          <Block bgColor="bg-black"> {/* Changed to bg-black */}
            <img
              src="/Logo.png"
              alt="Logo Chin Chin"
              className="w-[15vw] max-w-[100px] p-1" // Ajustar tamaño del logo para la celda
            />
          </Block>
        </div>
      )}
    </div>
  );
};