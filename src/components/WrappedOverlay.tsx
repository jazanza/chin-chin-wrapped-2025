interface WrappedOverlayProps {
  customerName: string;
  year: string;
  dominantBeerCategory: string;
}

export const WrappedOverlay = ({ customerName, year, dominantBeerCategory }: WrappedOverlayProps) => {
  return (
    <div className="absolute top-8 left-8 z-10 text-white pointer-events-none font-sans max-w-[80%]">
      <h1
        className="text-[min(6vw,3.5rem)] font-bold glitch-text text-neon-magenta uppercase tracking-widest"
        data-text={customerName}
      >
        {customerName}
      </h1>
      <p
        className="text-[min(3vw,1.8rem)] font-bold glitch-text text-neon-cyan uppercase tracking-wide"
        data-text={`${year} Wrapped`}
      >
        {year} Wrapped
      </p>
      <p
        className="text-[min(2.5vw,1.5rem)] mt-2 text-gray-300"
      >
        Tu cerveza dominante: <span className="font-bold text-neon-magenta">{dominantBeerCategory}</span>
      </p>
    </div>
  );
};