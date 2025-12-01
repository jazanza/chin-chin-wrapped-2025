interface WrappedOverlayProps {
  customerName: string;
  year: string;
  dominantBeerCategory: string;
}

export const WrappedOverlay = ({ customerName, year, dominantBeerCategory }: WrappedOverlayProps) => {
  return (
    <div className="absolute top-8 left-8 z-10 text-white pointer-events-none animate-text-glitch-in font-sans">
      <h1
        className="text-[min(6vw,3.5rem)] font-bold text-[var(--primary-glitch-pink)] uppercase tracking-widest"
        style={{ textShadow: "2px 2px var(--secondary-glitch-cyan)" }}
      >
        {customerName}
      </h1>
      <p
        className="text-[min(3vw,1.8rem)] font-bold text-[var(--secondary-glitch-cyan)] uppercase tracking-wide"
        style={{ textShadow: "1px 1px var(--primary-glitch-pink)" }}
      >
        {year} Wrapped
      </p>
      <p
        className="text-[min(2.5vw,1.5rem)] mt-2 text-gray-300"
      >
        Tu cerveza dominante: <span className="font-bold text-[var(--primary-glitch-pink)]">{dominantBeerCategory}</span>
      </p>
    </div>
  );
};