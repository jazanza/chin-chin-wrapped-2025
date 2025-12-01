interface WrappedOverlayProps {
  customerName: string;
  year: string;
  // dominantBeerCategory: string; // Removed
}

export const WrappedOverlay = ({ customerName, year }: WrappedOverlayProps) => {
  return (
    <div className="absolute top-8 left-8 z-10 text-white pointer-events-none font-sans max-w-[80%]">
      <h1
        className="text-[min(6vw,3.5rem)] font-bold text-white uppercase tracking-widest"
      >
        {customerName}
      </h1>
      <p
        className="text-[min(3vw,1.8rem)] font-bold text-white uppercase tracking-wide"
      >
        {year} Wrapped
      </p>
      {/* Removed dominant beer category display */}
    </div>
  );
};