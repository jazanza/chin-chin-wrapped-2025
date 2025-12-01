interface NarrativeOverlayProps {
  title: string;
  range: string;
}

export const NarrativeOverlay = ({ title, range }: NarrativeOverlayProps) => {
  return (
    <div className="absolute top-8 left-8 z-10 pointer-events-none">
      <h1 className="text-5xl font-bold text-primary uppercase tracking-widest">
        {title}
      </h1>
      <p className="text-2xl font-bold text-foreground/80 uppercase tracking-wide">
        {range}
      </p>
    </div>
  );
};