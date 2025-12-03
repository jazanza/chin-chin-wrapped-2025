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
    <div className={cn("flex flex-col items-center justify-center p-4 border-2 border-white bg-transparent text-white", className)}>
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
            <Block>
              <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                CANTIDAD DE VISITAS
              </p>
              <p className="text-4xl font-black text-center leading-none"> {/* Reduced from text-5xl to text-4xl */}
                {totalVisits}
              </p>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block>
              <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                LITROS PROCESADOS
              </p>
              <p className="text-4xl font-black text-center leading-none"> {/* Reduced from text-5xl to text-4xl */}
                {totalLiters.toFixed(1)} L
              </p>
            </Block>

            {/* Row 2, Column 1: Top 3 Cervezas */}
            <Block>
              <p className="text-sm font-bold text-center mb-1"> {/* Reduced from text-base to text-sm */}
                EL TRÍO FAVORITO
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
            </Block>

            {/* Row 2, Column 2: Variedades Probadas */}
            <Block>
              <div className="flex flex-col items-center justify-center p-[1vw] md:p-2 h-full text-center">
                  <h2 className="text-lg font-black leading-tight mb-2 whitespace-normal"> {/* Reduced from text-xl to text-lg */}
                      {getBeerLevel(uniqueVarieties2025)}
                  </h2>
                  <p className="text-sm font-bold whitespace-normal"> {/* Reduced from text-base to text-sm */}
                      {uniqueVarieties2025} VARIEDADES PROBADAS
                  </p>
                  <p className="text-xs mt-1 whitespace-normal"> {/* Reduced from text-sm to text-xs */}
                      de un total de {totalVarietiesInDb} DISPONIBLES.
                  </p>
              </div>
            </Block>

            {/* Row 3, Column 1: Día Más Activo */}
            <Block>
              <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                EL DÍA QUE TIENES MÁS SED
              </p>
              <p className="text-3xl font-black text-center leading-none"> {/* Reduced from text-4xl to text-3xl */}
                {mostActiveDay.toUpperCase()}
              </p>
            </Block>

            {/* Row 3, Column 2: Logo y Handle de Instagram */}
            <Block>
              <img
                src="/Logo.png"
                alt="Logo Chin Chin"
                className="w-auto max-w-[100px] p-1 mb-2"
              />
              <p className="text-xs font-bold"> {/* Reduced from text-sm to text-xs */}
                @CHINCHIN.CERVEZAS
              </p>
            </Block>
          </div>
        )}
      </div>

      {/* Botón Volver */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
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