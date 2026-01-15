import { ThumbsUp, Music2, Trash2 } from "lucide-react";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { songsApi, votesApi } from "@/lib/apiClient";

interface SongCardProps {
  song: Song;
  index: number;
  onRefresh: () => void | Promise<void>;
}

export function SongCard({ song, index, onRefresh }: SongCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    setIsAnimating(true);
    setIsSubmitting(true);
    try {
      if (song.userVoted) {
        await votesApi.unvote(song.id);
      } else {
        await votesApi.vote(song.id);
      }
      await onRefresh();
    } catch (error: any) {
      toast.error(error?.message || "Vote failed");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await songsApi.remove(song.id);
      toast.success("Song deleted");
      await onRefresh();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete song");
    } finally {
      setIsSubmitting(false);
    }
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
          {song.band}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className={cn(
          "text-sm font-semibold min-w-[2rem] text-center transition-all duration-200",
          song.userVoted ? "text-vote-active" : "text-muted-foreground"
        )}>
          {song.votes}
        </span>
        
        <Button
          variant="vote"
          size="icon"
          data-voted={song.userVoted}
          onClick={handleVote}
          disabled={isSubmitting}
          className={cn(
            "relative",
            isAnimating && "animate-vote-pop"
          )}
        >
          <ThumbsUp className={cn(
            "w-4 h-4 transition-transform duration-200",
            song.userVoted && "fill-current"
          )} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
