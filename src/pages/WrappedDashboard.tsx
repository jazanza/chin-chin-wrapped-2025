"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useThree } from "@react-three/fiber";
import { useDb } from "@/hooks/useDb";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { ResponsiveCamera } from "@/components/ResponsiveCamera";
import { PostProcessingEffects } from "@/components/PostProcessingEffects";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { WrappedOverlay } from "@/components/WrappedOverlay";
import { ViewMode } from "@/components/CameraAnimator"; // Import ViewMode

// Import story components
import { IntroStory } from "@/components/stories/IntroStory";
import { TotalConsumptionStory } from "@/components/stories/TotalConsumptionStory";
import { DominantBeerStory } from "@/components/stories/DominantBeerStory";
import { Top5Story } from "@/components/stories/Top5Story";
import { SummaryInfographic } from "@/components/stories/SummaryInfographic";

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

const STORY_SCENES: StoryScene[] = [
  {
    id: 'intro',
    component: IntroStory,
    duration: 7000,
    cameraViewMode: 'intro',
    title: 'Introducción',
    downloadFileName: 'Historia_Intro',
  },
  {
    id: 'totalConsumption',
    component: TotalConsumptionStory,
    duration: 7000,
    cameraViewMode: 'totalConsumption',
    title: 'Consumo Total',
    downloadFileName: 'Historia_ConsumoTotal',
  },
  {
    id: 'dominantBeer',
    component: DominantBeerStory,
    duration: 7000,
    cameraViewMode: 'dominantBeer',
    title: 'Cerveza Dominante',
    downloadFileName: 'Historia_CervezaDominante',
  },
  {
    id: 'top5',
    component: Top5Story,
    duration: 7000,
    cameraViewMode: 'top5',
    title: 'Top 5 Cervezas',
    downloadFileName: 'Historia_Top5',
  },
  {
    id: 'summaryInfographic',
    component: SummaryInfographic,
    duration: 0, // Static, no auto-advance
    cameraViewMode: 'summaryInfographic',
    title: 'Infografía Final',
    downloadFileName: 'Infografia_Final',
  },
];

const WrappedDashboard = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getWrappedData, loading, error, dbLoaded } = useDb();
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStory = STORY_SCENES[currentStoryIndex];

  useEffect(() => {
    if (!dbLoaded) return;

    const fetchWrappedData = async () => {
      if (toastId) dismissToast(toastId);
      setToastId(showLoading("Cargando tu Wrapped..."));
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

  // Story navigation logic
  useEffect(() => {
    if (wrappedData && currentStory.duration > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        handleNextStory();
      }, currentStory.duration);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStoryIndex, wrappedData]); // Re-run effect when story changes or data loads

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
        <Loader2 className="h-8 w-8 animate-spin text-primary-glitch-pink" />
        <p className="ml-4 text-lg text-secondary-glitch-cyan">Cargando tu Wrapped...</p>
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
    return null; // Or a more specific loading state if needed
  }

  const StoryComponent = currentStory.component;

  return (
    <div className="w-screen h-screen relative bg-background font-sans flex items-center justify-center">
      {/* Fixed aspect ratio container for the Canvas */}
      <div className="relative w-full h-full max-w-[calc(100vh*9/16)] max-h-screen aspect-[9/16]">
        {currentStory.id !== 'summaryInfographic' && (
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
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ResponsiveCamera viewMode={currentStory.cameraViewMode} />
          <PostProcessingEffects />

          {/* Render current story component */}
          <StoryComponent
            customerName={wrappedData.customerName}
            year={wrappedData.year}
            totalLiters={wrappedData.totalLiters}
            dominantBeerCategory={wrappedData.dominantBeerCategory}
            top5Products={wrappedData.top5Products}
            totalVisits={wrappedData.totalVisits}
            categoryVolumes={wrappedData.categoryVolumes}
          />

          <ScreenshotHelper onScreenshotReady={onScreenshotReady} />
        </Canvas>

        {/* Navigation and Download Buttons */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-4">
          <Button
            onClick={handlePrevStory}
            disabled={currentStoryIndex === 0 || isCapturing}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>

          <Button
            onClick={handleDownloadScreenshot}
            className="bg-button-highlight hover:bg-button-highlight/80 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
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
                {currentStory.id === 'summaryInfographic' ? "Descargar Infografía" : "Descargar Story"}
              </>
            )}
          </Button>

          <Button
            onClick={handleNextStory}
            disabled={currentStoryIndex === STORY_SCENES.length - 1 || isCapturing}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Siguiente <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WrappedDashboard;