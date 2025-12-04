import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils'; // For Tailwind class merging
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Home, Download } from 'lucide-react'; // Icons, added Download
import { useNavigate } from 'react-router-dom'; // For navigation
import html2canvas from 'html2canvas'; // Import html2canvas

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
  if (uniqueVarietiesCount >= 80) return "LEYENDA ABSOLUTA";
  if (uniqueVarietiesCount >= 60) return "MAESTRO CERVECERO";
  if (uniqueVarietiesCount >= 40) return "COLECCIONAS DE SABORES";
  if (uniqueVarietiesCount >= 20) return "EXPORADOR DE CERVEZAS";
  if (uniqueVarietiesCount >= 10) return "CURIOSO DEL LÚPULO";
  return "NOVATO EN LA BARRA";
};

const SOFT_BACKGROUND_COLORS = [
  "bg-indigo-50",
  "bg-sky-50",
  "bg-emerald-50",
  "bg-rose-50",
  "bg-amber-50",
];

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
  const [dynamicBg, setDynamicBg] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SOFT_BACKGROUND_COLORS.length);
    setDynamicBg(SOFT_BACKGROUND_COLORS[randomIndex]);

    const timer = setTimeout(() => setIsTitleTyped(true), 1000);
    return () => clearTimeout(timer);
  }, [customerName, year]);

  const handleBackToLogin = useCallback(() => {
    console.log("Navegando a la página de login..."); // Added console.log
    navigate('/');
  }, [navigate]);

  const handleDownloadScreenshot = useCallback(async () => {
    if (captureTargetRef.current) {
      // Add a temporary padding div to the body for the screenshot
      const paddingDiv = document.createElement('div');
      paddingDiv.style.padding = '20px';
      paddingDiv.style.backgroundColor = 'black'; // Match infographic background
      paddingDiv.style.display = 'inline-block'; // To wrap content
      paddingDiv.style.position = 'absolute';
      paddingDiv.style.top = '0';
      paddingDiv.style.left = '0';
      paddingDiv.style.zIndex = '-1'; // Hide it visually

      // Clone the target element to capture it with padding
      const clonedElement = captureTargetRef.current.cloneNode(true) as HTMLElement;
      clonedElement.style.width = captureTargetRef.current.offsetWidth + 'px'; // Ensure correct width
      clonedElement.style.height = captureTargetRef.current.offsetHeight + 'px'; // Ensure correct height
      clonedElement.style.margin = '0'; // Remove any external margins
      clonedElement.style.transform = 'none'; // Remove any transforms that might affect capture

      paddingDiv.appendChild(clonedElement);
      document.body.appendChild(paddingDiv);

      try {
        const canvas = await html2canvas(paddingDiv, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#000000', // Ensure black background for padding
          scale: 2, // Increase scale for better quality
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `ChinChinWrapped_${customerName.replace(/\s/g, '')}_${year}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error al generar la captura de pantalla:", error);
        // Optionally show an error toast
      } finally {
        document.body.removeChild(paddingDiv); // Clean up the temporary div
      }
    }
  }, [customerName, year]);


  return (
    <div className={cn("absolute inset-0 flex flex-col items-center justify-start text-foreground font-sans h-full w-full p-6", dynamicBg)}>
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
                CHIN CHIN WRAPPED {year}
              </p>
            </>
          )}
        </div>

        {isTitleTyped && (
          <div className="grid grid-cols-2 grid-rows-3 gap-2 w-full h-full border-2 border-white">
            {/* Row 1, Column 1: Total Visitas - MODIFIED */}
            <Block>
              <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                VISITAS:
              </p>
              <p className="text-4xl font-black text-center leading-none"> {/* Reduced from text-5xl to text-4xl */}
                {totalVisits}
              </p>
            </Block>

            {/* Row 1, Column 2: Total Litros */}
            <Block>
              <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                LITROS TOMADOS:
              </p>
              <p className="text-4xl font-black text-center leading-none"> {/* Reduced from text-5xl to text-4xl */}
                {totalLiters.toFixed(1)}
              </p>
            </Block>

            {/* Row 2, Column 1: Top 3 Cervezas */}
            <Block>
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
              <p className="text-sm font-bold text-center"> {/* Reduced from text-base to text-sm */}
                DÍA FAVORITO:
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
                className="w-auto max-w-[75px] p-1 mb-2"
              />
              <p className="text-xs font-bold"> {/* Reduced from text-sm to text-xs */}
                @CHINCHIN.CERVEZAS
              </p>
            </Block>
          </div>
        )}
      </div>

      {/* Botones de navegación y descarga */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-4"> {/* Added z-30 and space-x-4 */}
          <Button
              onClick={handleBackToLogin}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:text-black"
          >
              <Home className="h-7 w-7" />
          </Button>
          <Button
              onClick={handleDownloadScreenshot}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white hover:text-black"
          >
              <Download className="h-7 w-7" />
          </Button>
      </div>
    </div>
  );
};