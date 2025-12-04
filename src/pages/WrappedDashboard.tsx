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
import { TotalVisitsStory } from "@/components/stories/TotalVisits/Story";
import { FirstBeerOfTheYearStory } from "@/components/stories/FirstBeerOfTheYearStory"; // NEW
import { MostActiveMonthStory } from "@/components/stories/MostActiveMonthStory";
import { MostActiveDayStory } from "@/components/stories/MostActiveDayStory";
import { DominantCategoryAndVarietiesStory } from "@/components/stories/DominantCategoryAndVarietiesStory";
import { Top5Story } from "@/components/stories/Top5Story";
import { PaladarCerveceroStory } from "@/components/stories/PaladarCerveceroStory"; // NEW
import { TotalConsumptionStory } from "@/components/stories/TotalConsumptionStory";
import { MissingVarietiesCard } from "@/components/stories/MissingVarietiesCard";
import { OutroStory } from "@/components/stories/OutroStory";
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
        className={cn("text-3xl md:text-4xl font-bold uppercase tracking-widest", textColor)} // H2, ajustado para responsividad
      >
        {customerName}
      </h1>
      <p
        className={cn("text-lg md:text-xl font-bold uppercase tracking-wide", textColor)} // H3, ajustado para responsividad
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
    id: 'outro', // Slide 10
    component: OutroStory,
    duration: 15000,
    title: 'Despedida',
    downloadFileName: 'Historia_Despedida',
  },
  {
    id: 'summaryInfographic', // Slide 11 (was 10)
    component: SummaryInfographic,
    duration: 15000, // 15 segundos para dar tiempo a descargar
    title: 'Infografía Final',
    downloadFileName: 'Infografia_Final',
  },
];

// REVISIÓN CRÍTICA DE COLORES BRUTALISTAS Y NEONES
const BACKGROUND_COLORS = [
  "bg-neon-lime",   // Slide 0: Intro (Lima Neón) - Cambiado a neón
  "bg-neon-cyan",   // Slide 1: Visitas (Cian Neón)
  "bg-neon-lime",   // NEW Slide 2: Primera Cerveza (Lima Neón)
  "bg-neon-pink",   // Slide 3: Mes Activo (Rosa Neón)
  "bg-neon-purple", // NEW Slide 4: Día Activo (Púrpura Neón)
  "bg-neon-cyan",   // Slide 5: Categorías/Variedades (Cian Neón)
  "bg-neon-pink",   // NEW Slide 6: Top 5 Cervezas (Rosa Neón)
  "bg-neon-lime",   // NEW Slide 7: Paladar Cervecero (Lima Neón)
  "bg-neon-purple", // NEW Slide 8: Total Litros (Púrpura Neón)
  "bg-neon-cyan",   // NEW Slide 9: Variedades Pendientes (Cian Neón)
  "bg-neon-pink",   // NEW Slide 10: Outro (Rosa Neón)
  "bg-black",       // Slide 11: Infografía Final (Negro)
];

const TEXT_COLORS = [
  "text-black",     // Slide 0: Intro (Negro sobre Lima Neón) - Cambiado a negro
  "text-black",     // Slide 1: Visitas (Negro sobre Cian Neón)
  "text-black",     // NEW Slide 2: Primera Cerveza (Negro sobre Lima Neón)
  "text-white",     // Slide 3: Mes Activo (Blanco sobre Rosa Neón)
  "text-white",     // NEW Slide 4: Día Activo (Blanco sobre Púrpura Neón)
  "text-black",     // Slide 5: Categorías/Variedades (Negro sobre Cian Neón)
  "text-white",     // NEW Slide 6: Top 5 Cervezas (Blanco sobre Rosa Neón)
  "text-black",     // NEW Slide 7: Paladar Cervecero (Negro sobre Lima Neón)
  "text-white",     // NEW Slide 8: Total Litros (Blanco sobre Púrpura Neón)
  "text-black",     // NEW Slide 9: Variedades Pendientes (Negro sobre Cian Neón)
  "text-white",     // NEW Slide 10: Outro (Blanco sobre Rosa Neón)
  "text-white",     // Slide 11: Infografía Final (Blanco sobre Negro)
];

const HIGHLIGHT_COLORS = [
  "text-black",     // Slide 0: Highlight (Negro sobre Lima Neón) - Cambiado a negro
  "text-black",     // Slide 1: Highlight (Negro sobre Cian Neón)
  "text-black",     // NEW Slide 2: Primera Cerveza Highlight (Negro sobre Lima Neón)
  "text-white",     // Slide 3: Highlight (Blanco sobre Rosa Neón)
  "text-white",     // NEW Slide 4: Día Activo Highlight (Blanco sobre Púrpura Neón)
  "text-black",     // Slide 5: Highlight (Negro sobre Cian Neón)
  "text-white",     // NEW Slide 6: Top 5 Cervezas Highlight (Blanco sobre Rosa Neón)
  "text-black",     // NEW Slide 7: Paladar Cervecero Highlight (Negro sobre Lima Neón)
  "text-white",     // NEW Slide 8: Total Litros Highlight (Blanco sobre Púrpura Neón)
  "text-black",     // NEW Slide 9: Variedades Pendientes Highlight (Negro sobre Cian Neón)
  "text-white",     // NEW Slide 10: Outro Highlight (Blanco sobre Rosa Neón)
  "text-white",     // Slide 11: Infografía Final Highlight (Blanco sobre Negro)
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

  const isSummaryInfographicStory = currentStory.id === 'summaryInfographic';

  const StoryComponent = currentStory.component;

  // Determine which logo to use based on background color
  const logoSrc = (currentBackgroundColor === "bg-white" || currentBackgroundColor === "bg-neon-cyan" || currentBackgroundColor === "bg-neon-lime") ? "/Logo_Black.png" : "/Logo.png";

  // Determine bubble color based on current background
  let bubbleColorForBackground: string;
  if (currentBackgroundColor === "bg-neon-cyan" || currentBackgroundColor === "bg-neon-lime" || currentBackgroundColor === "bg-white") {
    bubbleColorForBackground = "bg-black";
  } else { // bg-black, bg-neon-pink, bg-neon-purple
    bubbleColorForBackground = "bg-white";
  }

  // Props mapping for the current story component
  const storyProps = {
    customerName: wrappedData.customerName,
    year: wrappedData.year,
    totalLiters: wrappedData.totalLiters,
    dominantBeerCategory: wrappedData.dominantBeerCategory,
    top10Products: wrappedData.top10Products, // Now contains Top 5
    totalVisits: wrappedData.totalVisits,
    // REMOVED: totalVisits2024: wrappedData.totalVisits2024,
    // REMOVED: totalLiters2024: wrappedData.totalLiters2024,
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
    palateCategory: wrappedData.palateCategory, // NEW
    dynamicTitle: wrappedData.dynamicTitle, // NEW
    firstBeerDetails: wrappedData.firstBeerDetails, // NEW
    litersPercentile: wrappedData.litersPercentile, // NEW
    visitsPercentile: wrappedData.visitsPercentile, // NEW
    mostPopularCommunityDay: wrappedData.mostPopularCommunityDay, // NEW
    mostPopularCommunityMonth: wrappedData.mostPopularCommunityMonth, // NEW
    mostFrequentBeerName: wrappedData.mostFrequentBeerName, // NEW: Most frequent beer name
    varietyExplorationRatio: wrappedData.varietyExplorationRatio, // NEW: variety exploration ratio
    totalCustomers: wrappedData.totalCustomers, // NEW
    totalLitres: wrappedData.totalLitres,       // NEW
    backgroundColor: currentBackgroundColor, // NEW: Pass background color to story components
  };

  return (
    <div className={`w-screen h-screen relative font-sans flex items-center justify-center ${currentBackgroundColor}`}>
      <div ref={storyContainerRef} className="relative w-full h-full overflow-hidden flex flex-col justify-between">
        {/* Bubble Background */}
        <BubbleBackground backgroundColor={currentBackgroundColor} bubbleColorClass={bubbleColorForBackground} />

        {/* Story Progress Bar */}
        {!isSummaryInfographicStory && (
          <StoryProgressBar
            currentStoryIndex={currentStoryIndex}
            totalStories={STORY_SCENES.length}
            storyDuration={currentStory.duration}
            isPaused={isPaused}
          />
        )}

        {/* WrappedOverlay (customer name and year) */}
        {!isSummaryInfographicStory && (
          <WrappedOverlay
            customerName={wrappedData.customerName}
            year={wrappedData.year}
            textColor={currentTextColor}
          />
        )}

        {/* Render current story component directly as 2D */}
        <div className="h-full w-full"> {/* This div ensures the story component fills the available space */}
          <StoryComponent {...storyProps} />
        </div>

        {/* Chin Chin Logo - Conditionally rendered */}
        {!isSummaryInfographicStory && (
          <img
            src={logoSrc}
            alt="Logo Chin Chin"
            className="absolute bottom-4 left-4 z-10 w-14 h-auto p-1 md:w-20" // Ajustado a bottom-4 left-4 y tamaño reducido
          />
        )}

        {/* chinchin.com.ec/wrapped text - Conditionally rendered */}
        {!isSummaryInfographicStory && (
          <p className={cn("absolute bottom-4 right-4 z-10 text-xs md:text-sm font-bold", currentTextColor)}>
            chinchin.com.ec/wrapped
          </p>
        )}

        {/* Interaction Zone */}
        <StoryInteractionZone
          onNext={handleNextStory}
          onPrev={handlePrevStory}
          onPause={handlePauseStory}
          onResume={handleResumeStory}
          isPaused={isPaused}
        />
      </div>
    </div>
  );
};

export default WrappedDashboard;