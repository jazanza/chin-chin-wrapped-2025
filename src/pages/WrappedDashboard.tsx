"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDb } from "@/hooks/useDb";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { StoryInteractionZone } from "@/components/StoryInteractionZone";
import { cn } from '@/lib/utils';
import BubbleBackground from "@/components/BubbleBackground"; // Importar el nuevo componente

// Import story components
import { IntroFunStory } from "@/components/stories/IntroFunStory";
import { TotalVisitsStory } from "@/components/stories/TotalVisitsStory";
import { FirstBeerOfTheYearStory } from "@/components/stories/FirstBeerOfTheYearStory"; // NEW
import { MostActiveMonthStory } from "@/components/stories/MostActiveMonthStory";
import { MostActiveDayStory } from "@/components/stories/MostActiveDayStory";
import { DominantCategoryAndVarietiesStory } from "@/components/stories/DominantCategoryAndVarietiesStory";
import { Top5Story } from "@/components/stories/Top5Story";
import { PaladarCerveceroStory } from "@/components/stories/PaladarCerveceroStory"; // NEW
import { TotalConsumptionStory } from "@/components/stories/TotalConsumptionStory";
import { MissingVarietiesCard } from "@/components/stories/MissingVarietiesCard";
import { SummaryInfographic } from "@/components/stories/SummaryInfographic";


// Inline WrappedOverlay logic
interface WrappedOverlayProps {
  customerName: string;
  year: string;
  textColor: string; // Added textColor prop
}

const WrappedOverlay = ({ customerName, year, textColor }: WrappedOverlayProps) => {
  return (
    <div className="absolute top-8 left-8 z-10 pointer-events-none font-sans max-w-[80%]">
      <h1
        className={cn("text-4xl font-bold uppercase tracking-widest", textColor)} // H2
      >
        {customerName}
      </h1>
      <p
        className={cn("text-xl font-bold uppercase tracking-wide", textColor)} // H3
      >
        {year} WRAPPED
      </p>
    </div>
  );
};

// Inline StoryProgressBar logic
interface StoryProgressBarProps {
  currentStoryIndex: number;
  totalStories: number;
  storyDuration: number; // in milliseconds
  isPaused: boolean;
}

const StoryProgressBar = ({
  currentStoryIndex,
  totalStories,
  storyDuration,
  isPaused,
}: StoryProgressBarProps) => {
  const [progress, setProgress] = useState(0); // Progress for the current segment (0-100)
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isPaused) {
      // Pause: record elapsed time and stop animation
      cancelAnimationFrame(animationFrameRef.current!);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    } else {
      // Resume or start new story
      startTimeRef.current = Date.now() - pausedTimeRef.current; // Adjust start time for resume
      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTimeRef.current;
        const newProgress = Math.min((elapsedTime / storyDuration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [currentStoryIndex, isPaused, storyDuration]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
  }, [currentStoryIndex]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex w-[90%] max-w-md space-x-1">
      {Array.from({ length: totalStories }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1 flex-1 bg-gray-700 overflow-hidden", // Removed rounded-full
            index < currentStoryIndex && "bg-white", // Completed stories are white
          )}
        >
          {index === currentStoryIndex && (
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};


interface StoryScene {
  id: string;
  component: React.ElementType;
  duration: number; // in milliseconds
  title: string;
  downloadFileName: string;
}

const STORY_SCENES: StoryScene[] = [
  {
    id: 'introFun', // Slide 0
    component: IntroFunStory,
    duration: 15000, // 15 segundos para lectura de texto largo
    title: 'Bienvenida Divertida',
    downloadFileName: 'Historia_Bienvenida',
  },
  {
    id: 'totalVisits', // Slide 1
    component: TotalVisitsStory,
    duration: 15000, // 15 seconds
    title: 'Visitas del Año',
    downloadFileName: 'Historia_Visitas',
  },
  {
    id: 'firstBeerOfTheYear', // NEW Slide 2
    component: FirstBeerOfTheYearStory,
    duration: 15000, // 15 seconds
    title: 'Primera Cerveza del Año',
    downloadFileName: 'Historia_PrimeraCerveza',
  },
  {
    id: 'mostActiveMonth', // Slide 3 (was 2)
    component: MostActiveMonthStory,
    duration: 15000, // 15 seconds
    title: 'Mes Más Activo',
    downloadFileName: 'Historia_MesActivo',
  },
  {
    id: 'mostActiveDay', // Slide 4 (was 3)
    component: MostActiveDayStory,
    duration: 15000, // 15 seconds
    title: 'Día Más Activo',
    downloadFileName: 'Historia_DiaActivo',
  },
  {
    id: 'dominantCategoryAndVarieties', // Slide 5 (was 4)
    component: DominantCategoryAndVarietiesStory,
    duration: 15000, // 15 seconds
    title: 'Categoría y Variedades',
    downloadFileName: 'Historia_CategoriaVariedades',
  },
  {
    id: 'top5', // Slide 6 (was 5)
    component: Top5Story,
    duration: 15000, // 15 seconds
    title: 'Top 5 Cervezas',
    downloadFileName: 'Historia_Top5',
  },
  {
    id: 'paladarCervecero', // NEW Slide 7
    component: PaladarCerveceroStory,
    duration: 15000, // 15 seconds
    title: 'Tu Paladar Cervecero',
    downloadFileName: 'Historia_PaladarCervecero',
  },
  {
    id: 'totalConsumption', // Slide 8 (was 6)
    component: TotalConsumptionStory,
    duration: 15000, // 15 seconds
    title: 'Consumo Total',
    downloadFileName: 'Historia_ConsumoTotal',
  },
  {
    id: 'missingVarieties', // Slide 9 (was 7)
    component: MissingVarietiesCard,
    duration: 15000, // 15 seconds
    title: 'Variedades Pendientes',
    downloadFileName: 'Historia_VariedadesPendientes',
  },
  {
    id: 'summaryInfographic', // Slide 10 (was 8)
    component: SummaryInfographic,
    duration: 15000, // 15 segundos para dar tiempo a descargar
    title: 'Infografía Final',
    downloadFileName: 'Infografia_Final',
  },
];

// REVISIÓN CRÍTICA DE COLORES BRUTALISTAS
const BACKGROUND_COLORS = [
  "bg-black", // Slide 0: Intro (Negro)
  "bg-white", // Slide 1: Visitas (Blanco)
  "bg-black", // NEW Slide 2: Primera Cerveza (Negro)
  "bg-white", // Slide 3: Mes Activo (Blanco)
  "bg-black", // Slide 4: Día Activo (Negro)
  "bg-white", // Slide 5: Categorías/Variedades (Blanco)
  "bg-black", // Slide 6: Top 5 Cervezas (Negro)
  "bg-white", // NEW Slide 7: Paladar Cervecero (Blanco)
  "bg-black", // Slide 8: Total Litros (Negro)
  "bg-white", // Slide 9: Variedades Pendientes (Blanco)
  "bg-black", // Slide 10: Infografía Final (Negro)
];

const TEXT_COLORS = [
  "text-white", // Slide 0: Intro (Blanco)
  "text-black", // Slide 1: Visitas (Negro)
  "text-white", // NEW Slide 2: Primera Cerveza (Blanco)
  "text-black", // Slide 3: Mes Activo (Negro)
  "text-white", // Slide 4: Día Activo (Blanco)
  "text-black", // Slide 5: Categorías/Variedades (Negro)
  "text-white", // Slide 6: Top 5 Cervezas (Blanco)
  "text-black", // NEW Slide 7: Paladar Cervecero (Negro)
  "text-white", // Slide 8: Total Litros (Blanco)
  "text-black", // Slide 9: Variedades Pendientes (Negro)
  "text-white", // Slide 10: Infografía Final (Blanco)
];

const HIGHLIGHT_COLORS = [
  "text-white", // Slide 0: Highlight (Blanco)
  "text-black", // Slide 1: Highlight (Negro)
  "text-white", // NEW Slide 2: Primera Cerveza Highlight (Blanco)
  "text-black", // Slide 3: Highlight (Negro)
  "text-white", // Slide 4: Highlight (Blanco)
  "text-black", // Slide 5: Highlight (Negro)
  "text-white", // Slide 6: Top 5 Cervezas (Blanco)
  "text-black", // NEW Slide 7: Paladar Cervecero Highlight (Negro)
  "text-white", // Slide 8: Total Litros (Blanco)
  "text-black", // Slide 9: Variedades Pendientes (Negro)
  "text-white", // Slide 10: Infografía Final (Blanco)
];


const WrappedDashboard = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getWrappedData, loading, error, dbLoaded, getAllBeerVarietiesInDb } = useDb();
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storyContainerRef = useRef<HTMLDivElement>(null);

  const currentStory = STORY_SCENES[currentStoryIndex];

  // Story navigation callbacks - Moved before useEffect that uses them
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

  useEffect(() => {
    if (!dbLoaded) return;

    const fetchWrappedData = async () => {
      if (toastId) dismissToast(toastId);
      try {
        const data = await getWrappedData(Number(customerId), '2025');
        setWrappedData(data);
        showSuccess("¡Tu Wrapped 2025 está listo!");
      } catch (err: any) {
        console.error("Error al obtener datos Wrapped:", err);
        showError(err.message || "No se pudo cargar tu Wrapped 2025.");
      } finally {
        if (toastId) dismissToast(toastId);
        setToastId(null);
      }
    };

    fetchWrappedData();
  }, [customerId, dbLoaded, getWrappedData]); // Added getWrappedData to dependencies

  // TEMPORARY: Log all beer varieties to console for debugging
  useEffect(() => {
    if (dbLoaded && getAllBeerVarietiesInDb) {
      getAllBeerVarietiesInDb().then(list => {
        console.log(`Listado de variedades de cerveza en la base de datos (${list.length} items):`, list);
      }).catch(console.error);
    }
  }, [dbLoaded, getAllBeerVarietiesInDb]);
  // END TEMPORARY LOG

  // Story navigation logic - Reintroduced auto-advance
  useEffect(() => {
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
  }, [currentStoryIndex, wrappedData, isPaused, currentStory.duration, handleNextStory]); // handleNextStory is now defined


  // handleDownloadScreenshot is removed as per instructions.

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
        <p className="text-base text-red-500">Error: {error}</p> {/* H4 */}
      </div>
    );
  }

  if (!wrappedData) {
    return null;
  }

  const currentBackgroundColor = BACKGROUND_COLORS[currentStoryIndex];
  const currentTextColor = TEXT_COLORS[currentStoryIndex];
  const currentHighlightColor = HIGHLIGHT_COLORS[currentStoryIndex];

  const isIntroStory = currentStory.id === 'introFun';
  const isSummaryInfographicStory = currentStory.id === 'summaryInfographic';

  const StoryComponent = currentStory.component;

  // Props mapping for the current story component
  const storyProps = {
    customerName: wrappedData.customerName,
    year: wrappedData.year,
    totalLiters: wrappedData.totalLiters,
    dominantBeerCategory: wrappedData.dominantBeerCategory,
    top10Products: wrappedData.top10Products,
    totalVisits: wrappedData.totalVisits,
    uniqueVarieties2025: wrappedData.uniqueVarieties2025,
    totalVarietiesInDb: wrappedData.totalVarietiesInDb,
    mostActiveDay: wrappedData.mostActiveDay,
    mostActiveMonth: wrappedData.mostActiveMonth,
    dailyVisits: wrappedData.dailyVisits,
    monthlyVisits: wrappedData.monthlyVisits,
    missingVarieties: wrappedData.missingVarieties,
    isPaused: isPaused,
    textColor: currentTextColor,
    highlightColor: currentHighlightColor,
    palateCategory: wrappedData.palateCategory,
    dynamicTitle: wrappedData.dynamicTitle,
    firstBeerDetails: wrappedData.firstBeerDetails,
    litersPercentile: wrappedData.litersPercentile,
    visitsPercentile: wrappedData.visitsPercentile,
    mostPopularCommunityDay: wrappedData.mostPopularCommunityDay,
    mostPopularCommunityMonth: wrappedData.mostPopularCommunityMonth,
    mostFrequentBeerName: wrappedData.mostFrequentBeerName,
    varietyExplorationRatio: wrappedData.varietyExplorationRatio,
    totalCommunityClients: wrappedData.totalCommunityClients, // NEW
    totalCommunityLiters: wrappedData.totalCommunityLiters, // NEW
  };

  return (
    <div className={`w-screen h-screen relative font-sans flex items-center justify-center ${currentBackgroundColor}`}>
      <div ref={storyContainerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center">
        {/* Bubble Background */}
        <BubbleBackground backgroundColor={currentBackgroundColor} />

        {/* Story Progress Bar */}
        <StoryProgressBar
          currentStoryIndex={currentStoryIndex}
          totalStories={STORY_SCENES.length}
          storyDuration={currentStory.duration}
          isPaused={isPaused}
        />

        {!isIntroStory && !isSummaryInfographicStory && (
          <WrappedOverlay
            customerName={wrappedData.customerName}
            year={wrappedData.year}
            textColor={currentTextColor}
          />
        )}

        {/* Render current story component directly as 2D */}
        <StoryComponent {...storyProps} />

        {/* Chin Chin Logo - Centered at the bottom, 20% larger */}
        <img
          src="/Logo.png"
          alt="Logo Chin Chin"
          className="absolute bottom-4 right-4 z-10 w-24 h-auto p-1" // Fixed size for logo
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
        {/* REMOVED: Download button is now handled within SummaryInfographic.tsx */}
      </div>
    </div>
  );
};

export default WrappedDashboard;