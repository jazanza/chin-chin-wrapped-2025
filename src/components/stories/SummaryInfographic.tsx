import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils'; // For Tailwind class merging
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Home } from 'lucide-react'; // Icons, removed Download
import { useNavigate } from 'react-router-dom'; // For navigation
// Removed html2canvas import

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
    <div className={cn("flex flex-col items-center justify-center p-4 border-2 border-white bg-transparent text-white h-full", className)}>
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
  // Removed captureTargetRef
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsTitleTyped(true), 1000);
    return () => clearTimeout(timer);
  }, [customerName, year]);

  const handleBackToLogin = useCallback(() => {
    console.log("Navegando a la página de login..."); // Added console.log
    navigate('/');
  }, [navigate]);

  // Removed handleDownloadScreenshot

  return (
    <div className={cn("absolute inset-0 flex flex-col items-center justify-start text-foreground font-sans h-full w-full p-6 bg-black")}> {/* Fondo fijo negro */}
      {/* Main Infographic Content */}
      <div className="flex flex-col items-center justify-center pt-[30px] p-2 w-[90vw] max-w-[500px] max-h-[95vh] bg-black"> {/* Añadido pt-[30px] */}
        {/* Main Infographic Title - MODIFIED */}
        <div className="mb-4 text-center">
          {isTitleTyped && (
            <>
              <h1 className={cn("text-4xl font-black uppercase leading-tight", highlightColor)}>
                {customerName.toUpperCase()}
              </h1>
              <p className={cn("text-xl font-black uppercase leading-tight", textColor)}>
                CHIN CHIN WRAPPED {year}
              </p>
            </>
          )}
        </div>

        {isTitleTyped && (
          <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full"> {/* Cambiado gap-1 a gap-2 y eliminado border-2 border-white */}
            {/* Row 1, Column 1: Total Visitas - MODIFIED */}
            <Block>
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                  VISITAS:
                </p>
                <p className="text-4xl font-black text-center leading-none"> {/* Reduced from text-5xl to text-4xl */}
                  {totalVisits}
                </p>
              </div>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block>
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                  LITROS TOMADOS:
                </p>
                <p className="text-4xl font-black text-center leading-none"> {/* Reduced from text-5xl to text-4xl */}
                  {totalLiters.toFixed(1)}
                </p>
              </div>
            </Block>

            {/* Row 2, Column 1: Top 3 Cervezas */}
            <Block>
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-sm font-bold text-center mb-1"> {/* Reduced from text-base to text-sm */}
                  TOP 3:
                </p>
                {top10Products.slice(0, 3).map((product, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      "text-center leading-tight whitespace-normal",
                      idx === 0 ? "text-sm font-black" : "text-xs font-bold" // Reduced from text-base to text-sm, and text-sm to text-xs
                    )}
                  >
                    {`${idx + 1}. ${product.name.toUpperCase()}`}
                  </p>
                ))}
              </div>
            </Block>

            {/* Row 2, Column 2: Variedades Probadas */}
            <Block>
              <div className="flex flex-col items-center justify-center p-[1vw] md:p-2 h-full text-center">
                  <h2 className="text-lg font-black leading-tight mb-2 whitespace-normal"> {/* Reduced from text-xl to text-lg */}
                      {getBeerLevel(uniqueVarieties2025)}
                  </h2>
                  <p className="text-sm font-bold whitespace-normal"> {/* Reduced from text-base to text-sm */}
                      TOMASTE {uniqueVarieties2025} CERVEZAS
                  </p>
                  <p className="text-xs mt-1 whitespace-normal"> {/* Reduced from text-sm to text-xs */}
                      DE {totalVarietiesInDb} VARIEDADES.
                  </p>
              </div>
            </Block>

            {/* Row 3, Column 1: Día Más Activo */}
            <Block>
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                  DÍA FAVORITO:
                </p>
                <p className="text-3xl font-black text-center leading-none"> {/* Reduced from text-4xl to text-3xl */}
                  {mostActiveDay.toUpperCase()}
                </p>
              </div>
            </Block>

            {/* Row 3, Column 2: Logo y Handle de Instagram */}
            <Block>
              <div className="flex flex-col items-center justify-center h-full w-full">
                <img
                  src="/Logo.png"
                  alt="Logo Chin Chin"
                  className="w-auto max-w-[75px] p-1 mb-2"
                />
                <p className="text-xs font-bold"> {/* Reduced from text-sm to text-xs */}
                  @CHINCHIN.CERVEZAS
                </p>
              </div>
            </Block>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-4"> {/* Ajustado bottom-12 a bottom-4 */}
          <Button
              onClick={handleBackToLogin}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:text-black"
          >
              <Home className="h-7 w-7" />
          </Button>
          {/* Removed Download Button */}
      </div>
    </div>
  );
};