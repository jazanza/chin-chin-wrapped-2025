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
  children: React.ReactNode;
  className?: string; // Added className for grid spanning
}

const Block = ({ children, className }: BlockProps) => {
  // All blocks will now have transparent background, white border, and white text
  return (
    <div className={cn("flex flex-col items-center justify-center p-2 border-2 border-white bg-transparent text-white", className)}> {/* Reduced padding */}
      {children}
    </div>
  );
};

// Función Helper para calcular el nivel de cerveza
const getBeerLevel = (uniqueVarietiesCount: number): string => {
  if (uniqueVarietiesCount >= 80) return "LEYENDA ABSOLUTA";
  if (uniqueVarietiesCount >= 60) return "MAESTRO CERVECERO";
  if (uniqueVarietiesCount >= 40) return "COLECCIONAS DE SABORES";
  if (uniqueVarietiesCount >= 20) return "EXPORADOR DE CERVEZAS";
  if (uniqueVarietiesCount >= 10) return "CURIOSO DEL LÚPULO";
  return "NOVATO EN LA BARRA";
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
    console.log("Navegando a la página de login..."); // Added console.log
    navigate('/');
  }, [navigate]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between bg-background text-foreground font-sans h-screen overflow-y-auto py-8"> {/* Changed justify-start to justify-between, added py-8 */}
      {/* Main Infographic Content */}
      <div ref={captureTargetRef} className="flex flex-col items-center justify-between p-3 bg-black w-[90vw] max-w-[500px] max-h-[75vh] aspect-[9/16]"> {/* Changed justify-start to justify-between */}
        {/* Main Infographic Title - MODIFIED */}
        <div className="mb-4 text-center">
          {isTitleTyped && (
            <>
              <h1 className={cn("text-3xl sm:text-4xl font-black uppercase leading-tight", highlightColor)}> {/* Adjusted text size */}
                {customerName.toUpperCase()}
              </h1>
              <p className={cn("text-lg sm:text-xl font-black uppercase leading-tight", textColor)}> {/* Adjusted text size */}
                CHIN CHIN WRAPPED {year}
              </p>
            </>
          )}
        </div>

        {isTitleTyped && (
          <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full border-2 border-white">
            {/* Row 1, Column 1: Total Visitas - MODIFIED */}
            <Block>
              <p className="text-xs sm:text-sm font-bold text-center"> {/* Adjusted text size */}
                VISITAS:
              </p>
              <p className="text-3xl sm:text-4xl font-black text-center leading-none"> {/* Adjusted text size */}
                {totalVisits}
              </p>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block>
              <p className="text-xs sm:text-sm font-bold text-center"> {/* Adjusted text size */}
                LITROS TOMADOS:
              </p>
              <p className="text-3xl sm:text-4xl font-black text-center leading-none"> {/* Adjusted text size */}
                {totalLiters.toFixed(1)}
              </p>
            </Block>

            {/* Row 2, Column 1: Top 3 Cervezas */}
            <Block>
              <p className="text-xs sm:text-sm font-bold text-center mb-1"> {/* Adjusted text size */}
                TOP 3:
              </p>
              {top10Products.slice(0, 3).map((product, idx) => (
                <p
                  key={idx}
                  className={cn(
                    "text-center leading-tight whitespace-normal",
                    idx === 0 ? "text-xs sm:text-sm font-black" : "text-[0.6rem] sm:text-xs font-bold" // Adjusted text size
                  )}
                >
                  {`${idx + 1}. ${product.name.toUpperCase()}`}
                </p>
              ))}
            </Block>

            {/* Row 2, Column 2: Variedades Probadas */}
            <Block>
              <div className="flex flex-col items-center justify-center p-[1vw] md:p-2 h-full text-center">
                  <h2 className="text-base sm:text-lg font-black leading-tight mb-2 whitespace-normal"> {/* Adjusted text size */}
                      {getBeerLevel(uniqueVarieties2025)}
                  </h2>
                  <p className="text-xs sm:text-sm font-bold whitespace-normal"> {/* Adjusted text size */}
                      TOMASTE {uniqueVarieties2025} CERVEZAS
                  </p>
                  <p className="text-[0.6rem] sm:text-xs mt-1 whitespace-normal"> {/* Adjusted text size */}
                      DE {totalVarietiesInDb} VARIEDADES.
                  </p>
              </div>
            </Block>

            {/* Row 3, Column 1: Día Más Activo */}
            <Block>
              <p className="text-xs sm:text-sm font-bold text-center"> {/* Adjusted text size */}
                DÍA FAVORITO:
              </p>
              <p className="text-2xl sm:text-3xl font-black text-center leading-none"> {/* Adjusted text size */}
                {mostActiveDay.toUpperCase()}
              </p>
            </Block>

            {/* Row 3, Column 2: Logo y Handle de Instagram */}
            <Block>
              <img
                src="/Logo.png"
                alt="Logo Chin Chin"
                className="w-auto max-w-[75px] p-1 mb-2"
              />
              <p className="text-[0.6rem] sm:text-xs font-bold"> {/* Adjusted text size */}
                @CHINCHIN.CERVEZAS
              </p>
            </Block>
          </div>
        )}
      </div>

      {/* Botón Volver */}
      <div className="relative bottom-0 z-30"> {/* Adjusted positioning */}
          <Button
              onClick={handleBackToLogin}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:text-black"
          >
              <Home className="h-7 w-7" />
          </Button>
      </div>
    </div>
  );
};