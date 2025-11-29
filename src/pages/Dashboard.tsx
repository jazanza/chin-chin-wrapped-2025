import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDb } from "@/hooks/useDb";
import { BeerVisualizer } from "@/components/BeerVisualizer";
import { FlavorSpectrum } from "@/components/FlavorSpectrum";
import { VarietyBalance } from "@/components/VarietyBalance";
import { LoyaltyConstellation } from "@/components/LoyaltyConstellation";
import { Button } from "@/components/ui/button";

type ViewMode = "meter" | "spectrum" | "balance" | "loyalty";

const Dashboard = () => {
  const { consumptionMetrics, flavorData, varietyMetrics, loyaltyMetrics, loading, error } = useDb();
  const [viewMode, setViewMode] = useState<ViewMode>("meter");

  const renderVisualization = () => {
    switch (viewMode) {
      case "meter":
        return <BeerVisualizer {...consumptionMetrics} />;
      case "spectrum":
        return <FlavorSpectrum flavorData={flavorData} />;
      case "balance":
        return <VarietyBalance varietyMetrics={varietyMetrics} />;
      case "loyalty":
        return <LoyaltyConstellation loyaltyMetrics={loyaltyMetrics} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-2 bg-gray-800/50 rounded-lg flex gap-2">
        <Button onClick={() => setViewMode("meter")} variant={viewMode === "meter" ? "secondary" : "ghost"}>
          Consumption Meter
        </Button>
        <Button onClick={() => setViewMode("spectrum")} variant={viewMode === "spectrum" ? "secondary" : "ghost"}>
          Flavor Spectrum
        </Button>
        <Button onClick={() => setViewMode("balance")} variant={viewMode === "balance" ? "secondary" : "ghost"}>
          Variety Balance
        </Button>
        <Button onClick={() => setViewMode("loyalty")} variant={viewMode === "loyalty" ? "secondary" : "ghost"}>
          Loyalty Constellation
        </Button>
      </div>

      <div className="flex-grow">
        {loading && <p className="text-xl text-center pt-40">Connecting to the brewery...</p>}
        {error && <p className="text-xl text-red-500 text-center pt-40">Error: {error}</p>}
        {!loading && !error && (
          <Canvas shadows camera={{ position: [0, 1, 5], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            {renderVisualization()}
            <OrbitControls enableZoom={true} />
          </Canvas>
        )}
      </div>
    </div>
  );
};

export default Dashboard;