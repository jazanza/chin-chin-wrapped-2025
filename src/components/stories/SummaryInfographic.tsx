import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils'; // For Tailwind class merging
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Home } from 'lucide-react'; // Icons, removed Download
import { useNavigate } from 'react-router-dom'; // For navigation

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
  uniqueVarieties2025: number;
  totalVarietiesInDb: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  textColor: string; // Passed as Tailwind class color
  highlightColor: string; // Passed as Tailwind class color
  dynamicTitle: string; // Prop is kept for consistency, but not used in UI
}

// Helper component for each grid block (2D HTML/CSS version)
interface BlockProps {
  bgColor: string; // Tailwind background class
  children: React.ReactNode;
  className?: string; // Added className for grid spanning
}

const Block = ({ bgColor, children, className }: BlockProps) => {
  // Determine text color based on background color for brutalist contrast
  const textColorClass = bgColor === "bg-black" ? "text-white" : "text-black";
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 border-2 border-white", bgColor, textColorClass, className)}>
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
  top10Products,
  totalVisits,
  uniqueVarieties2025,
  totalVarietiesInDb,
  mostActiveDay,
  textColor,
  highlightColor,
}: SummaryInfographicProps) => {

  const [isTitleTyped, setIsTitleTyped] = useState(false);
  const captureTargetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsTitleTyped(true), 1000);
    return () => clearTimeout(timer);
  }, [customerName, year]);

  const handleBackToLogin = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start bg-background text-foreground font-sans h-screen overflow-y-auto py-10">
      {/* Main Infographic Content */}
      <div ref={captureTargetRef} className="flex flex-col items-center justify-start p-3 bg-black w-[90vw] max-w-[500px] max-h-[75vh] aspect-[9/16]">
        {/* Main Infographic Title - MODIFIED */}
        <div className="mb-4 text-center">
          {isTitleTyped && (
            <>
              <h1 className={cn("text-4xl font-black uppercase leading-tight", highlightColor)}>
                {customerName.toUpperCase()}
              </h1>
              <p className={cn("text-xl font-black uppercase leading-tight", textColor)}>
                WRAPPED {year}
              </p>
            </>
          )}
        </div>

        {isTitleTyped && (
          <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full border-2 border-white">
            {/* Row 1, Column 1: Total Visitas - MODIFIED */}
            <Block bgColor="bg-black">
              <p className="text-base font-bold text-center">
                CANTIDAD DE VISITAS
              </p>
              <p className="text-5xl font-black text-center leading-none"> {/* Changed to text-5xl, added leading-none */}
                {totalVisits}
              </p>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block bgColor="bg-white">
              <p className="text-base font-bold text-center">
                LITROS PROCESADOS
              </p>
              <p className="text-5xl font-black text-center leading-none"> {/* Changed to text-5xl, added leading-none */}
                {totalLiters.toFixed(1)} L
              </p>
            </Block>

            {/* Row 2, Column 1: Top 3 Cervezas */}
            <Block bgColor="bg-black">
              <p className="text-base font-bold text-center mb-1">
                EL TRÍO FAVORITO
              </p>
              {top10Products.slice(0, 3).map((product, idx) => (
                <p
                  key={idx}
                  className={cn(
                    "text-center leading-tight whitespace-normal", // Removed text-ellipsis overflow-hidden whitespace-nowrap
                    idx === 0 ? "text-base font-black" : "text-sm font-bold"
                  )}
                >
                  {`${idx + 1}. ${product.name.toUpperCase()}`}
                </p>
              ))}
            </Block>

            {/* Row 2, Column 2: Variedades Probadas */}
            <Block bgColor="bg-white">
              <div className="flex flex-col items-center justify-center p-[1vw] md:p-2 h-full text-center">
                  <h2 className="text-xl font-black leading-tight mb-2 whitespace-normal">
                      {getBeerLevel(uniqueVarieties2025)}
                  </h2>
                  <p className="text-base font-bold whitespace-normal">
                      {uniqueVarieties2025} VARIEDADES PROBADAS
                  </p>
                  <p className="text-sm mt-1 whitespace-normal">
                      de un total de {totalVarietiesInDb} DISPONIBLES.
                  </p>
              </div>
            </Block>

            {/* Row 3, Column 1: Día Más Activo */}
            <Block bgColor="bg-black">
              <p className="text-base font-bold text-center">
                EL DÍA QUE TIENES MÁS SED
              </p>
              <p className="text-4xl font-black text-center leading-none"> {/* Changed to text-4xl, added leading-none */}
                {mostActiveDay.toUpperCase()}
              </p>
            </Block>

            {/* Row 3, Column 2: Logo y Handle de Instagram */}
            <Block bgColor="bg-black">
              <img
                src="/Logo.png"
                alt="Logo Chin Chin"
                className="w-auto max-w-[100px] p-1 mb-2"
              />
              <p className="text-white text-sm font-bold">
                @CHINCHIN.CERVEZAS
              </p>
            </Block>
          </div>
        )}
      </div>

      {/* Botón Volver */}
      <div className="mt-6"> {/* Added margin-top to separate from infographic */}
          <Button
              onClick={handleBackToLogin}
              className="bg-black text-white font-bold py-2 px-4 border-2 border-white rounded-none transition-none hover:bg-white hover:text-black hover:border-black"
          >
              <Home className="mr-2 h-4 w-4" />
              Volver
          </Button>
      </div>
    </div>
  );
};