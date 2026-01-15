import { useState } from "react";
import { Sparkles, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePlaylistDialogProps {
  onCreatePlaylist: (name: string) => void;
  topSongsCount: number;
}

export function CreatePlaylistDialog({ onCreatePlaylist, topSongsCount }: CreatePlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreatePlaylist(name.trim());
      setName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
          Create Top Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-primary" />
            Create Top Voted Playlist
          </DialogTitle>
          <DialogDescription>
            Create a new playlist with the {topSongsCount} most voted songs from the current selection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input
                id="playlist-name"
                placeholder="My Top Hits..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={!name.trim()}>
              <Sparkles className="w-4 h-4" />
              Create Playlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
