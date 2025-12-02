import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils'; // For Tailwind class merging
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Download, Share2, Home, Loader2 } from 'lucide-react'; // Icons
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

  const captureInfographic = useCallback(async (targetRatio: number, paddingPx: number) => {
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
      });

      const originalWidth = originalCanvas.width;
      const originalHeight = originalCanvas.height;

      // Calculate new canvas dimensions to fit content + padding with target aspect ratio
      const paddedContentWidth = originalWidth + 2 * paddingPx;
      const paddedContentHeight = originalHeight + 2 * paddingPx;
      const paddedContentAspectRatio = paddedContentWidth / paddedContentHeight;

      let newCanvasWidth: number;
      let newCanvasHeight: number;

      if (paddedContentAspectRatio > targetRatio) { // Content is wider than target aspect ratio
        newCanvasWidth = paddedContentWidth;
        newCanvasHeight = newCanvasWidth / targetRatio;
      } else { // Content is taller or same aspect ratio as target
        newCanvasHeight = paddedContentHeight;
        newCanvasWidth = newCanvasHeight * targetRatio;
      }

      const newCanvas = document.createElement('canvas');
      newCanvas.width = newCanvasWidth;
      newCanvas.height = newCanvasHeight;
      const ctx = newCanvas.getContext('2d');

      if (ctx) {
        // Fill with black background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        // Calculate scale factor to draw original content within padding
        const availableWidth = newCanvasWidth - 2 * paddingPx;
        const availableHeight = newCanvasHeight - 2 * paddingPx;
        const scaleX = availableWidth / originalWidth;
        const scaleY = availableHeight / originalHeight;
        const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure content fits

        const drawWidth = originalWidth * scale;
        const drawHeight = originalHeight * scale;

        // Calculate position to center the scaled original content
        const drawX = (newCanvasWidth - drawWidth) / 2;
        const drawY = (newCanvasHeight - drawHeight) / 2;

        ctx.drawImage(originalCanvas, drawX, drawY, drawWidth, drawHeight);
      }
      return newCanvas;

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
    const canvas = await captureInfographic(16 / 9, 30); // 16:9 aspect ratio, 30px padding
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `ChinChin_Wrapped_${customerName.replace(/\s/g, '_')}_${year}_Infografia.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("¡Descarga completada!");
    }
  }, [captureInfographic, customerName, year]);

  const handleShareToInstagram = useCallback(async () => {
    const canvas = await captureInfographic(9 / 16, 20); // 9:16 aspect ratio, 20px padding
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `ChinChin_Wrapped_${customerName.replace(/\s/g, '_')}_${year}_Story.png`, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: `Mi Chin Chin Wrapped ${year}`,
                text: `¡Mira mi resumen cervecero de ${year} en Chin Chin!`,
                files: [file],
              });
              showSuccess("¡Compartido con éxito!");
            } catch (error: any) {
              console.error("Error al compartir:", error);
              showError("No se pudo compartir directamente. La imagen se descargará automáticamente.");
              // Fallback to download if share fails
              const dataUrl = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `ChinChin_Wrapped_${customerName.replace(/\s/g, '_')}_${year}_Story.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } else {
            showError("Tu navegador no soporta la función de compartir directamente. La imagen se descargará automáticamente.");
            // Fallback to download
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `ChinChin_Wrapped_${customerName.replace(/\s/g, '_')}_${year}_Story.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      }, 'image/png');
    }
  }, [captureInfographic, customerName, year]);

  const handleBackToLogin = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-start bg-background text-foreground p-4 font-sans overflow-auto">
      {/* Main Infographic Content - captureTargetRef now wraps title and grid */}
      <div ref={captureTargetRef} className="flex flex-col items-center justify-center w-full h-full">
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
          <div className="grid grid-cols-2 grid-rows-3 gap-2 w-[90vw] h-[80vh] max-w-[900px] max-h-[1600px] aspect-[9/16] border-2 border-white">
            {/* Row 1, Column 1: Total Visitas */}
            <Block bgColor="bg-black">
              <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center">
                CANTIDAD DE VISITAS ESTE {year}
              </p>
              <p className="text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center">
                {totalVisits}
              </p>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block bgColor="bg-white">
              <p className="text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold text-center">
                LITROS PROCESADOS
              </p>
              <p className="text-[6vw] md:text-[3rem] lg:text-[4rem] font-black text-center">
                {totalLiters.toFixed(1)} L
              </p>
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

            {/* Row 3, Column 2: Logo y Handle de Instagram */}
            <Block bgColor="bg-black">
              <img
                src="/Logo.png"
                alt="Logo Chin Chin"
                className="w-[15vw] max-w-[100px] p-1 mb-2" // Ajustar tamaño del logo para la celda
              />
              <p className="text-white text-[2.5vw] md:text-[1.2rem] lg:text-[1.5rem] font-bold">
                @CHINCHIN.CERVEZAS
              </p>
            </Block>
          </div>
        )}
      </div>

      {/* Nuevo Footer Centrado para Botones */}
      <div className="fixed bottom-0 left-0 right-0 bg-background p-4 flex justify-center space-x-4 z-50 border-t-2 border-white">
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
              <span className="ml-2 hidden md:inline">Descargar</span>
          </Button>
          <Button
              onClick={handleShareToInstagram}
              className="bg-white text-black font-bold py-2 px-4 border-2 border-black rounded-none transition-none hover:bg-black hover:text-white hover:border-white"
              disabled={isCapturing}
          >
              {isCapturing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                  <Share2 className="h-4 w-4" />
              )}
              <span className="ml-2 hidden md:inline">Compartir IG</span>
          </Button>
          <Button
              onClick={handleBackToLogin}
              className="bg-black text-white font-bold py-2 px-4 border-2 border-white rounded-none transition-none hover:bg-white hover:text-black hover:border-black"
              disabled={isCapturing}
          >
              <Home className="mr-2 h-4 w-4" />
              Inicio
          </Button>
      </div>
    </div>
  );
};