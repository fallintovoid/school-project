import { Music, ChevronRight } from "lucide-react";
import { Playlist } from "@/types";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  playlist: Playlist;
  isSelected: boolean;
  onClick: () => void;
}

export function PlaylistCard({ playlist, isSelected, onClick }: PlaylistCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl glass transition-all duration-200 group text-left",
        "hover:bg-secondary/80 hover:border-primary/30",
        isSelected && "bg-secondary border-primary/50 shadow-lg shadow-primary/10"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-lg flex items-center justify-center transition-colors duration-200",
          isSelected ? "bg-primary/20" : "bg-muted"
        )}>
          {playlist.coverImage ? (
            <img 
              src={playlist.coverImage} 
              alt={playlist.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Music className={cn(
              "w-6 h-6 transition-colors duration-200",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-display font-semibold truncate transition-colors duration-200",
            isSelected ? "text-primary" : "text-foreground"
          )}>
            {playlist.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
          </p>
        </div>
        
        <ChevronRight className={cn(
          "w-5 h-5 transition-all duration-200",
          isSelected 
            ? "text-primary translate-x-0" 
            : "text-muted-foreground -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
        )} />
      </div>
    </button>
  );
}
