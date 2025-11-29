import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useDb } from "@/hooks/useDb";
import { BeerVisualizer } from "@/components/BeerVisualizer";

// Main Dashboard Page
const Dashboard = () => {
  const { liters, percentage, goal, loading, error } = useDb();

  return (
    <div className="w-screen h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      {loading && <p className="text-xl">Connecting to the brewery...</p>}
      {error && <p className="text-xl text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <Canvas shadows camera={{ position: [0, 1, 5], fov: 50 }}>
          <BeerVisualizer percentage={percentage} liters={liters} goal={goal} />
          <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      )}
    </div>
  );
};

export default Dashboard;