import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils'; // For Tailwind class merging
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Download, Home, Loader2 } from 'lucide-react'; // Icons
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
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
  dynamicTitle: string; // NEW: Dynamic title for the customer
}

// Helper component for each grid block (2D HTML/CSS version)
interface BlockProps {
  bgColor: string; // Tailwind background class
  children: React.ReactNode;
}

const Block = ({ bgColor, children }: BlockProps) => {
  // Determine text color based on background color for brutalist contrast
  const textColorClass = bgColor === "bg-black" ? "text-white" : "text-black";
  return (
    <div className={cn("flex flex-col items-center justify-center p-4 border-2 border-white", bgColor, textColorClass)}>
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
  uniqueVarieties2025,
  totalVarietiesInDb,
  mostActiveDay,
  mostActiveMonth,
  textColor, // Keep for main title, but ignore for blocks
  highlightColor, // Keep for main title, but ignore for blocks
  dynamicTitle, // NEW
}: SummaryInfographicProps) => {

  const [isTitleTyped, setIsTitleTyped] = useState(false); // Simulate typing for the main title
  const [isCapturing, setIsCapturing] = useState(false);
  const captureTargetRef = useRef<HTMLDivElement>(null); // Ref for the content to capture
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a delay for the title to appear, similar to typewriter
    const timer = setTimeout(() => setIsTitleTyped(true), 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [customerName, year]);

  // Refactored captureInfographic
  const captureInfographic = useCallback(async (paddingPx: number) => {
    if (!captureTargetRef.current) {
      showError("No se pudo encontrar la infografía para capturar.");
      return null;
    }

    setIsCapturing(true);
    const toastId = showLoading("Preparando imagen...");

    try {
      const html2canvas = (await import('html2canvas')).default;
      const originalCanvas = await html2canvas(captureTargetRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Let the background be captured as rendered
        scale: 2, // High resolution
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = originalCanvas.width + 2 * paddingPx;
      finalCanvas.height = originalCanvas.height + 2 * paddingPx;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = 'black'; // Background color for the final canvas
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(originalCanvas, paddingPx, paddingPx); // Draw original canvas with padding
      }
      return finalCanvas;

    } catch (error) {
      console.error("Error capturing infographic:", error);
      showError("Error al capturar la imagen.");
      return null;
    } finally {
      dismissToast(toastId);
      setIsCapturing(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const canvas = await captureInfographic(15); // 15px padding
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ChinChin_Wrapped_${customerName.replace(/\s/g, '_')}_${year}_Historia.png`; // New filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("¡Descarga completada!");
    }
  }, [captureInfographic, customerName, year]);

  const handleBackToLogin = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start bg-background text-foreground font-sans overflow-auto">
      {/* Main Infographic Content - captureTargetRef now wraps title and grid */}
      <div ref={captureTargetRef} className="flex flex-col items-center justify-start p-3 bg-black w-[90vw] max-w-[500px] h-[80vh] max-h-[888px] aspect-[9/16]">
        {/* Main Infographic Title */}
        <div className="mb-4 text-center">
          {isTitleTyped && (
            <>
              <h1 className={cn("text-[4.5vw] md:text-[2.5rem] lg:text-[3rem] font-black uppercase leading-tight", highlightColor)}>
                {dynamicTitle.toUpperCase()} {/* Use dynamicTitle here */}
              </h1>
              <p className={cn("text-[3vw] md:text-[1.5rem] lg:text-[2rem] font-black uppercase leading-tight", textColor)}>
                {customerName.toUpperCase()} WRAPPED {year}
              </p>
            </>
          )}
        </div>

        {isTitleTyped && (
          <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full border-2 border-white">
            {/* Row 1, Column 1: Total Visitas */}
            <Block bgColor="bg-black">
              <p className="text-xs md:text-sm lg:text-base font-bold text-center">
                CANTIDAD DE VISITAS ESTE {year}
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-center">
                {totalVisits}
              </p>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block bgColor="bg-white">
              <p className="text-xs md:text-sm lg:text-base font-bold text-center">
                LITROS PROCESADOS
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-center">
                {totalLiters.toFixed(1)} L
              </p>
            </Block>

            {/* Row 2, Column 1: Top 3 Cervezas */}
            <Block bgColor="bg-black">
              <p className="text-xs md:text-sm lg:text-base font-bold text-center mb-1">
                EL TRÍO FAVORITO
              </p>
              {top10Products.slice(0, 3).map((product, idx) => ( // Slice to 3 from top10Products
                <p
                  key={idx}
                  className={cn(
                    "text-center leading-tight text-ellipsis overflow-hidden whitespace-nowrap", // Added text overflow handling
                    idx === 0 ? "text-sm md:text-lg lg:text-xl font-black" : "text-xs md:text-sm lg:text-base font-bold"
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
                  <h2 className="text-lg md:text-xl lg:text-2xl font-black leading-tight mb-2">
                      {getBeerLevel(uniqueVarieties2025)}
                  </h2>
                  
                  {/* Métrica de Soporte */}
                  <p className="text-xs md:text-sm lg:text-base font-bold">
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
              <p className="text-xs md:text-sm lg:text-base font-bold text-center">
                EL DÍA QUE TIENES MÁS SED
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-center">
                {mostActiveDay.toUpperCase()}
              </p>
            </Block>

            {/* Row 3, Column 2: Logo y Handle de Instagram */}
            <Block bgColor="bg-black">
              <img
                src="/Logo.png"
                alt="Logo Chin Chin"
                className="w-auto max-w-[100px] p-1 mb-2" // Adjusted to w-auto
              />
              <p className="text-white text-xs md:text-sm lg:text-base font-bold">
                @CHINCHIN.CERVEZAS
              </p>
            </Block>
          </div>
        )}
      </div>

      {/* Nuevo Footer Centrado para Botones */}
      <div className="fixed bottom-0 left-0 right-0 bg-background p-4 flex justify-center space-x-4 z-50 border-t-2 border-white">
          <Button
              onClick={handleBackToLogin}
              className="bg-black text-white font-bold py-2 px-4 border-2 border-white rounded-none transition-none hover:bg-white hover:text-black hover:border-black"
              disabled={isCapturing}
          >
              <Home className="mr-2 h-4 w-4" />
              Volver
          </Button>
          <Button
              onClick={handleDownload}
              className="bg-white text-black font-bold py-2 px-4 border-2 border-black rounded-none transition-none hover:bg-black hover:text-white hover:border-white"
              disabled={isCapturing}
          >
              {isCapturing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                  <Download className="h-4 w-4" />
              )}
              <span className="ml-2 hidden md:inline">Descargar Historia (9:16)</span>
          </Button>
      </div>
    </div>
  );
};