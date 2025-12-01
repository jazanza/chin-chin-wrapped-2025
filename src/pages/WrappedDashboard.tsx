"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useThree, useFrame } from "@react-three/fiber"; // Import useFrame
import { useDb } from "@/hooks/useDb";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { ResponsiveCamera } from "@/components/ResponsiveCamera";
import { PostProcessingEffects } from "@/components/PostProcessingEffects";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { WrappedOverlay } from "@/components/WrappedOverlay";
import { ViewMode } from "@/components/CameraAnimator";
import { StoryInteractionZone } from "@/components/StoryInteractionZone";
import { StoryProgressBar } from "@/components/StoryProgressBar";

// Import story components
import { IntroFunStory } from "@/components/stories/IntroFunStory";
import { TotalVisitsStory } from "@/components/stories/TotalVisitsStory";
import { MostActiveMonthStory } from "@/components/stories/MostActiveMonthStory";
import { MostActiveDayStory } from "@/components/stories/MostActiveDayStory";
import { DominantCategoryAndVarietiesStory } from "@/components/stories/DominantCategoryAndVarietiesStory";
import { Top5Story } from "@/components/stories/Top5Story";
import { TotalConsumptionStory } from "@/components/stories/TotalConsumptionStory"; // Now Slide 6
import { SummaryInfographic } from "@/components/stories/SummaryInfographic"; // Now Slide 7

// Componente auxiliar para la captura de pantalla
const ScreenshotHelper = ({ onScreenshotReady }: { onScreenshotReady: (dataUrl: string) => void }) => {
  const { gl } = useThree();
  const captureScreenshot = useCallback(() => {
    const dataUrl = gl.domElement.toDataURL('image/png');
    onScreenshotReady(dataUrl);
  }, [gl, onScreenshotReady]);

  useEffect(() => {
    (window as any).captureWrappedScreenshot = captureScreenshot;
    return () => {
      delete (window as any).captureWrappedScreenshot;
    };
  }, [captureScreenshot]);

  return null;
};

interface StoryScene {
  id: string;
  component: React.ElementType;
  duration: number; // in milliseconds
  cameraViewMode: ViewMode;
  title: string;
  downloadFileName: string;
}

// Define the 8 slides as per the consolidated instructions
const STORY_SCENES: StoryScene[] = [
  {
    id: 'introFun', // Slide 0
    component: IntroFunStory,
    duration: 5000, // 5 seconds
    cameraViewMode: 'intro',
    title: 'Bienvenida Divertida',
    downloadFileName: 'Historia_Bienvenida',
  },
  {
    id: 'totalVisits', // Slide 1
    component: TotalVisitsStory,
    duration: 5000, // 5 seconds
    cameraViewMode: 'totalConsumption',
    title: 'Visitas del Año',
    downloadFileName: 'Historia_Visitas',
  },
  {
    id: 'mostActiveMonth', // Slide 2
    component: MostActiveMonthStory,
    duration: 5000, // 5 seconds
    cameraViewMode: 'dominantBeer',
    title: 'Mes Más Activo',
    downloadFileName: 'Historia_MesActivo',
  },
  {
    id: 'mostActiveDay', // Slide 3
    component: MostActiveDayStory,
    duration: 5000, // 5 seconds
    cameraViewMode: 'dominantBeer',
    title: 'Día Más Activo',
    downloadFileName: 'Historia_DiaActivo',
  },
  {
    id: 'dominantCategoryAndVarieties', // Slide 4
    component: DominantCategoryAndVarietiesStory,
    duration: 5000, // 5 seconds
    cameraViewMode: 'dominantBeer',
    title: 'Categoría y Variedades',
    downloadFileName: 'Historia_CategoriaVariedades',
  },
  {
    id: 'top5', // Slide 5
    component: Top5Story,
    duration: 5000, // 5 seconds
    cameraViewMode: 'top5',
    title: 'Top 5 Cervezas',
    downloadFileName: 'Historia_Top5',
  },
  {
    id: 'totalConsumption', // Slide 6 (Moved from 7)
    component: TotalConsumptionStory,
    duration: 5000, // 5 seconds
    cameraViewMode: 'totalConsumption',
    title: 'Consumo Total',
    downloadFileName: 'Historia_ConsumoTotal',
  },
  {
    id: 'summaryInfographic', // Slide 7 (Moved from 6)
    component: SummaryInfographic,
    duration: 9000, // 8 to 10 seconds, choosing 9 seconds
    cameraViewMode: 'summaryInfographic',
    title: 'Infografía Final',
    downloadFileName: 'Infografia_Final',
  },
];

// Color definitions based on the user's table (updated to match new order)
const BACKGROUND_COLORS = [
  0x000000, // Slide 0: Intro (Negro)
  0xFFFFFF, // Slide 1: Visitas (Blanco)
  0x000000, // Slide 2: Mes Activo (Negro)
  0xFFFFFF, // Slide 3: Día Activo (Blanco)
  0x000000, // Slide 4: Categorías/Variedades (Negro)
  0xFFFFFF, // Slide 5: Top 5 Cervezas (Blanco)
  0x000000, // Slide 6: Total Litros (Negro)
  0xFFFFFF, // Slide 7: Infografía Final (Blanco)
];

const TEXT_COLORS = [
  "#FFFFFF", // Slide 0: Intro (Blanco) - OK for Black background
  "#000000", // Slide 1: Visitas (Negro) - OK for White background
  "#FFFFFF", // Slide 2: Mes Activo (Blanco) - OK for Black background
  "#000000", // Slide 3: Día Activo (Negro) - OK for White background
  "#FFFFFF", // Slide 4: Categorías/Variedades (Blanco) - OK for Black background
  "#000000", // Slide 5: Top 5 Cervezas (Negro) - OK for White background
  "#FFFFFF", // Slide 6: Total Litros (Blanco) - OK for Black background
  "#000000", // Slide 7: Infografía Final (Negro) - OK for White background
];

const HIGHLIGHT_COLORS = [
  "#FFD700", // Slide 0: Intro (Amarillo Saturado) - OK for Black background
  "#DC143C", // Slide 1: Visitas (Rojo Saturado) - OK for White background
  "#FFD700", // Slide 2: Mes Activo (Amarillo Saturado) - OK for Black background
  "#DC143C", // Slide 3: Día Activo (Rojo Saturado) - OK for White background
  "#FFD700", // Slide 4: Categorías/Variedades (Amarillo Saturado) - OK for Black background
  "#DC143C", // Slide 5: Top 5 Cervezas (Rojo Saturado) - OK for White background
  "#FFD700", // Slide 6: Total Litros (Amarillo Saturado) - OK for Black background
  "#DC143C", // Slide 7: Infografía Final (Rojo Saturado) - OK for White background
];


const WrappedDashboard = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getWrappedData, loading, error, dbLoaded } = useDb();
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Removed timeoutRef as auto-advance is disabled

  const currentStory = STORY_SCENES[currentStoryIndex];

  useEffect(() => {
    if (!dbLoaded) return;

    const fetchWrappedData = async () => {
      if (toastId) dismissToast(toastId);
      try {
        const data = await getWrappedData(Number(customerId), '2025'); // Hardcoded year 2025
        setWrappedData(data);
        showSuccess("¡Tu Wrapped está listo!");
      } catch (err: any) {
        console.error("Error fetching wrapped data:", err);
        showError(err.message || "No se pudo cargar tu Wrapped.");
      } finally {
        if (toastId) dismissToast(toastId);
        setToastId(null);
      }
    };

    fetchWrappedData();
  }, [customerId, dbLoaded]);

  // Story navigation logic - Removed auto-advance useEffect
  // useEffect(() => {
  //   if (wrappedData && currentStory.duration > 0 && !isPaused) {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //     timeoutRef.current = setTimeout(() => {
  //       handleNextStory();
  //     }, currentStory.duration);
  //   }
  //   return () => {
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current);
  //     }
  //   };
  // }, [currentStoryIndex, wrappedData, isPaused, currentStory.duration]);

  const handleNextStory = useCallback(() => {
    setCurrentStoryIndex((prevIndex) =>
      Math.min(prevIndex + 1, STORY_SCENES.length - 1)
    );
  }, []);

  const handlePrevStory = useCallback(() => {
    setCurrentStoryIndex((prevIndex) =>
      Math.max(prevIndex - 1, 0)
    );
  }, []);

  const handlePauseStory = useCallback(() => {
    setIsPaused(true);
    // No need to clear timeoutRef.current here as auto-advance is disabled
  }, []);

  const handleResumeStory = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleDownloadScreenshot = () => {
    if (!wrappedData) {
      showError("Espera a que se carguen los datos para descargar.");
      return;
    }
    setIsCapturing(true);
    const captureFunc = (window as any).captureWrappedScreenshot;
    if (captureFunc) {
      captureFunc();
    } else {
      showError("Error al preparar la captura de pantalla.");
      setIsCapturing(false);
    }
  };

  const onScreenshotReady = useCallback((dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ChinChin_Wrapped_${wrappedData?.customerName || 'Cliente'}_2025_${currentStory.downloadFileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("¡Descarga completada!");
    setIsCapturing(false);
  }, [wrappedData, currentStory]);

  if (loading && !wrappedData) {
    return (
      <div className="w-screen h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!wrappedData) {
    return null;
  }

  // Dynamic background color for the Canvas
  const currentBackgroundColor = BACKGROUND_COLORS[currentStoryIndex];
  const currentTextColor = TEXT_COLORS[currentStoryIndex];
  const currentHighlightColor = HIGHLIGHT_COLORS[currentStoryIndex];

  // Set clear color for the canvas
  const CanvasBackground = () => {
    const { gl } = useThree();
    useFrame(() => {
      gl.setClearColor(currentBackgroundColor);
    });
    return null;
  };

  const isIntroStory = currentStory.id === 'introFun'; // Only IntroFunStory is considered intro for overlay logic

  const StoryComponent = currentStory.component;

  // Props mapping for the current story component
  const storyProps = {
    customerName: wrappedData.customerName,
    year: wrappedData.year,
    totalLiters: wrappedData.totalLiters,
    dominantBeerCategory: wrappedData.dominantBeerCategory,
    top5Products: wrappedData.top5Products,
    totalVisits: wrappedData.totalVisits,
    totalVisits2024: wrappedData.totalVisits2024,
    totalLiters2024: wrappedData.totalLiters2024,
    uniqueVarieties2025: wrappedData.uniqueVarieties2025,
    totalVarietiesInDb: wrappedData.totalVarietiesInDb,
    mostActiveDay: wrappedData.mostActiveDay,
    mostActiveMonth: wrappedData.mostActiveMonth,
    isPaused: isPaused,
    textColor: currentTextColor,
    highlightColor: currentHighlightColor,
    onStoryFinished: handleNextStory, // Only used by IntroFunStory
  };

  return (
    <div className="w-screen h-screen relative font-sans flex items-center justify-center">
      <div className="relative w-full h-full overflow-hidden">
        {/* Story Progress Bar */}
        <StoryProgressBar
          currentStoryIndex={currentStoryIndex}
          totalStories={STORY_SCENES.length}
          storyDuration={currentStory.duration}
          isPaused={isPaused}
        />

        {!isIntroStory && currentStory.id !== 'summaryInfographic' && ( // Only show WrappedOverlay if not an intro story and not the infographic
          <WrappedOverlay
            customerName={wrappedData.customerName}
            year={wrappedData.year}
            dominantBeerCategory={wrappedData.dominantBeerCategory}
          />
        )}

        <Canvas
          camera={{ position: [0, 0, 8], fov: 75 }}
          className="w-full h-full"
          gl={{ preserveDrawingBuffer: true }}
        >
          <CanvasBackground />
          <ambientLight intensity={0.5} color={0xFFFFFF} />
          <pointLight position={[10, 10, 10]} color={0xFFFFFF} intensity={1} />
          <ResponsiveCamera viewMode={currentStory.cameraViewMode} />
          <PostProcessingEffects />

          {/* Render current story component using dynamic component and spread props */}
          <StoryComponent {...storyProps} />

          <ScreenshotHelper onScreenshotReady={onScreenshotReady} />
        </Canvas>

        {/* Chin Chin Logo - Centered at the bottom, 20% larger */}
        <img
          src="/Logo.png"
          alt="Chin Chin Logo"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[9.6vw] max-w-[72px] p-1" // 8vw * 1.2 = 9.6vw, 60px * 1.2 = 72px
        />

        {/* Interaction Zone */}
        <StoryInteractionZone
          onNext={handleNextStory}
          onPrev={handlePrevStory}
          onPause={handlePauseStory}
          onResume={handleResumeStory}
          isPaused={isPaused}
        />

        {/* Download Button (only for SummaryInfographic) - Brutalist styling */}
        {currentStory.id === 'summaryInfographic' && (
          <Button
            onClick={handleDownloadScreenshot}
            // Brutalist Button: White background, Black text, Black border, no rounded corners, simple hover inverse
            className="absolute top-4 right-4 z-30 bg-white text-black font-bold py-2 px-4 border-2 border-black rounded-none transition-none hover:bg-black hover:text-white hover:border-white"
            disabled={isCapturing}
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Capturando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar y Compartir
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WrappedDashboard;