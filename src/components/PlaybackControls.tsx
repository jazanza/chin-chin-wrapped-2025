import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PlaybackControls = ({ isPlaying, onPlayPause, onNext, onPrev }: PlaybackControlsProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-background/80 backdrop-blur-sm border rounded-lg z-20">
      <Button onClick={onPrev} variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
        <SkipBack className="h-6 w-6" />
      </Button>
      <Button onClick={onPlayPause} variant="ghost" size="icon" className="text-primary hover:text-primary/90">
        {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
      </Button>
      <Button onClick={onNext} variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
        <SkipForward className="h-6 w-6" />
      </Button>
    </div>
  );
};