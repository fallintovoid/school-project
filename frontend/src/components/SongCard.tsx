import { ThumbsUp, Music2 } from "lucide-react";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SongCardProps {
  song: Song;
  index: number;
  onVote: (songId: string) => void;
}

export function SongCard({ song, index, onVote }: SongCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = () => {
    setIsAnimating(true);
    onVote(song.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-secondary/60 transition-all duration-200 group animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
        {song.albumArt ? (
          <img 
            src={song.albumArt} 
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music2 className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors duration-200">
          {song.title}
        </h4>
        <p className="text-sm text-muted-foreground truncate">
          {song.artist}
        </p>
      </div>

      {song.duration && (
        <span className="text-sm text-muted-foreground hidden sm:block">
          {song.duration}
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className={cn(
          "text-sm font-semibold min-w-[2rem] text-center transition-all duration-200",
          song.hasVoted ? "text-vote-active" : "text-muted-foreground"
        )}>
          {song.votes}
        </span>
        
        <Button
          variant="vote"
          size="icon"
          data-voted={song.hasVoted}
          onClick={handleVote}
          className={cn(
            "relative",
            isAnimating && "animate-vote-pop"
          )}
        >
          <ThumbsUp className={cn(
            "w-4 h-4 transition-transform duration-200",
            song.hasVoted && "fill-current"
          )} />
        </Button>
      </div>
    </div>
  );
}
