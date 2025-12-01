"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useThree } from "@react-three/fiber";
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
import { IntroFunStory } from "@/components/stories/IntroFunStory"; // New intro story
import { WelcomeStory } from "@/components/stories/WelcomeStory"; // Renamed from IntroStory
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
    id: 'introFun', // New intro story
    component: IntroFunStory,
    duration: 0, // Duration now controlled by the component itself
    cameraViewMode: 'intro',
    title: 'Bienvenida Divertida',
    downloadFileName: 'Historia_Bienvenida',
  },
  {
    id: 'welcome', // Renamed from intro
    component: WelcomeStory,
    duration: 5000,
    cameraViewMode: 'intro',
    title: 'Introducción',
    downloadFileName: 'Historia_Intro',
  },
  {
    id: 'totalConsumption',
    component: TotalConsumptionStory,
    duration: 5000,
    cameraViewMode: 'totalConsumption',
    title: 'Consumo Total',
    downloadFileName: 'Historia_ConsumoTotal',
  },
  {
    id: 'dominantBeer',
    component: DominantBeerStory,
    duration: 5000,
    cameraViewMode: 'dominantBeer',
    title: 'Cerveza Dominante',
    downloadFileName: 'Historia_CervezaDominante',
  },
  {
    id: 'top5',
    component: Top5Story,
    duration: 5000,
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
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Story navigation logic
  useEffect(() => {
    // Only auto-advance if the current story has a defined duration > 0
    if (wrappedData && currentStory.duration > 0 && !isPaused) {
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
  }, [currentStoryIndex, wrappedData, isPaused, currentStory.duration]);

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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

  return (
    <div className="w-screen h-screen relative bg-background font-sans flex items-center justify-center">
      {/* Mobile mockup container without border */}
      <div className="relative w-full h-full max-w-[420px] overflow-hidden bg-black">
        {/* Story Progress Bar */}
        <StoryProgressBar
          currentStoryIndex={currentStoryIndex}
          totalStories={STORY_SCENES.length}
          storyDuration={currentStory.duration}
          isPaused={isPaused}
        />

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
          {/* Simplified Lighting: Hard white light */}
          <ambientLight intensity={0.5} color={0xFFFFFF} />
          <pointLight position={[10, 10, 10]} color={0xFFFFFF} intensity={1} />
          <ResponsiveCamera viewMode={currentStory.cameraViewMode} />
          <PostProcessingEffects />

          {/* Render current story component conditionally */}
          {currentStoryIndex === 0 && (
            <IntroFunStory
              totalVisits={wrappedData.totalVisits}
              isPaused={isPaused}
              onStoryFinished={handleNextStory} // Pass callback for dynamic duration
            />
          )}
          {currentStoryIndex === 1 && (
            <WelcomeStory
              customerName={wrappedData.customerName}
              year={wrappedData.year}
              totalVisits={wrappedData.totalVisits}
              isPaused={isPaused}
            />
          )}
          {currentStoryIndex === 2 && (
            <TotalConsumptionStory
              totalLiters={wrappedData.totalLiters}
              isPaused={isPaused}
            />
          )}
          {currentStoryIndex === 3 && (
            <DominantBeerStory
              dominantBeerCategory={wrappedData.dominantBeerCategory}
              categoryVolumes={wrappedData.categoryVolumes}
              isPaused={isPaused}
            />
          )}
          {currentStoryIndex === 4 && (
            <Top5Story
              top5Products={wrappedData.top5Products}
              isPaused={isPaused}
            />
          )}
          {currentStoryIndex === 5 && (
            <SummaryInfographic
              customerName={wrappedData.customerName}
              year={wrappedData.year}
              totalLiters={wrappedData.totalLiters}
              dominantBeerCategory={wrappedData.dominantBeerCategory}
              top5Products={wrappedData.top5Products}
              totalVisits={wrappedData.totalVisits}
              isPaused={isPaused}
            />
          )}

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