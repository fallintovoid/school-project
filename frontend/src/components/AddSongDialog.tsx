import { useState } from "react";
import { Plus, Music2 } from "lucide-react";
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

interface AddSongDialogProps {
  onAddSong: (song: { title: string; artist: string }) => void;
}

export function AddSongDialog({ onAddSong }: AddSongDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && artist.trim()) {
      onAddSong({ title: title.trim(), artist: artist.trim() });
      setTitle("");
      setArtist("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Song
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            Add New Song
          </DialogTitle>
          <DialogDescription>
            Add a new song to this playlist for others to vote on.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Song Title</Label>
              <Input
                id="title"
                placeholder="Enter song title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                placeholder="Enter artist name..."
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={!title.trim() || !artist.trim()}>
              Add Song
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
