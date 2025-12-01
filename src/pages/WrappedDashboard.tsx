"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Canvas, useThree } from "@react-three/fiber";
import { useDb } from "@/hooks/useDb";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { ResponsiveCamera } from "@/components/ResponsiveCamera";
import { PostProcessingEffects } from "@/components/PostProcessingEffects";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { WrappedOverlay } from "@/components/WrappedOverlay";
import { WrappedMeter } from "@/components/WrappedMeter";
import { WrappedSpectrum } from "@/components/WrappedSpectrum";
import { WrappedTop5 } from "@/components/WrappedTop5";

// Componente auxiliar para la captura de pantalla
const ScreenshotHelper = ({ onScreenshotReady }: { onScreenshotReady: (dataUrl: string) => void }) => {
  const { gl } = useThree();
  const captureScreenshot = useCallback(() => {
    // No es necesario llamar a gl.render(gl.scene, gl.camera); aquí.
    // El canvas ya contiene la imagen renderizada del último frame.
    const dataUrl = gl.domElement.toDataURL('image/png');
    onScreenshotReady(dataUrl);
  }, [gl, onScreenshotReady]);

  // Exponer la función de captura para que el botón externo pueda llamarla
  useEffect(() => {
    (window as any).captureWrappedScreenshot = captureScreenshot;
    return () => {
      delete (window as any).captureWrappedScreenshot;
    };
  }, [captureScreenshot]);

  return null;
};

const WrappedDashboard = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getWrappedData, loading, error, dbLoaded } = useDb();
  const [wrappedData, setWrappedData] = useState<any>(null);
  const [toastId, setToastId] = useState<string | number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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
    link.download = `ChinChin_Wrapped_${wrappedData?.customerName || 'Cliente'}_2025.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("¡Wrapped descargado!");
    setIsCapturing(false);
  }, [wrappedData]);

  if (loading && !wrappedData) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-glitch-pink)]" />
        <p className="ml-4 text-lg text-[var(--secondary-glitch-cyan)]">Cargando tu Wrapped...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!wrappedData) {
    return null; // O un estado de carga más específico si es necesario
  }

  return (
    <div className="w-screen h-screen relative bg-black">
      <WrappedOverlay
        customerName={wrappedData.customerName}
        year={wrappedData.year}
        dominantBeerCategory={wrappedData.dominantBeerCategory}
      />

      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        className="w-full h-full"
        gl={{ preserveDrawingBuffer: true }} // Necesario para la captura de pantalla
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ResponsiveCamera viewMode="wrapped" /> {/* Nuevo viewMode para el Wrapped */}
        <PostProcessingEffects />

        <WrappedMeter totalLiters={wrappedData.totalLiters} position={[-3, 0, 0]} />
        <WrappedSpectrum flavorData={wrappedData.categoryVolumes} position={[3, 0, 0]} />
        <WrappedTop5 top5Products={wrappedData.top5Products} position={[0, -3, 0]} />

        <ScreenshotHelper onScreenshotReady={onScreenshotReady} />
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <Button
          onClick={handleDownloadScreenshot}
          className="bg-[var(--primary-glitch-pink)] hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          disabled={isCapturing}
        >
          {isCapturing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Capturando...
            </>
          ) : (
            "Descargar mi Wrapped"
          )}
        </Button>
      </div>
    </div>
  );
};

export default WrappedDashboard;